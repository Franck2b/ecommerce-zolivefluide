import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductEditor } from "@/components/admin/product-editor";
import { getAllCategories } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Nouveau produit" };

export default function NewProductPage() {
  return (
    <>
      <h1 className="heading text-4xl">Nouveau produit</h1>
      <p className="mt-2 text-ink-soft">Il reste en brouillon tant que « En ligne » n&apos;est pas coché.</p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-[40rem] animate-pulse rounded-sm bg-line/60" />}>
          <Editor />
        </Suspense>
      </div>
    </>
  );
}

async function Editor() {
  await requireAdmin();
  return <ProductEditor categories={await getAllCategories()} />;
}
