import Link from "next/link";
import { bestDiscount, fromPrice, isAvailable, type ProductWithVariants } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "./product-image";

export function ProductCard({ product }: { product: ProductWithVariants }) {
  const available = isAvailable(product);
  const discount = Math.round(bestDiscount(product) * 100);
  const compareAt = product.variants.find((v) => v.compareAtCents)?.compareAtCents;

  return (
    <article className="group relative flex flex-col bg-paper">
      <div className="relative">
        <ProductImage
          src={product.image}
          alt={product.name}
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="transition-opacity group-hover:opacity-90"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-blaze px-2 py-0.5 text-xs font-bold text-paper">−{discount} %</span>
        )}
        {!available && (
          <span className="absolute top-3 right-3 bg-ink px-2 py-0.5 text-xs font-semibold text-paper">Rupture</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-semibold tracking-wider text-khaki uppercase">{product.brand}</p>
        <h3 className="leading-snug font-semibold">
          <Link href={`/produits/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted">{product.tagline}</p>
        <p className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-lg font-bold">
            {product.variants.length > 1 && <span className="text-sm font-normal text-muted">dès </span>}
            {formatPrice(fromPrice(product))}
          </span>
          {compareAt && <s className="text-sm text-muted">{formatPrice(compareAt)}</s>}
        </p>
      </div>
    </article>
  );
}
