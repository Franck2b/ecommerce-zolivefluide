import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Admin Affût & Apnée" },
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/commandes", label: "Commandes" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={null}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

// Le contrôle d'accès englobe tout l'habillage : un visiteur ne voit qu'une 404.
async function AdminShell({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-forest text-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="bg-blaze px-2 py-0.5 text-xs font-bold text-paper">ADMIN</span>
          </div>
          <nav aria-label="Administration">
            <ul className="flex gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="btn btn-ghost min-h-9 text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link href="/" className="ml-auto text-sm text-paper/80 underline-offset-4 hover:underline">
            Voir la boutique ↗
          </Link>
        </div>
      </header>
      <main id="contenu" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
