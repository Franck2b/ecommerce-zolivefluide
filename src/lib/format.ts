import type { OrderStatus, Universe } from "@/db/schema";

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const dates = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });
const dateTimes = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

export const formatPrice = (cents: number) => euros.format(cents / 100);
export const formatDate = (date: Date) => dates.format(date);
export const formatDateTime = (date: Date) => dateTimes.format(date);

export function discountPercent(priceCents: number, compareAtCents: number | null) {
  return compareAtCents ? Math.round((1 - priceCents / compareAtCents) * 100) : 0;
}

export const universes: Record<Universe, { label: string; href: string; pitch: string }> = {
  foret: {
    label: "Chasse",
    href: "/foret",
    pitch: "Optiques, appeaux, vêtements de traque, coutellerie et équipement d'affût.",
  },
  mer: {
    label: "Chasse sous-marine",
    href: "/mer",
    pitch: "Fusils harpons, masques, palmes, combinaisons et matériel de sécurité pour l'apnée.",
  },
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_payment: "En attente de paiement",
  paid: "Payée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};
