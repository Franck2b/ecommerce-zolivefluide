import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";
import { photoCredits } from "@/lib/photo-credits";

export const metadata: Metadata = { title: "Crédits photos" };

export default function CreditsPage() {
  return (
    <ProsePage title="Crédits photos">
      <p>
        Les packshots produits ont été générés pour ce projet ; les deux photos de la page d&apos;accueil ont été fournies par l&apos;équipe. Les
        photos ci-dessous sont publiées sous licence libre ; merci à leurs auteurs.
      </p>
      <ul className="divide-y divide-line border-y border-line">
        {photoCredits.map((credit) => (
          <li key={credit.file} className="py-3 text-sm">
            <span className="font-semibold text-ink">« {credit.title} »</span> par {credit.author} — {credit.license} —{" "}
            <a href={credit.source} className="underline underline-offset-4" rel="noopener noreferrer">
              source
            </a>
          </li>
        ))}
      </ul>
    </ProsePage>
  );
}
