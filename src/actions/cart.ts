"use server";

import { and, eq, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { cartItems, variants } from "@/db/schema";
import { findCartId, getOrCreateCartId } from "@/lib/cart";
import { MAX_QUANTITY_PER_LINE } from "@/lib/pricing";
import { quantitySchema, uuidSchema } from "@/lib/validation";

export type CartActionState = { status: "idle" | "success" | "error"; message: string };

const addSchema = z.object({
  variantId: uuidSchema,
  quantity: quantitySchema.pipe(z.number().min(1)),
});

async function findSellableVariant(variantId: string) {
  return db.query.variants.findFirst({
    where: eq(variants.id, variantId),
    with: { product: { columns: { isPublished: true, name: true } } },
  });
}

export async function addToCart(_: CartActionState, formData: FormData): Promise<CartActionState> {
  const parsed = addSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: "Choisissez un format et une quantité valides." };

  const { variantId, quantity } = parsed.data;
  const variant = await findSellableVariant(variantId);
  if (!variant?.product.isPublished || variant.stock === 0) {
    return { status: "error", message: "Ce format n'est plus disponible." };
  }

  const cartId = await getOrCreateCartId();
  const ceiling = Math.min(variant.stock, MAX_QUANTITY_PER_LINE);
  const [line] = await db
    .insert(cartItems)
    .values({ cartId, variantId, quantity: Math.min(quantity, ceiling) })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.variantId],
      set: { quantity: sql`least(${cartItems.quantity} + ${quantity}, ${ceiling})` },
    })
    .returning({ quantity: cartItems.quantity });

  refresh();
  return line.quantity === ceiling
    ? {
        status: "success",
        message: `Ajouté. Votre panier contient le maximum disponible pour ce format (${line.quantity}).`,
      }
    : { status: "success", message: `${variant.product.name} ajoutée au panier.` };
}

const updateSchema = z.object({ variantId: uuidSchema, quantity: quantitySchema });

export async function updateCartItem(formData: FormData) {
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const { variantId, quantity } = parsed.data;
  const cartId = await findCartId();
  if (!cartId) return;
  const where = and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId));

  if (quantity === 0) {
    await db.delete(cartItems).where(where);
  } else {
    const variant = await findSellableVariant(variantId);
    const capped = Math.min(quantity, Math.max(variant?.stock ?? 0, 1));
    await db.update(cartItems).set({ quantity: capped }).where(where);
  }
  refresh();
}
