import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { updateOrderStatus } from "@/actions/admin";
import { ConfirmButton } from "@/components/confirm-button";
import { OrderSummary } from "@/components/order-summary";
import { OrderTimeline } from "@/components/order-timeline";
import { StatusBadge } from "@/components/status-badge";
import { getAdminOrder } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { nextStatuses } from "@/lib/order-status";

export const metadata: Metadata = { title: "Commande" };

type Props = PageProps<"/admin/commandes/[reference]">;

const errors: Record<string, string> = {
  suivi: "Saisissez le numéro de suivi avant de marquer la commande comme expédiée.",
  transition: "Le statut de la commande a changé entre-temps. Vérifiez son état avant de recommencer.",
};

export default function AdminOrderPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-sm bg-line/60" />}>
      <AdminOrder params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminOrder({ params, searchParams }: Props) {
  await requireAdmin();
  const { reference } = await params;
  const { erreur } = await searchParams;
  const order = await getAdminOrder(reference);
  if (!order) notFound();
  const actions = nextStatuses(order.status);

  return (
    <>
      <Link href="/admin/commandes" className="text-sm font-medium underline underline-offset-4">
        ← Commandes
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="heading text-4xl">{order.reference}</h1>
        <StatusBadge status={order.status} />
      </div>
      {typeof erreur === "string" && errors[erreur] && (
        <p role="alert" className="mt-6 rounded-sm border-2 border-danger bg-danger-tint px-4 py-3 text-sm font-medium text-danger">
          {errors[erreur]}
        </p>
      )}

      <div className="mt-6">
        <OrderTimeline order={order} />
      </div>

      {actions.some((a) => a !== "paid") && (
        <section aria-labelledby="actions" className="panel mt-6 flex flex-wrap items-end gap-4 p-5">
          <h2 id="actions" className="sr-only">
            Actions
          </h2>
          {actions.includes("shipped") && (
            <form action={updateOrderStatus} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="reference" value={order.reference} />
              <input type="hidden" name="to" value="shipped" />
              <div>
                <label htmlFor="trackingNumber" className="label">
                  N° de suivi Colissimo
                </label>
                <input id="trackingNumber" name="trackingNumber" required className="field min-h-10" placeholder="6A12345678901" />
              </div>
              <button type="submit" className="btn btn-primary min-h-10">
                Marquer expédiée
              </button>
            </form>
          )}
          {actions.includes("delivered") && (
            <form action={updateOrderStatus}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="reference" value={order.reference} />
              <input type="hidden" name="to" value="delivered" />
              <button type="submit" className="btn btn-primary min-h-10">
                Marquer livrée
              </button>
            </form>
          )}
          {actions.includes("cancelled") && (
            <form action={updateOrderStatus} className="ml-auto">
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="reference" value={order.reference} />
              <input type="hidden" name="to" value="cancelled" />
              <ConfirmButton
                message={
                  order.status === "paid"
                    ? "Annuler cette commande payée ? Les articles reviendront en stock ; le remboursement se fait depuis le tableau de bord Stripe."
                    : "Annuler cette commande ? Les articles reviendront en stock."
                }
                className="btn btn-ghost min-h-10 text-danger"
              >
                Annuler la commande
              </ConfirmButton>
            </form>
          )}
        </section>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_18rem]">
        <ul className="panel divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 p-4 text-sm">
              <span>
                <strong>{item.productName}</strong> <span className="text-muted">({item.variantLabel})</span>
                <span className="block text-muted">
                  {item.quantity} × {formatPrice(item.unitPriceCents)}
                </span>
              </span>
              <span className="font-mono font-bold">{formatPrice(item.unitPriceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-6">
          <div className="panel p-5">
            <OrderSummary {...order} />
          </div>
          <div className="panel p-5 text-sm">
            <p className="mb-2 heading text-lg">Client</p>
            <p>{order.user.name}</p>
            <p className="text-muted">{order.email}</p>
            <address className="mt-3 not-italic">
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
            {order.stripeSessionId && <p className="mt-3 font-mono text-xs break-all text-muted">Stripe : {order.stripeSessionId}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
