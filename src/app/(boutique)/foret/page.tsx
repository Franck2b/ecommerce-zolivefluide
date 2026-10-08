import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogListing, CatalogSkeleton } from "@/components/catalog-listing";
import { PageBanner } from "@/components/page-banner";
import { universes } from "@/lib/format";

export const metadata: Metadata = {
  title: "Chasse",
  description: "Optiques, appeaux, vêtements de battue, coutellerie et matériel d'affût.",
};

export default function Page({ searchParams }: PageProps<"/foret">) {
  return (
    <>
      <PageBanner title={universes.foret.label} text={universes.foret.pitch} image="/images/ambiance/cerf.jpg" eyebrow="Forêt, plaine, marais" />
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogListing searchParams={searchParams} basePath="/foret" universe="foret" />
        </Suspense>
      </div>
    </>
  );
}
