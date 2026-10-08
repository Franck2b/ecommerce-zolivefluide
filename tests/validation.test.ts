import { describe, expect, it } from "vitest";
import { addressSchema, productInputSchema, signUpSchema } from "@/lib/validation";

const address = {
  fullName: "Camille Martin",
  addressLine1: "12 rue des Chênes",
  addressLine2: "",
  postalCode: "13008",
  city: "Marseille",
  phone: "06 12 34 56 78",
};

describe("addressSchema", () => {
  it("normalise le téléphone et le complément vide", () => {
    const parsed = addressSchema.parse(address);
    expect(parsed.phone).toBe("0612345678");
    expect(parsed.addressLine2).toBeNull();
  });

  it("refuse un code postal hors métropole", () => {
    expect(addressSchema.safeParse({ ...address, postalCode: "97400" }).success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("normalise l'e-mail et exige 10 caractères de mot de passe", () => {
    expect(signUpSchema.parse({ name: "Camille", email: " Camille@Exemple.FR ", password: "0123456789" }).email).toBe(
      "camille@exemple.fr",
    );
    expect(signUpSchema.safeParse({ name: "Camille", email: "c@e.fr", password: "court" }).success).toBe(false);
  });
});

describe("productInputSchema", () => {
  const product = {
    name: "Masque",
    slug: "masque-test",
    brand: "Posidonie",
    tagline: "Faible volume",
    description: "Une description suffisamment longue.",
    tip: "Un conseil de terrain utile.",
    categoryId: "8f1c3b0e-1d2a-4c5b-9e6f-7a8b9c0d1e2f",
    image: "/images/produits/masque.jpg",
    isPublished: true,
    isFeatured: false,
    specs: [],
    variants: [{ label: "Unique", sku: "aa-test-1", priceCents: 6900, compareAtCents: "", stock: 3 }],
  };

  it("accepte un produit valide et met le SKU en majuscules", () => {
    const parsed = productInputSchema.parse(product);
    expect(parsed.variants[0].sku).toBe("AA-TEST-1");
    expect(parsed.variants[0].compareAtCents).toBeNull();
  });

  it("refuse un prix barré inférieur au prix de vente", () => {
    const invalid = { ...product, variants: [{ ...product.variants[0], compareAtCents: 5000 }] };
    expect(productInputSchema.safeParse(invalid).success).toBe(false);
  });
});
