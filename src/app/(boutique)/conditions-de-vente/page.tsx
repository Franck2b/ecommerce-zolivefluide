import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function TermsPage() {
  return (
    <ProsePage title="Conditions de vente">
      <p>Boutique de démonstration réalisée dans le cadre d&apos;un projet pédagogique : aucune commande n&apos;est expédiée ni facturée.</p>
      <h2>Prix et paiement</h2>
      <p>Les prix sont indiqués en euros toutes taxes comprises (TVA 20 %). Le paiement s&apos;effectue par carte bancaire via Stripe ; les articles sont réservés 30 minutes le temps du paiement.</p>
      <h2>Livraison</h2>
      <p>Livraison en France métropolitaine par Colissimo sous 48 h. Frais de port de 5,90 €, offerts dès 79 € d&apos;achat.</p>
      <h2>Rétractation et retours</h2>
      <p>Vous disposez de 30 jours après réception pour retourner un article non utilisé dans son emballage d&apos;origine. Les frais de retour sont offerts.</p>
      <h2>Produits réglementés</h2>
      <p>Affût &amp; Apnée ne vend ni armes à feu ni munitions. La pratique de la chasse sous-marine est interdite aux moins de 16 ans et soumise à la réglementation locale.</p>
    </ProsePage>
  );
}
