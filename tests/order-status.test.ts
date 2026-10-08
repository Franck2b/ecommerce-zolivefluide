import { describe, expect, it } from "vitest";
import { canTransition, releasesStock } from "@/lib/order-status";

describe("cycle de vie d'une commande", () => {
  it("suit le parcours paiement → expédition → livraison", () => {
    expect(canTransition("pending_payment", "paid")).toBe(true);
    expect(canTransition("paid", "shipped")).toBe(true);
    expect(canTransition("shipped", "delivered")).toBe(true);
  });

  it("interdit les retours en arrière et les sauts d'étape", () => {
    expect(canTransition("pending_payment", "shipped")).toBe(false);
    expect(canTransition("delivered", "paid")).toBe(false);
    expect(canTransition("cancelled", "paid")).toBe(false);
    expect(canTransition("shipped", "cancelled")).toBe(false);
  });

  it("remet en stock uniquement les annulations avant expédition", () => {
    expect(releasesStock("pending_payment", "cancelled")).toBe(true);
    expect(releasesStock("paid", "cancelled")).toBe(true);
    expect(releasesStock("paid", "shipped")).toBe(false);
  });
});
