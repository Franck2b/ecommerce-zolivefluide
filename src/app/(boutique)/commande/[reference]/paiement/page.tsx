import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { cancelOrder, simulatePayment } from "@/actions/checkout";
import { requireUser } from "@/lib/auth";
import { isProduction } from "@/lib/env";
import { formatPrice } from "@/lib/format";
import { getUserOrder } from "@/lib/orders";
import { stripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Paiement", robots: { index: false } };

export default function PaymentPage({ params }: PageProps<"/commande/[reference]/paiement">) {
  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <Suspense fallback={<div className="h-80 animate-pulse rounded-sm bg-line/60" />}>
        <SimulatedPayment params={params} />
      </Suspense>
    </div>
  );
}

async function SimulatedPayment({ params }: { params: PageProps<"/commande/[reference]/paiement">["params"] }) {
  if (isProduction || stripe) notFound();
  const { reference } = await params;
  const user = await requireUser(`/commande/${reference}/paiement`);
  const order = await getUserOrder(user.id, reference);
  if (!order) notFound();
  if (order.status !== "pending_payment") redirect(`/compte/commandes/${reference}`);

  return (
    <div className="panel p-6 sm:p-8">
      <p className="eyebrow">Mode démonstration</p>
      <h1 className="mt-2 heading text-3xl">Paiement simulé</h1>
      <p className="mt-3 text-ink-soft">
        Stripe n&apos;est pas configuré sur cet environnement : ce bouton simule un paiement accepté. Ajoutez
        une clé de test Stripe pour passer par le vrai formulaire de carte.
      </p>
      <p className="mt-6 flex justify-between border-y border-line py-3 font-bold">
        <span>Commande {order.reference}</span>
        <span className="font-mono">{formatPrice(order.totalCents)}</span>
      </p>
      <form action={simulatePayment} className="mt-6">
        <input type="hidden" name="reference" value={order.reference} />
        <button type="submit" className="btn btn-primary w-full">
          Payer {formatPrice(order.totalCents)}
        </button>
      </form>
      <form action={cancelOrder} className="mt-3 text-center">
        <input type="hidden" name="reference" value={order.reference} />
        <button type="submit" className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-danger">
          Annuler la commande
        </button>
      </form>
    </div>
  );
}
