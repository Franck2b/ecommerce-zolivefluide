import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { cancelOrder, resumePayment } from "@/actions/checkout";
import { OrderSummary } from "@/components/order-summary";
import { OrderTimeline } from "@/components/order-timeline";
import { ProductImage } from "@/components/product-image";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { getUserOrder } from "@/lib/orders";

export const metadata: Metadata = { title: "Ma commande", robots: { index: false } };

type Props = PageProps<"/compte/commandes/[reference]">;

export default function OrderPage({ params, searchParams }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-sm bg-line/60" />}>
        <OrderDetails params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function OrderDetails({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  const { reference } = await params;
  const { confirmation, expiree } = await searchParams;
  const user = await requireUser(`/compte/commandes/${reference}`);
  const order = await getUserOrder(user.id, reference);
  if (!order) notFound();

  const pending = order.status === "pending_payment";

  return (
    <>
      <Link href="/compte" className="text-sm font-medium underline underline-offset-4">
        ← Mes commandes
      </Link>

      {confirmation && order.status === "paid" && (
        <div role="status" className="mt-6 border-l-4 border-success bg-success-tint p-6">
          <p className="heading text-3xl">Commande confirmée</p>
          <p className="mt-1">
            Paiement reçu, merci {user.name.split(" ")[0]}. On prépare votre colis, vous recevrez le numéro de suivi
            dès l&apos;expédition.
          </p>
        </div>
      )}
      {confirmation && pending && (
        <p role="status" className="panel mt-6 bg-sand p-4 text-sm">
          Paiement en cours de confirmation par la banque. Cette page se mettra à jour dans quelques instants.
        </p>
      )}
      {expiree && (
        <p role="alert" className="mt-6 rounded-sm border-2 border-danger bg-danger-tint p-4 text-sm font-medium text-danger">
          La session de paiement a expiré. Annulez cette commande puis repassez-la depuis la boutique.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="heading text-4xl">Commande {order.reference}</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-6">
        <OrderTimeline order={order} />
      </div>

      {order.trackingNumber && (
        <p className="mt-4 text-sm">
          Numéro de suivi Colissimo : <span className="font-mono font-bold">{order.trackingNumber}</span>
        </p>
      )}

      {pending && (
        <div className="panel mt-6 flex flex-wrap items-center justify-between gap-4 bg-blaze-tint p-5">
          <p className="text-sm">Cette commande attend son paiement. Les articles restent réservés 30 minutes.</p>
          <div className="flex flex-wrap gap-2">
            <form action={resumePayment}>
              <input type="hidden" name="reference" value={order.reference} />
              <button type="submit" className="btn btn-primary">
                Payer {formatPrice(order.totalCents)}
              </button>
            </form>
            <form action={cancelOrder}>
              <input type="hidden" name="reference" value={order.reference} />
              <button type="submit" className="btn btn-secondary">
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_18rem]">
        <ul className="panel divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4">
              <ProductImage src={item.image} alt="" sizes="64px" className="size-16 shrink-0" />
              <div className="min-w-0 flex-1">
                <Link href={`/produits/${item.productSlug}`} className="font-bold hover:underline">
                  {item.productName}
                </Link>
                <p className="text-sm text-muted">
                  {item.variantLabel} · {item.quantity} × {formatPrice(item.unitPriceCents)}
                </p>
              </div>
              <p className="font-mono font-bold">{formatPrice(item.unitPriceCents * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-6">
          <div className="panel p-5">
            <OrderSummary {...order} />
          </div>
          <address className="panel p-5 text-sm not-italic">
            <p className="mb-2 heading text-lg">Livraison</p>
            {order.fullName}
            <br />
            {order.addressLine1}
            {order.addressLine2 && (
              <>
                <br />
                {order.addressLine2}
              </>
            )}
            <br />
            {order.postalCode} {order.city}
            <br />
            {order.phone}
          </address>
        </div>
      </div>
    </>
  );
}
