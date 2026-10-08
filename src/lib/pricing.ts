export const SHIPPING_CENTS = 590;
export const FREE_SHIPPING_THRESHOLD_CENTS = 7900;
// Prix affichés TTC ; les frais de port suivent le taux des produits.
export const VAT_RATE = 0.2;
export const MAX_QUANTITY_PER_LINE = 10;

export type PricedLine = { unitPriceCents: number; quantity: number };

export function computeTotals(lines: PricedLine[]) {
  const subtotalCents = lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
  const shippingCents =
    subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_CENTS;
  const totalCents = subtotalCents + shippingCents;
  const vatCents = Math.round(totalCents - totalCents / (1 + VAT_RATE));
  return { subtotalCents, shippingCents, totalCents, vatCents };
}

export function remainingForFreeShipping(subtotalCents: number) {
  return Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
}
