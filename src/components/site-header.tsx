import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getCartCount } from "@/lib/cart";
import { BagIcon, SearchIcon, UserIcon } from "./icons";
import { Logo } from "./logo";

const nav = [
  { href: "/foret", label: "Chasse" },
  { href: "/mer", label: "Chasse sous-marine" },
  { href: "/promos", label: "Promotions" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-forest text-paper">
      <p className="bg-ink py-1.5 text-center text-xs tracking-wide text-paper/80">
        Livraison offerte dès 79 €<span className="hidden sm:inline"> · Expédition sous 24 h · Retours gratuits 30 jours</span>
      </p>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-paper focus:text-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Aller au contenu
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Catalogue" className="hidden md:block">
          <ul className="flex gap-1 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="btn btn-ghost min-h-9">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link href="/recherche" className="btn btn-ghost min-h-9 text-sm" aria-label="Rechercher">
            <SearchIcon className="size-5" />
          </Link>
          <Suspense fallback={<AccountLinkView label="Compte" />}>
            <AccountLink />
          </Suspense>
          <Suspense fallback={<CartLinkView count={0} />}>
            <CartLink />
          </Suspense>
        </div>
      </div>
      <nav aria-label="Catalogue (mobile)" className="border-t border-paper/15 md:hidden">
        <ul className="flex justify-around text-sm">
          {nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="btn btn-ghost min-h-10 px-2 text-xs">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

async function AccountLink() {
  const user = await getCurrentUser();
  if (user?.role === "admin") {
    return (
      <>
        <Link href="/admin" className="btn btn-ghost hidden min-h-9 text-sm sm:inline-flex">
          Administration
        </Link>
        <AccountLinkView label="Mon compte" />
      </>
    );
  }
  return <AccountLinkView label={user ? "Mon compte" : "Se connecter"} />;
}

function AccountLinkView({ label }: { label: string }) {
  return (
    <Link href="/compte" className="btn btn-ghost min-h-9 text-sm" aria-label={label}>
      <UserIcon />
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}

async function CartLink() {
  return <CartLinkView count={await getCartCount()} />;
}

function CartLinkView({ count }: { count: number }) {
  return (
    <Link
      href="/panier"
      className="btn btn-ghost relative min-h-9 text-sm"
      aria-label={count > 0 ? `Panier, ${count} article${count > 1 ? "s" : ""}` : "Panier vide"}
    >
      <BagIcon />
      <span className="hidden lg:inline">Panier</span>
      {count > 0 && (
        <span className="absolute top-0 right-0 grid min-w-5 place-items-center rounded-full bg-blaze px-1 text-[0.6875rem] leading-5 font-bold text-paper lg:static">
          {count}
        </span>
      )}
    </Link>
  );
}
