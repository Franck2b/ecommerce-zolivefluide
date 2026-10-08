import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductImage } from "@/components/product-image";
import { ProductCard } from "@/components/product-card";
import { ProductPurchase } from "@/components/product-purchase";
import { getCatalog, getProduct } from "@/lib/catalog";
import { env } from "@/lib/env";
import { formatPrice, universes } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/pricing";

export async function generateMetadata({ params }: PageProps<"/produits/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.tagline} ${product.description}`.slice(0, 160),
    alternates: { canonical: `/produits/${product.slug}` },
  };
}

export default function ProductPage({ params }: PageProps<"/produits/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-[40rem] max-w-7xl" />}>
      <ProductDetails params={params} />
    </Suspense>
  );
}

async function ProductDetails({ params }: { params: PageProps<"/produits/[slug]">["params"] }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const universe = universes[product.category.universe];
  const inStock = product.variants.some((v) => v.stock > 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    image: `${env.APP_URL}${product.image}`,
    sku: product.variants[0].sku,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: Math.min(...product.variants.map((v) => v.priceCents)) / 100,
      highPrice: Math.max(...product.variants.map((v) => v.priceCents)) / 100,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${env.APP_URL}/produits/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-20 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
        <ol className="flex flex-wrap gap-1.5">
          <li>
            <Link href={universe.href} className="hover:text-ink hover:underline">
              {universe.label}
            </Link>{" "}
            /
          </li>
          <li>
            <Link href={`${universe.href}?categorie=${product.category.slug}`} className="hover:text-ink hover:underline">
              {product.category.name}
            </Link>{" "}
            /
          </li>
          <li aria-current="page" className="text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductImage
          src={product.image}
          alt={product.name}
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          className="lg:sticky lg:top-28 lg:self-start"
        />

        <div>
          <p className="eyebrow">{product.brand}</p>
          <h1 className="mt-2 heading text-4xl leading-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-3 text-lg text-ink-soft">{product.tagline}</p>

          <div className="mt-6">
            <ProductPurchase
              variants={product.variants.map(({ id, label, priceCents, compareAtCents, stock }) => ({
                id,
                label,
                priceCents,
                compareAtCents,
                stock,
              }))}
            />
          </div>

          <aside aria-labelledby="mot-du-guide" className="mt-8 border-l-4 border-blaze bg-paper p-5">
            <h2 id="mot-du-guide" className="heading text-xl">
              Le conseil du terrain
            </h2>
            <p className="mt-2 leading-relaxed">{product.tip}</p>
          </aside>

          <section aria-labelledby="description" className="mt-10">
            <h2 id="description" className="heading text-2xl">
              En détail
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{product.description}</p>
            {product.specs.length > 0 && (
              <dl className="mt-6 divide-y divide-line border-y border-line">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-4 py-3 text-sm">
                    <dt className="text-muted">{spec.label}</dt>
                    <dd className="text-right font-mono font-bold">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <ul className="mt-6 space-y-1 text-sm text-ink-soft">
              <li>Livraison offerte dès {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)}</li>
              <li>Retours gratuits pendant 30 jours</li>
            </ul>
          </section>
        </div>
      </div>

      <Related categorySlug={product.category.slug} universe={product.category.universe} excludeId={product.id} />
    </div>
  );
}

async function Related({
  categorySlug,
  universe,
  excludeId,
}: {
  categorySlug: string;
  universe: "foret" | "mer";
  excludeId: string;
}) {
  const sameCategory = await getCatalog({ universe, category: categorySlug, sort: "nouveautes" });
  const others = await getCatalog({ universe, sort: "nouveautes" });
  const related = [...sameCategory, ...others]
    .filter((p, i, list) => p.id !== excludeId && list.findIndex((q) => q.id === p.id) === i)
    .slice(0, 4);
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="associes" className="mt-20">
      <h2 id="associes" className="heading text-3xl">
        Dans le même rayon
      </h2>
      <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
