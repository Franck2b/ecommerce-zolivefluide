import Form from "next/form";
import Link from "next/link";
import { z } from "zod";
import type { Universe } from "@/db/schema";
import { getCatalog, getCategories, sortOptions, type SortOption } from "@/lib/catalog";
import { SearchIcon } from "./icons";
import { ProductCard } from "./product-card";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
  basePath: string;
  universe?: Universe;
  onSale?: boolean;
  withSearch?: boolean;
};

const sortKeys = Object.keys(sortOptions) as [SortOption, ...SortOption[]];

const paramsSchema = z.object({
  categorie: z.string().max(60).optional().catch(undefined),
  q: z.string().trim().max(60).optional().catch(undefined),
  tri: z.enum(sortKeys).catch("nouveautes"),
});

type Params = z.infer<typeof paramsSchema>;

function hrefWith(basePath: string, current: Params, patch: Partial<Params>) {
  const next = { ...current, ...patch };
  const query = new URLSearchParams();
  if (next.categorie) query.set("categorie", next.categorie);
  if (next.q) query.set("q", next.q);
  if (next.tri !== "nouveautes") query.set("tri", next.tri);
  const qs = query.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export async function CatalogListing({ searchParams, basePath, universe, onSale, withSearch }: Props) {
  const raw = await searchParams;
  const params = paramsSchema.parse({ categorie: single(raw.categorie), q: single(raw.q), tri: single(raw.tri) });
  const [categories, products] = await Promise.all([
    getCategories(universe),
    getCatalog({ universe, category: params.categorie, query: params.q || undefined, onSale, sort: params.tri }),
  ]);
  const activeCategory = categories.find((c) => c.slug === params.categorie);

  return (
    <>
      {withSearch && (
        <Form action={basePath} role="search" className="mt-6 flex max-w-xl gap-2">
          <label htmlFor="recherche" className="sr-only">
            Rechercher un produit
          </label>
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              id="recherche"
              name="q"
              type="search"
              defaultValue={params.q}
              placeholder="Palmes, appeau, Calanque…"
              className="field pl-9"
              autoFocus={!params.q}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Rechercher
          </button>
        </Form>
      )}

      {categories.length > 1 && (
        <nav aria-label="Catégories" className="-mx-4 mt-8 overflow-x-auto px-4 pb-2">
          <ul className="flex gap-2">
            <li>
              <Link
                href={hrefWith(basePath, params, { categorie: undefined })}
                aria-current={!activeCategory ? "page" : undefined}
                className="btn min-h-10 border border-line bg-paper text-sm aria-[current=page]:border-forest aria-[current=page]:bg-forest aria-[current=page]:text-paper"
              >
                Tout voir
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={hrefWith(basePath, params, { categorie: category.slug })}
                  aria-current={activeCategory?.id === category.id ? "page" : undefined}
                  className="btn min-h-10 border border-line bg-paper text-sm aria-[current=page]:border-forest aria-[current=page]:bg-forest aria-[current=page]:text-paper"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3 text-sm">
        <p aria-live="polite">
          <strong>{products.length}</strong> produit{products.length > 1 ? "s" : ""}
          {activeCategory && <> · {activeCategory.description}</>}
          {params.q && <> pour « {params.q} »</>}
        </p>
        <nav aria-label="Trier les produits">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <li className="text-muted">Trier :</li>
            {sortKeys
              .filter((sort) => !(onSale && sort === "promos"))
              .map((sort) => (
                <li key={sort}>
                  <Link
                    href={hrefWith(basePath, params, { tri: sort })}
                    aria-current={params.tri === sort ? "true" : undefined}
                    className="text-ink-soft hover:text-ink aria-[current=true]:font-bold aria-[current=true]:text-ink aria-[current=true]:underline aria-[current=true]:decoration-blaze aria-[current=true]:decoration-2 aria-[current=true]:underline-offset-4"
                  >
                    {sortOptions[sort]}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>

      {products.length > 0 ? (
        <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="panel mt-10 px-6 py-14 text-center">
          <p className="heading text-2xl">Aucun résultat</p>
          <p className="mt-2 text-ink-soft">
            {params.q
              ? "Aucun produit ne correspond à cette recherche. Essayez un mot plus court ou une marque."
              : "Aucun produit dans cette sélection pour le moment."}
          </p>
          <Link href={basePath === "/recherche" ? "/" : basePath} className="btn btn-secondary mt-6">
            {basePath === "/recherche" ? "Retour à l'accueil" : "Voir tous les produits"}
          </Link>
        </div>
      )}
    </>
  );
}

export function CatalogSkeleton() {
  return (
    <div aria-hidden="true" className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="aspect-[4/5] animate-pulse rounded-sm bg-line/60" />
      ))}
    </div>
  );
}
