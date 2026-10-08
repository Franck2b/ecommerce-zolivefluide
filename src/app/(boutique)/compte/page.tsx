import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/actions/auth";
import { ArrowIcon } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { getUserOrders } from "@/lib/orders";

export const metadata: Metadata = { title: "Mon compte", robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-sm bg-line/60" />}>
        <Account />
      </Suspense>
    </div>
  );
}

async function Account() {
  const user = await requireUser("/compte");
  const orders = await getUserOrders(user.id);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Mon compte</p>
          <h1 className="mt-2 heading text-4xl">Bonjour {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-ink-soft">{user.email}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="btn btn-secondary">
            Se déconnecter
          </button>
        </form>
      </div>

      <section aria-labelledby="commandes" className="mt-12">
        <h2 id="commandes" className="heading text-2xl">
          Mes commandes
        </h2>
        {orders.length === 0 ? (
          <div className="panel mt-5 p-8 text-center">
            <p className="text-ink-soft">Vous n&apos;avez pas encore passé de commande.</p>
            <Link href="/" className="btn btn-primary mt-5">
              Découvrir le catalogue <ArrowIcon />
            </Link>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/compte/commandes/${order.reference}`}
                  className="panel flex flex-wrap items-center justify-between gap-3 p-4 transition-transform hover:-translate-y-0.5 sm:p-5"
                >
                  <div>
                    <p className="font-mono font-bold">{order.reference}</p>
                    <p className="text-sm text-muted">
                      {formatDate(order.createdAt)} · {order.items.reduce((n, i) => n + i.quantity, 0)} article
                      {order.items.reduce((n, i) => n + i.quantity, 0) > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={order.status} />
                    <span className="font-mono font-bold">{formatPrice(order.totalCents)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
