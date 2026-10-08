import { expect, test } from "@playwright/test";

test("un visiteur crée son compte et achète un masque", async ({ page }) => {
  await page.goto("/produits/masque-posidonie-faible-volume");
  await page.getByRole("button", { name: /Ajouter au panier/ }).click();
  await expect(page.getByRole("status")).toContainText("ajoutée au panier");

  await page.getByRole("link", { name: "Voir le panier" }).click();
  await expect(page.getByRole("heading", { name: "Panier" })).toBeVisible();
  await page.getByRole("link", { name: "Passer commande" }).click();

  await expect(page).toHaveURL(/\/connexion/);
  await page.getByRole("link", { name: "Créer un compte" }).click();
  await page.getByLabel("Prénom et nom").fill("Camille Test");
  await page.getByLabel("E-mail").fill(`e2e-${Date.now()}@affut-apnee.test`);
  await page.getByLabel("Mot de passe").fill("mot-de-passe-e2e");
  await page.getByRole("button", { name: "Créer mon compte" }).click();

  await expect(page).toHaveURL(/\/commande$/);
  await page.getByLabel("Adresse", { exact: true }).fill("12 rue des Chênes");
  await page.getByLabel("Code postal").fill("13008");
  await page.getByLabel("Ville").fill("Marseille");
  await page.getByLabel(/Téléphone/).fill("0612345678");
  await page.getByRole("button", { name: /Continuer vers le paiement|Payer par carte/ }).click();

  await expect(page.getByRole("heading", { name: "Paiement simulé" })).toBeVisible();
  await page.getByRole("button", { name: /^Payer/ }).click();
  await expect(page.getByText("Commande confirmée")).toBeVisible();
});

test("l'espace d'administration est invisible pour un visiteur", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
  await expect(page.getByText("Tableau de bord")).toHaveCount(0);
});
