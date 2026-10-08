import Link from "next/link";
import { Suspense } from "react";
import { releaseAbandonedOrders } from "@/actions/admin";
import { StatusBadge } from "@/components/status-badge";
import { getDashboard, LOW_STOCK_THRESHOLD } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime, formatPrice } from "@/lib/format";

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-sm bg-line/60" />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  await requireAdmin();
  const data = await getDashboard();

  const kpis = [
    { label: "Chiffre d'affaires (30 j)", value: formatPrice(data.revenueCents) },
    { label: "Commandes payées (30 j)", value: String(data.paidOrders) },
    { label: "Panier moyen", value: formatPrice(data.averageBasketCents) },
    { label: "À expédier", value: String(data.toShip), href: "/admin/commandes?statut=paid", highlight: data.toShip > 0 },
  ];

  return (
    <>
      <h1 className="heading text-4xl">Tableau de bord</h1>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`panel p-5 ${kpi.highlight ? "bg-blaze-tint" : ""}`}>
            <dt className="text-sm text-ink-soft">{kpi.label}</dt>
            <dd className="mt-1 heading text-3xl">
              {kpi.href ? (
                <Link href={kpi.href} className="hover:underline">
                  {kpi.value}
                </Link>
              ) : (
                kpi.value
              )}
            </dd>
          </div>
        ))}
      </dl>

      {data.abandoned > 0 && (
        <form action={releaseAbandonedOrders} className="panel mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm">
            <strong>{data.abandoned}</strong> commande{data.abandoned > 1 ? "s" : ""} non payée
            {data.abandoned > 1 ? "s" : ""} depuis plus de 35 minutes bloque{data.abandoned > 1 ? "nt" : ""} du stock.
          </p>
          <button type="submit" className="btn btn-secondary min-h-9 text-sm">
            Annuler et remettre en stock
          </button>
        </form>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="dernieres">
          <div className="flex items-baseline justify-between">
            <h2 id="dernieres" className="heading text-2xl">
              Dernières commandes
            </h2>
            <Link href="/admin/commandes" className="text-sm font-medium underline underline-offset-4">
              Tout voir
            </Link>
          </div>
          <ul className="panel mt-4 divide-y divide-line">
            {data.latest.length === 0 && <li className="p-4 text-sm text-muted">Aucune commande pour le moment.</li>}
            {data.latest.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/commandes/${order.reference}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-stone"
                >
                  <span>
                    <span className="font-mono font-bold">{order.reference}</span>
                    <span className="block text-xs text-muted">
                      {order.fullName} · {formatDateTime(order.createdAt)}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="font-mono text-sm font-bold">{formatPrice(order.totalCents)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="stock-bas">
          <h2 id="stock-bas" className="heading text-2xl">
            Stock bas (≤ {LOW_STOCK_THRESHOLD})
          </h2>
          <ul className="panel mt-4 divide-y divide-line">
            {data.lowStock.length === 0 && <li className="p-4 text-sm text-muted">Tous les stocks sont confortables.</li>}
            {data.lowStock.map((row) => (
              <li key={`${row.productId}-${row.label}`}>
                <Link href={`/admin/produits/${row.productId}`} className="flex justify-between gap-3 p-3 text-sm hover:bg-stone">
                  <span>
                    {row.name} <span className="text-muted">({row.label})</span>
                  </span>
                  <span className={`font-mono font-bold ${row.stock === 0 ? "text-danger" : "text-blaze-deep"}`}>
                    {row.stock === 0 ? "Rupture" : row.stock}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
