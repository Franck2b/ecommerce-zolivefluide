"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { findCartId } from "@/lib/cart";
import { CATALOG_TAG } from "@/lib/catalog";
import { isProduction } from "@/lib/env";
import { cancelExpiredOrders, CheckoutError, getUserOrder, placeOrder, transitionOrder } from "@/lib/orders";
import { createCheckoutSession, stripe } from "@/lib/stripe";
import { addressSchema, fieldErrors, type FieldErrors } from "@/lib/validation";

export type CheckoutState = { error?: string; fields?: FieldErrors };

const paymentAvailable = () => Boolean(stripe) || !isProduction;

export async function checkout(_: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?suite=/commande");
  if (!paymentAvailable()) return { error: "Le paiement est momentanément indisponible. Réessayez plus tard." };

  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fields: fieldErrors(parsed.error) };

  const cartId = await findCartId();
  if (!cartId) redirect("/panier");

  await cancelExpiredOrders();

  let placed: Awaited<ReturnType<typeof placeOrder>>;
  try {
    placed = await placeOrder(user, cartId, parsed.data);
  } catch (error) {
    if (error instanceof CheckoutError) return { error: error.message };
    throw error;
  }
  updateTag(CATALOG_TAG);

  if (!stripe) redirect(`/commande/${placed.order.reference}/paiement`);

  let paymentUrl: string | null;
  try {
    const session = await createCheckoutSession(stripe, placed.order, placed.lines);
    await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, placed.order.id));
    paymentUrl = session.url;
  } catch (error) {
    console.error("Création de la session Stripe impossible", error);
    paymentUrl = null;
  }
  if (!paymentUrl) {
    await transitionOrder(placed.order.id, "cancelled");
    updateTag(CATALOG_TAG);
    return { error: "Le service de paiement ne répond pas. Votre panier a été vidé : réessayez dans un instant depuis vos commandes." };
  }
  redirect(paymentUrl);
}

async function ownPendingOrder(reference: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  const order = await getUserOrder(user.id, reference);
  return order?.status === "pending_payment" ? order : null;
}

/** Paiement simulé : uniquement hors production, quand Stripe n'est pas configuré. */
export async function simulatePayment(formData: FormData) {
  if (isProduction || stripe) throw new Error("Paiement simulé indisponible.");
  const order = await ownPendingOrder(String(formData.get("reference")));
  if (!order) redirect("/compte");
  await transitionOrder(order.id, "paid");
  redirect(`/compte/commandes/${order.reference}?confirmation=1`);
}

export async function resumePayment(formData: FormData) {
  const order = await ownPendingOrder(String(formData.get("reference")));
  if (!order) redirect("/compte");
  if (!stripe) redirect(`/commande/${order.reference}/paiement`);

  const session = order.stripeSessionId ? await stripe.checkout.sessions.retrieve(order.stripeSessionId) : null;
  if (session?.status === "open" && session.url) redirect(session.url);
  redirect(`/compte/commandes/${order.reference}?expiree=1`);
}

export async function cancelOrder(formData: FormData) {
  const order = await ownPendingOrder(String(formData.get("reference")));
  if (order) {
    if (stripe && order.stripeSessionId) {
      await stripe.checkout.sessions.expire(order.stripeSessionId).catch(() => undefined);
    }
    await transitionOrder(order.id, "cancelled");
    updateTag(CATALOG_TAG);
  }
  redirect(`/compte/commandes/${String(formData.get("reference"))}`);
}
