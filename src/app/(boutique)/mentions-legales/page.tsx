import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalPage() {
  return (
    <ProsePage title="Mentions légales">
      <p>Site réalisé dans le cadre d&apos;un projet pédagogique à l&apos;EEMI. Affût &amp; Apnée et les marques citées sont fictives.</p>
      <h2>Données personnelles</h2>
      <p>Les données collectées (nom, e-mail, adresse de livraison) servent uniquement au traitement des commandes de démonstration. Les mots de passe sont stockés hachés (argon2id) et ne sont jamais lisibles.</p>
      <h2>Cookies</h2>
      <p>Le site n&apos;utilise que des cookies strictement nécessaires : session de connexion et panier. Aucun cookie de mesure d&apos;audience ou publicitaire.</p>
    </ProsePage>
  );
}
