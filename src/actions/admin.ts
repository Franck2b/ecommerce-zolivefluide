"use server";

import { and, eq, notInArray } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { products, variants, type OrderStatus } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { cancelExpiredOrders, InvalidTransitionError, transitionOrder } from "@/lib/orders";
import { fieldErrors, productInputSchema, uuidSchema, type FieldErrors } from "@/lib/validation";

export type ProductFormState = { error?: string; fields?: FieldErrors };

function isUniqueViolation(error: unknown, constraint: string) {
  const cause = (error as { cause?: { code?: string; constraint_name?: string } })?.cause ?? error;
  const pg = cause as { code?: string; constraint_name?: string };
  return pg.code === "23505" && pg.constraint_name?.includes(constraint);
}

export async function saveProduct(_: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  const productId = uuidSchema.optional().catch(undefined).parse(formData.get("productId") || undefined);
  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload")));
  } catch {
    return { error: "Formulaire illisible, rechargez la page." };
  }
  const parsed = productInputSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Certains champs sont à corriger.", fields: fieldErrors(parsed.error) };
  }

  const { variants: variantInputs, ...product } = parsed.data;
  let savedId: string;
  try {
    savedId = await db.transaction(async (tx) => {
      const [saved] = productId
        ? await tx.update(products).set(product).where(eq(products.id, productId)).returning({ id: products.id })
        : await tx.insert(products).values(product).returning({ id: products.id });
      if (!saved) throw new Error("Produit introuvable.");

      const keptIds = variantInputs.flatMap((v) => (v.id ? [v.id] : []));
      await tx
        .delete(variants)
        .where(and(eq(variants.productId, saved.id), keptIds.length ? notInArray(variants.id, keptIds) : undefined));

      for (const [position, { id, ...variant }] of variantInputs.entries()) {
        if (id) {
          await tx
            .update(variants)
            .set({ ...variant, position })
            .where(and(eq(variants.id, id), eq(variants.productId, saved.id)));
        } else {
          await tx.insert(variants).values({ ...variant, position, productId: saved.id });
        }
      }
      return saved.id;
    });
  } catch (error) {
    if (isUniqueViolation(error, "slug")) return { fields: { slug: ["Ce slug est déjà utilisé par un autre produit."] } };
    if (isUniqueViolation(error, "sku")) return { error: "Une référence (SKU) est déjà utilisée par un autre produit." };
    throw error;
  }

  updateTag(CATALOG_TAG);
  // Recharger la page renvoie les identifiants des nouvelles variantes à l'éditeur.
  redirect(`/admin/produits/${savedId}?enregistre=1`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = uuidSchema.parse(formData.get("productId"));
  await db.delete(products).where(eq(products.id, id));
  updateTag(CATALOG_TAG);
  redirect("/admin/produits");
}

const transitionSchema = z.object({
  orderId: z.uuid(),
  reference: z.string().regex(/^AA-[A-Z0-9]{6}$/),
  to: z.enum(["shipped", "delivered", "cancelled"] satisfies OrderStatus[]),
  trackingNumber: z.string().trim().max(40).optional(),
});

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const { orderId, reference, to, trackingNumber } = transitionSchema.parse(Object.fromEntries(formData));
  const page = `/admin/commandes/${reference}`;
  if (to === "shipped" && !trackingNumber) redirect(`${page}?erreur=suivi`);

  try {
    await transitionOrder(orderId, to, to === "shipped" ? { trackingNumber } : {});
  } catch (error) {
    if (!(error instanceof InvalidTransitionError)) throw error;
    redirect(`${page}?erreur=transition`);
  }
  if (to === "cancelled") updateTag(CATALOG_TAG);
  redirect(page);
}

export async function releaseAbandonedOrders() {
  await requireAdmin();
  if ((await cancelExpiredOrders()) > 0) updateTag(CATALOG_TAG);
}
