import type { Order } from "@/db/schema";
import { formatDateTime } from "@/lib/format";

const steps = [
  { key: "createdAt", label: "Commande passée" },
  { key: "paidAt", label: "Paiement reçu" },
  { key: "shippedAt", label: "Colis expédié" },
  { key: "deliveredAt", label: "Livré" },
] as const;

export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return (
      <p className="rounded-sm border border-line bg-line/50 p-4 text-sm">
        Commande annulée{order.cancelledAt && <> le {formatDateTime(order.cancelledAt)}</>}. Aucun montant n&apos;a été
        conservé et les articles ont été remis en stock.
      </p>
    );
  }

  return (
    <ol className="grid gap-3 sm:grid-cols-4">
      {steps.map((step) => {
        const date = order[step.key];
        return (
          <li key={step.key} className={`rounded-sm border-2 p-3 ${date ? "border-ink bg-sand" : "border-dashed border-line text-muted"}`}>
            <p className="text-sm font-bold">{step.label}</p>
            <p className="font-mono text-xs">{date ? formatDateTime(date) : "À venir"}</p>
          </li>
        );
      })}
    </ol>
  );
}
