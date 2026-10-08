import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogListing, CatalogSkeleton } from "@/components/catalog-listing";
import { PageBanner } from "@/components/page-banner";
import { universes } from "@/lib/format";

export const metadata: Metadata = {
  title: "Chasse sous-marine",
  description: "Fusils harpons, masques, palmes, combinaisons et matériel de sécurité pour la chasse sous-marine.",
};

export default function Page({ searchParams }: PageProps<"/mer">) {
  return (
    <>
      <PageBanner title={universes.mer.label} text={universes.mer.pitch} image="/images/ambiance/hero-surface.jpg" eyebrow="Apnée, roches, pleine eau" />
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogListing searchParams={searchParams} basePath="/mer" universe="mer" />
        </Suspense>
      </div>
    </>
  );
}
