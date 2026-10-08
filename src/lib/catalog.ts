import "server-only";
import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { categories, products, type Category, type Product, type Universe, type Variant } from "@/db/schema";

export const CATALOG_TAG = "catalog";

export type ProductWithVariants = Product & { variants: Variant[]; category: Category };

export const sortOptions = {
  nouveautes: "Nouveautés",
  "prix-asc": "Prix croissant",
  "prix-desc": "Prix décroissant",
  promos: "Promos d'abord",
} as const;

export type SortOption = keyof typeof sortOptions;

export type CatalogFilters = {
  universe?: Universe;
  category?: string;
  query?: string;
  onSale?: boolean;
  sort: SortOption;
};

export function fromPrice(product: ProductWithVariants) {
  return Math.min(...product.variants.map((v) => v.priceCents));
}

export function bestDiscount(product: ProductWithVariants) {
  return Math.max(
    0,
    ...product.variants.map((v) => (v.compareAtCents ? 1 - v.priceCents / v.compareAtCents : 0)),
  );
}

export function isAvailable(product: ProductWithVariants) {
  return product.variants.some((v) => v.stock > 0);
}

export async function getCategories(universe?: Universe) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  return db.query.categories.findMany({
    where: universe ? eq(categories.universe, universe) : undefined,
    orderBy: asc(categories.position),
  });
}

export async function getCatalog({ universe, category, query, onSale, sort }: CatalogFilters) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const categoryIds = (await getCategories(universe))
    .filter((c) => !category || c.slug === category)
    .map((c) => c.id);
  if (categoryIds.length === 0) return [];

  const search = query ? `%${query.replace(/[%_\\]/g, "\\$&")}%` : undefined;
  const list = await db.query.products.findMany({
    where: and(
      eq(products.isPublished, true),
      inArray(products.categoryId, categoryIds),
      search
        ? or(ilike(products.name, search), ilike(products.brand, search), ilike(products.tagline, search))
        : undefined,
    ),
    with: {
      variants: { orderBy: (v) => asc(v.position) },
      category: true,
    },
    orderBy: [desc(products.createdAt), asc(products.name)],
  });

  const sellable = list.filter((p) => p.variants.length > 0 && (!onSale || bestDiscount(p) > 0));
  if (sort === "prix-asc") return sellable.sort((a, b) => fromPrice(a) - fromPrice(b));
  if (sort === "prix-desc") return sellable.sort((a, b) => fromPrice(b) - fromPrice(a));
  if (sort === "promos") return sellable.sort((a, b) => bestDiscount(b) - bestDiscount(a));
  return sellable;
}

export async function getFeatured() {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const list = await db.query.products.findMany({
    where: and(eq(products.isPublished, true), eq(products.isFeatured, true)),
    with: { variants: { orderBy: (v) => asc(v.position) }, category: true },
    orderBy: asc(products.name),
  });
  return list.filter((p) => p.variants.length > 0);
}

export async function getProduct(slug: string) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isPublished, true)),
    with: { variants: { orderBy: (v) => asc(v.position) }, category: true },
  });
  return product?.variants.length ? product : null;
}
