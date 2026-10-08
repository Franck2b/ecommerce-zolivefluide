import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD_CENTS, SHIPPING_CENTS } from "@/lib/pricing";
import { Logo } from "./logo";

const linkClass = "text-paper/85 underline-offset-4 hover:text-paper hover:underline";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-forest text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-paper/80">
            Équipement de chasse et de chasse sous-marine sélectionné par des pratiquants. Chaque produit est
            testé sur le terrain avant d&apos;entrer au catalogue.
          </p>
          <p className="mt-4 text-sm text-paper/80">
            Nous ne vendons ni armes à feu ni munitions : leur vente est réglementée et se fait en armurerie.
          </p>
        </div>
        <div>
          <h2 className="eyebrow text-paper/60!">Livraison</h2>
          <ul className="mt-4 space-y-2 text-sm text-paper/85">
            <li>Colissimo en 48 h, France métropolitaine</li>
            <li>
              {formatPrice(SHIPPING_CENTS)}, offerte dès {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)}
            </li>
            <li>Retours gratuits sous 30 jours</li>
          </ul>
        </div>
        <div>
          <h2 className="eyebrow text-paper/60!">La boutique</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className={linkClass} href="/foret">Chasse</Link></li>
            <li><Link className={linkClass} href="/mer">Chasse sous-marine</Link></li>
            <li><Link className={linkClass} href="/credits-photos">Crédits photos</Link></li>
            <li><Link className={linkClass} href="/conditions-de-vente">Conditions de vente</Link></li>
            <li><Link className={linkClass} href="/mentions-legales">Mentions légales</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/15">
        <p className="mx-auto max-w-7xl px-4 py-5 font-mono text-[0.6875rem] text-paper/60 sm:px-6 lg:px-8">
          Projet pédagogique EEMI — boutique de démonstration, aucune commande n&apos;est expédiée.
        </p>
      </div>
    </footer>
  );
}
