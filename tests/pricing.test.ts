import { describe, expect, it } from "vitest";
import { computeTotals, FREE_SHIPPING_THRESHOLD_CENTS, remainingForFreeShipping, SHIPPING_CENTS } from "@/lib/pricing";

describe("computeTotals", () => {
  it("ajoute les frais de port sous le seuil de gratuité", () => {
    const totals = computeTotals([{ unitPriceCents: 3490, quantity: 1 }]);
    expect(totals).toMatchObject({ subtotalCents: 3490, shippingCents: SHIPPING_CENTS, totalCents: 3490 + SHIPPING_CENTS });
  });

  it("offre la livraison à partir du seuil", () => {
    const totals = computeTotals([{ unitPriceCents: FREE_SHIPPING_THRESHOLD_CENTS, quantity: 1 }]);
    expect(totals.shippingCents).toBe(0);
  });

  it("ne facture pas de port pour un panier vide", () => {
    expect(computeTotals([])).toEqual({ subtotalCents: 0, shippingCents: 0, totalCents: 0, vatCents: 0 });
  });

  it("extrait la TVA à 20 % d'un total TTC", () => {
    expect(computeTotals([{ unitPriceCents: 12000, quantity: 1 }]).vatCents).toBe(2000);
  });

  it("multiplie le prix par la quantité", () => {
    expect(computeTotals([{ unitPriceCents: 1990, quantity: 3 }]).subtotalCents).toBe(5970);
  });
});

describe("remainingForFreeShipping", () => {
  it("ne descend jamais sous zéro", () => {
    expect(remainingForFreeShipping(FREE_SHIPPING_THRESHOLD_CENTS + 500)).toBe(0);
    expect(remainingForFreeShipping(FREE_SHIPPING_THRESHOLD_CENTS - 100)).toBe(100);
  });
});
