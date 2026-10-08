import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogListing, CatalogSkeleton } from "@/components/catalog-listing";
import { PageBanner } from "@/components/page-banner";

export const metadata: Metadata = {
  title: "Promos",
  description: "Les promotions du moment en équipement de chasse et de chasse sous-marine.",
};

export default function PromosPage({ searchParams }: PageProps<"/promos">) {
  return (
    <>
      <PageBanner title="Promotions" text="Les prix barrés du moment, dans la limite des stocks." image="/images/ambiance/equipement.jpg" />
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogListing searchParams={searchParams} basePath="/promos" onSale />
        </Suspense>
      </div>
    </>
  );
}
