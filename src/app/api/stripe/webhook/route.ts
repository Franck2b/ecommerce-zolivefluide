import { revalidateTag } from "next/cache";
import type Stripe from "stripe";
import { CATALOG_TAG } from "@/lib/catalog";
import { env } from "@/lib/env";
import { InvalidTransitionError, transitionOrder } from "@/lib/orders";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Stripe non configuré", { status: 404 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      request.headers.get("stripe-signature") ?? "",
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return new Response("Signature invalide", { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId && session.payment_status === "paid") {
      try {
        await transitionOrder(orderId, "paid", { stripeSessionId: session.id });
      } catch (error) {
        if (!(error instanceof InvalidTransitionError)) throw error;
        // Paiement arrivé après l'annulation (commande expirée côté boutique) : on rembourse.
        if (typeof session.payment_intent === "string") {
          await stripe.refunds.create({ payment_intent: session.payment_intent }, { idempotencyKey: `refund-${orderId}` });
        }
      }
    }
  }

  if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
    const orderId = event.data.object.metadata?.orderId;
    if (orderId) {
      // Une commande déjà payée ne s'annule pas : la transition refusée est ignorée.
      await transitionOrder(orderId, "cancelled").catch((error) => {
        if (!(error instanceof InvalidTransitionError)) throw error;
      });
      revalidateTag(CATALOG_TAG, "max");
    }
  }

  return Response.json({ received: true });
}
