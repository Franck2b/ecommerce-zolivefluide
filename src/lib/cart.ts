import "server-only";
import { and, eq, isNull, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { cartItems, carts } from "@/db/schema";
import { getCurrentUser } from "./auth";
import { isProduction } from "./env";
import { computeTotals, MAX_QUANTITY_PER_LINE } from "./pricing";
import { uuidSchema } from "./validation";

const CART_COOKIE = "zf_cart";

export type CartLine = {
  variantId: string;
  quantity: number;
  stock: number;
  unitPriceCents: number;
  label: string;
  product: { name: string; slug: string; image: string; isPublished: boolean };
  problem: "unavailable" | "insufficient_stock" | null;
};

export type Cart = Awaited<ReturnType<typeof getCart>>;

async function guestCartId() {
  const value = (await cookies()).get(CART_COOKIE)?.value;
  return uuidSchema.safeParse(value).success ? value! : null;
}

export async function findCartId() {
  const user = await getCurrentUser();
  if (user) {
    const cart = await db.query.carts.findFirst({
      columns: { id: true },
      where: eq(carts.userId, user.id),
    });
    return cart?.id ?? null;
  }
  const id = await guestCartId();
  if (!id) return null;
  const cart = await db.query.carts.findFirst({
    columns: { id: true },
    where: and(eq(carts.id, id), isNull(carts.userId)),
  });
  return cart?.id ?? null;
}

export async function getCart() {
  const id = await findCartId();
  const items = id
    ? await db.query.cartItems.findMany({
        where: eq(cartItems.cartId, id),
        orderBy: (i, { asc }) => asc(i.addedAt),
        with: { variant: { with: { product: true } } },
      })
    : [];

  const lines: CartLine[] = items.map(({ quantity, variant }) => ({
    variantId: variant.id,
    quantity,
    stock: variant.stock,
    unitPriceCents: variant.priceCents,
    label: variant.label,
    product: {
      name: variant.product.name,
      slug: variant.product.slug,
      image: variant.product.image,
      isPublished: variant.product.isPublished,
    },
    problem:
      !variant.product.isPublished || variant.stock === 0
        ? "unavailable"
        : quantity > variant.stock
          ? "insufficient_stock"
          : null,
  }));

  return {
    id,
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    hasProblems: lines.some((l) => l.problem),
    ...computeTotals(lines.filter((l) => !l.problem)),
  };
}

export async function getCartCount() {
  const id = await findCartId();
  if (!id) return 0;
  const [row] = await db
    .select({ count: sql<number>`coalesce(sum(${cartItems.quantity}), 0)::int` })
    .from(cartItems)
    .where(eq(cartItems.cartId, id));
  return row.count;
}

/** À n'appeler que depuis une Server Action : peut poser un cookie. */
export async function getOrCreateCartId() {
  const existing = await findCartId();
  if (existing) return existing;

  const user = await getCurrentUser();
  // `on conflict` : deux requêtes simultanées d'un même utilisateur partagent le même panier.
  const [cart] = await db
    .insert(carts)
    .values({ userId: user?.id ?? null })
    .onConflictDoUpdate({ target: carts.userId, set: { updatedAt: new Date() } })
    .returning({ id: carts.id });

  if (!user) {
    (await cookies()).set(CART_COOKIE, cart.id, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 60,
    });
  }
  return cart.id;
}

/** Rattache le panier invité à l'utilisateur qui vient de se connecter. */
export async function adoptGuestCart(userId: string) {
  const guestId = await guestCartId();
  (await cookies()).delete(CART_COOKIE);
  if (!guestId) return;

  await db.transaction(async (tx) => {
    const guest = await tx.query.carts.findFirst({
      where: and(eq(carts.id, guestId), isNull(carts.userId)),
    });
    if (!guest) return;

    const owned = await tx.query.carts.findFirst({ where: eq(carts.userId, userId) });
    if (!owned) {
      await tx.update(carts).set({ userId }).where(eq(carts.id, guestId));
      return;
    }

    await tx.execute(sql`
      insert into cart_items (cart_id, variant_id, quantity)
      select ${owned.id}, variant_id, quantity from cart_items where cart_id = ${guestId}
      on conflict (cart_id, variant_id)
      do update set quantity = least(cart_items.quantity + excluded.quantity, ${MAX_QUANTITY_PER_LINE})
    `);
    await tx.delete(carts).where(eq(carts.id, guestId));
  });
}
