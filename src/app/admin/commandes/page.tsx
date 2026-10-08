import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StatusBadge } from "@/components/status-badge";
import { orderStatus, type OrderStatus } from "@/db/schema";
import { getAdminOrders } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime, formatPrice, orderStatusLabels } from "@/lib/format";

export const metadata: Metadata = { title: "Commandes" };

export default function AdminOrdersPage({ searchParams }: PageProps<"/admin/commandes">) {
  return (
    <>
      <h1 className="heading text-4xl">Commandes</h1>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-sm bg-line/60" />}>
        <Orders searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Orders({ searchParams }: { searchParams: PageProps<"/admin/commandes">["searchParams"] }) {
  await requireAdmin();
  const { statut } = await searchParams;
  const status = orderStatus.enumValues.find((s) => s === statut) as OrderStatus | undefined;
  const orders = await getAdminOrders(status);

  return (
    <>
      <nav aria-label="Filtrer par statut" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {[undefined, ...orderStatus.enumValues].map((s) => (
            <li key={s ?? "toutes"}>
              <Link
                href={s ? `/admin/commandes?statut=${s}` : "/admin/commandes"}
                aria-current={status === s ? "page" : undefined}
                className="btn min-h-9 border border-line bg-paper text-sm aria-[current=page]:bg-ink aria-[current=page]:text-paper"
              >
                {s ? orderStatusLabels[s] : "Toutes"}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="panel mt-6 overflow-x-auto">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-line bg-stone">
            <tr>
              <th scope="col" className="p-3">Référence</th>
              <th scope="col" className="p-3">Client</th>
              <th scope="col" className="p-3">Date</th>
              <th scope="col" className="p-3">Articles</th>
              <th scope="col" className="p-3">Statut</th>
              <th scope="col" className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted">
                  Aucune commande {status ? `« ${orderStatusLabels[status].toLowerCase()} »` : ""} pour le moment.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-stone">
                <td className="p-3">
                  <Link href={`/admin/commandes/${order.reference}`} className="font-mono font-bold underline-offset-4 hover:underline">
                    {order.reference}
                  </Link>
                </td>
                <td className="p-3">
                  {order.fullName}
                  <span className="block text-xs text-muted">{order.email}</span>
                </td>
                <td className="p-3 whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                <td className="p-3">{order.items.reduce((n, i) => n + i.quantity, 0)}</td>
                <td className="p-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="p-3 text-right font-mono font-bold">{formatPrice(order.totalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
