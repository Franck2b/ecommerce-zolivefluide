import "server-only";
import { randomInt } from "node:crypto";
import { and, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { db, type Tx } from "@/db";
import { cartItems, orderItems, orders, variants, type OrderStatus } from "@/db/schema";
import type { CurrentUser } from "./auth";
import { canTransition, releasesStock } from "./order-status";
import { computeTotals } from "./pricing";
import type { addressSchema } from "./validation";
import type { z } from "zod";

// Une session Stripe vit 30 min ; on garde 5 min de marge pour un webhook en retard.
export const CHECKOUT_SESSION_TTL_MS = 30 * 60 * 1000;
const PAYMENT_WINDOW_MS = CHECKOUT_SESSION_TTL_MS + 5 * 60 * 1000;

export class CheckoutError extends Error {}
export class InvalidTransitionError extends Error {}

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function newReference() {
  return `AA-${Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")}`;
}

/**
 * Transforme le panier en commande : prix figés, stock réservé, panier vidé,
 * le tout dans une transaction pour qu'aucune unité ne soit vendue deux fois.
 */
export async function placeOrder(
  user: CurrentUser,
  cartId: string,
  address: z.output<typeof addressSchema>,
) {
  return db.transaction(async (tx) => {
    const items = await tx.query.cartItems.findMany({
      where: eq(cartItems.cartId, cartId),
      with: { variant: { with: { product: true } } },
    });
    if (items.length === 0) throw new CheckoutError("Votre panier est vide.");

    // Ordre de verrouillage stable : deux commandes simultanées ne peuvent pas s'interbloquer.
    items.sort((a, b) => a.variantId.localeCompare(b.variantId));
    for (const { variant, quantity } of items) {
      const [reserved] = await tx
        .update(variants)
        .set({ stock: sql`${variants.stock} - ${quantity}` })
        .where(and(eq(variants.id, variant.id), gte(variants.stock, quantity)))
        .returning({ id: variants.id });
      if (!reserved || !variant.product.isPublished) {
        throw new CheckoutError(
          `Il ne reste plus assez de « ${variant.product.name} » pour votre commande. Ajustez votre panier.`,
        );
      }
    }

    const lines = items.map(({ variant, quantity }) => ({
      variantId: variant.id,
      productName: variant.product.name,
      productSlug: variant.product.slug,
      variantLabel: variant.label,
      image: variant.product.image,
      unitPriceCents: variant.priceCents,
      quantity,
    }));

    const [order] = await tx
      .insert(orders)
      .values({
        reference: newReference(),
        userId: user.id,
        email: user.email,
        ...address,
        ...computeTotals(lines),
      })
      .returning();

    await tx.insert(orderItems).values(lines.map((line) => ({ ...line, orderId: order.id })));
    await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));

    return { order, lines };
  });
}

async function restock(tx: Tx, orderId: string) {
  const items = await tx.query.orderItems.findMany({ where: eq(orderItems.orderId, orderId) });
  for (const item of items) {
    if (!item.variantId) continue;
    await tx
      .update(variants)
      .set({ stock: sql`${variants.stock} + ${item.quantity}` })
      .where(eq(variants.id, item.variantId));
  }
}

const statusTimestamps: Partial<Record<OrderStatus, keyof typeof orders.$inferInsert>> = {
  paid: "paidAt",
  shipped: "shippedAt",
  delivered: "deliveredAt",
  cancelled: "cancelledAt",
};

/**
 * Seul point d'entrée pour changer le statut d'une commande.
 * Le verrou `for update` évite qu'un webhook et une action admin se croisent.
 */
export async function transitionOrder(
  orderId: string,
  to: OrderStatus,
  extra: { trackingNumber?: string; stripeSessionId?: string } = {},
) {
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
    if (!order) return null;
    if (order.status === to) return order;
    if (!canTransition(order.status, to)) {
      throw new InvalidTransitionError(`Transition interdite : ${order.status} → ${to}`);
    }

    if (releasesStock(order.status, to)) await restock(tx, order.id);

    const timestamp = statusTimestamps[to];
    const [updated] = await tx
      .update(orders)
      .set({ status: to, ...(timestamp ? { [timestamp]: new Date() } : {}), ...extra })
      .where(eq(orders.id, order.id))
      .returning();
    return updated;
  });
}

/** Libère le stock des commandes abandonnées avant paiement. */
export async function cancelExpiredOrders() {
  const expired = await db
    .select({ id: orders.id })
    .from(orders)
    .where(
      and(
        eq(orders.status, "pending_payment"),
        lt(orders.createdAt, new Date(Date.now() - PAYMENT_WINDOW_MS)),
      ),
    );
  for (const { id } of expired) await transitionOrder(id, "cancelled");
  return expired.length;
}

export async function getUserOrders(userId: string) {
  return db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: desc(orders.createdAt),
    with: { items: true },
  });
}

export async function getUserOrder(userId: string, reference: string) {
  return db.query.orders.findFirst({
    where: and(eq(orders.userId, userId), eq(orders.reference, reference)),
    with: { items: true },
  });
}

export async function getLastShippingAddress(userId: string) {
  return db.query.orders.findFirst({
    columns: {
      fullName: true,
      addressLine1: true,
      addressLine2: true,
      postalCode: true,
      city: true,
      phone: true,
    },
    where: and(eq(orders.userId, userId), inArray(orders.status, ["paid", "shipped", "delivered"])),
    orderBy: desc(orders.createdAt),
  });
}
