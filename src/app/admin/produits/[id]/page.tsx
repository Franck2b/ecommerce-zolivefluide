import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteProduct } from "@/actions/admin";
import { ProductEditor } from "@/components/admin/product-editor";
import { ConfirmButton } from "@/components/confirm-button";
import { getAdminProduct, getAllCategories } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { uuidSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "Modifier un produit" };

type Props = PageProps<"/admin/produits/[id]">;

export default function EditProductPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<div className="h-[40rem] animate-pulse rounded-sm bg-line/60" />}>
      <Editor params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Editor({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const { enregistre } = await searchParams;
  if (!uuidSchema.safeParse(id).success) notFound();
  const [product, categories] = await Promise.all([getAdminProduct(id), getAllCategories()]);
  if (!product) notFound();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/produits" className="text-sm font-medium underline underline-offset-4">
            ← Produits
          </Link>
          <h1 className="mt-2 heading text-4xl">{product.name}</h1>
        </div>
        <div className="flex gap-2">
          {product.isPublished && (
            <Link href={`/produits/${product.slug}`} className="btn btn-secondary min-h-9 text-sm">
              Voir en boutique ↗
            </Link>
          )}
          <form action={deleteProduct}>
            <input type="hidden" name="productId" value={product.id} />
            <ConfirmButton
              message={`Supprimer définitivement « ${product.name} » ? Pour le retirer temporairement, décochez plutôt « En ligne ».`}
              className="btn btn-ghost min-h-9 text-sm text-danger"
            >
              Supprimer
            </ConfirmButton>
          </form>
        </div>
      </div>
      {enregistre && (
        <p role="status" className="mt-6 rounded-sm border-2 border-success bg-success-tint px-4 py-3 text-sm font-medium text-success">
          Produit enregistré, la boutique est à jour.
        </p>
      )}
      <div className="mt-8">
        <ProductEditor
          key={product.updatedAt.getTime()}
          product={product}
          categories={categories}
        />
      </div>
    </>
  );
}
