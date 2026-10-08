import type { OrderStatus } from "@/db/schema";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return transitions[from].includes(to);
}

export function nextStatuses(from: OrderStatus) {
  return transitions[from];
}

// Le stock est réservé à la commande : il revient en rayon tant que rien n'est parti.
export function releasesStock(from: OrderStatus, to: OrderStatus) {
  return to === "cancelled" && (from === "pending_payment" || from === "paid");
}
