import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout-form";
import { OrderSummary } from "@/components/order-summary";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { getLastShippingAddress } from "@/lib/orders";
import { stripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Commande", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <h1 className="heading text-5xl">Commande</h1>
      <Suspense fallback={<div className="mt-8 h-[32rem] animate-pulse rounded-sm bg-line/60" />}>
        <Checkout />
      </Suspense>
    </div>
  );
}

async function Checkout() {
  const user = await requireUser("/commande");
  const cart = await getCart();
  if (cart.lines.length === 0 || cart.hasProblems) redirect("/panier");
  const lastAddress = await getLastShippingAddress(user.id);

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="panel p-6 sm:p-8">
        <p className="mb-6 text-sm text-ink-soft">
          Commande au nom de <strong className="text-ink">{user.name}</strong> ({user.email})
        </p>
        <CheckoutForm
          defaults={lastAddress ?? { fullName: user.name, addressLine1: "", addressLine2: null, postalCode: "", city: "", phone: "" }}
          payLabel={`${stripe ? "Payer par carte" : "Continuer vers le paiement"} · ${formatPrice(cart.totalCents)}`}
        />
      </div>
      <aside className="panel p-6 lg:sticky lg:top-24" aria-labelledby="recap">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="recap" className="heading text-2xl">
            Votre sac
          </h2>
          <Link href="/panier" className="text-sm font-medium underline underline-offset-4">
            Modifier
          </Link>
        </div>
        <ul className="mb-5 space-y-2 border-b border-line pb-4 text-sm">
          {cart.lines.map((line) => (
            <li key={line.variantId} className="flex justify-between gap-3">
              <span>
                {line.quantity} × {line.product.name} <span className="text-muted">({line.label})</span>
              </span>
              <span className="font-mono">{formatPrice(line.unitPriceCents * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <OrderSummary {...cart} />
      </aside>
    </div>
  );
}
