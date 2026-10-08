import "server-only";
import Stripe from "stripe";
import type { Order } from "@/db/schema";
import { env } from "./env";
import { CHECKOUT_SESSION_TTL_MS } from "./orders";

export const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

type Line = { productName: string; variantLabel: string; unitPriceCents: number; quantity: number };

export async function createCheckoutSession(client: Stripe, order: Order, lines: Line[]) {
  const session = await client.checkout.sessions.create(
    {
      mode: "payment",
      locale: "fr",
      customer_email: order.email,
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      expires_at: Math.floor((Date.now() + CHECKOUT_SESSION_TTL_MS) / 1000),
      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: "eur",
          unit_amount: line.unitPriceCents,
          product_data: { name: `${line.productName} — ${line.variantLabel}` },
        },
      })),
      shipping_options:
        order.shippingCents > 0
          ? [
              {
                shipping_rate_data: {
                  display_name: "Colissimo, 48 h",
                  type: "fixed_amount",
                  fixed_amount: { amount: order.shippingCents, currency: "eur" },
                },
              },
            ]
          : undefined,
      success_url: `${env.APP_URL}/compte/commandes/${order.reference}?confirmation=1`,
      cancel_url: `${env.APP_URL}/compte/commandes/${order.reference}`,
    },
    { idempotencyKey: `checkout-${order.id}` },
  );
  return session;
}
