import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogListing, CatalogSkeleton } from "@/components/catalog-listing";

export const metadata: Metadata = {
  title: "Recherche",
  robots: { index: false },
};

export default function SearchPage({ searchParams }: PageProps<"/recherche">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <h1 className="heading text-5xl">Recherche</h1>
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogListing searchParams={searchParams} basePath="/recherche" withSearch />
      </Suspense>
    </div>
  );
}
