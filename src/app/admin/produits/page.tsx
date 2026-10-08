import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductImage } from "@/components/product-image";
import { getAdminProducts } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Produits" };

export default function AdminProductsPage() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="heading text-4xl">Produits</h1>
        <Link href="/admin/produits/nouveau" className="btn btn-primary">
          Nouveau produit
        </Link>
      </div>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-sm bg-line/60" />}>
        <ProductsTable />
      </Suspense>
    </>
  );
}

async function ProductsTable() {
  await requireAdmin();
  const rows = await getAdminProducts();

  return (
    <div className="panel mt-8 overflow-x-auto">
      <table className="w-full min-w-[44rem] text-left text-sm">
        <thead className="border-b border-line bg-stone">
          <tr>
            <th scope="col" className="p-3">Produit</th>
            <th scope="col" className="p-3">Catégorie</th>
            <th scope="col" className="p-3">Variantes</th>
            <th scope="col" className="p-3 text-right">Stock</th>
            <th scope="col" className="p-3 text-right">Prix dès</th>
            <th scope="col" className="p-3">État</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-stone">
              <td className="p-3">
                <Link href={`/admin/produits/${row.id}`} className="flex items-center gap-3 font-semibold hover:underline">
                  <ProductImage src={row.image} alt="" sizes="40px" className="size-10 shrink-0" />
                  <span>
                    {row.name}
                    <span className="block text-xs font-normal text-muted">{row.brand}</span>
                  </span>
                </Link>
              </td>
              <td className="p-3">{row.category}</td>
              <td className="p-3">{row.variantCount}</td>
              <td className={`p-3 text-right font-mono ${row.stock === 0 ? "font-bold text-danger" : ""}`}>{row.stock}</td>
              <td className="p-3 text-right font-mono">{row.minPrice ? formatPrice(row.minPrice) : "—"}</td>
              <td className="p-3">
                <span className="flex flex-wrap gap-1">
                  {row.isPublished ? (
                    <span className="rounded-full bg-success-tint px-2 py-0.5 text-xs font-semibold">En ligne</span>
                  ) : (
                    <span className="rounded-full bg-line px-2 py-0.5 text-xs font-semibold">Brouillon</span>
                  )}
                  {row.isFeatured && <span className="rounded-full bg-blaze-tint px-2 py-0.5 text-xs font-semibold">Coup de cœur</span>}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
