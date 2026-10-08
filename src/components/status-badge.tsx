import type { OrderStatus } from "@/db/schema";
import { orderStatusLabels } from "@/lib/format";

const styles: Record<OrderStatus, string> = {
  pending_payment: "bg-blaze-tint",
  paid: "bg-sand",
  shipped: "bg-sand",
  delivered: "bg-success-tint",
  cancelled: "bg-line/60 text-ink-soft",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full border border-line px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${styles[status]}`}>
      {orderStatusLabels[status]}
    </span>
  );
}
