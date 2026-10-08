import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { universe as universeEnum } from "@/db/schema";
import { getCategories, getFeatured } from "@/lib/catalog";
import { universes } from "@/lib/format";

// Photos en paysage dans des moitiés d'écran en portrait : le cadrage suit le sujet.
const universeImages = {
  foret: { src: "/images/ambiance/hero-battue.jpg", position: "object-[62%_50%]" },
  mer: { src: "/images/ambiance/hero-surface.jpg", position: "object-[55%_50%]" },
} as const;

export default function HomePage() {
  return (
    <>
      <section className="grid md:grid-cols-2" aria-label="Nos deux univers">
        {universeEnum.enumValues.map((universe, i) => (
          <Link
            key={universe}
            href={universes[universe].href}
            className="group relative flex min-h-[26rem] items-end overflow-hidden bg-ink md:min-h-[38rem]"
          >
            <Image
              src={universeImages[universe].src}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className={`object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 ${universeImages[universe].position}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative p-6 text-paper sm:p-10">
              <p className="eyebrow text-paper/80!">{i === 0 ? "Forêt, plaine, marais" : "Apnée, roches, pleine eau"}</p>
              {i === 0 ? (
                <h1 className="heading mt-3 text-5xl sm:text-6xl">{universes[universe].label}</h1>
              ) : (
                <h2 className="heading mt-3 text-5xl sm:text-6xl">{universes[universe].label}</h2>
              )}
              <p className="mt-3 max-w-sm text-paper/85">{universes[universe].pitch}</p>
              <span className="btn btn-primary mt-6">
                Voir l&apos;équipement <ArrowIcon />
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="border-b border-line bg-paper">
        <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm sm:grid-cols-3 sm:px-6 lg:px-8">
          <li>
            <p className="heading text-lg">Testé sur le terrain</p>
            <p className="mt-1 text-muted">Chaque produit est utilisé en battue ou en apnée avant d&apos;entrer au catalogue.</p>
          </li>
          <li>
            <p className="heading text-lg">Conseil de pratiquant</p>
            <p className="mt-1 text-muted">Sur chaque fiche, le conseil d&apos;usage qui fait la différence dehors.</p>
          </li>
          <li>
            <p className="heading text-lg">Expédié sous 24 h</p>
            <p className="mt-1 text-muted">Colissimo 48 h, offert dès 79 €, retours gratuits pendant 30 jours.</p>
          </li>
        </ul>
      </section>

      <section aria-labelledby="selection" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">La sélection</p>
            <h2 id="selection" className="heading mt-2 text-4xl">
              Nos incontournables
            </h2>
          </div>
          <Link href="/promos" className="inline-flex items-center gap-2 font-semibold hover:underline">
            Voir les promotions <ArrowIcon />
          </Link>
        </div>
        <Suspense fallback={<div className="mt-8 h-[28rem] animate-pulse bg-line/50" />}>
          <Featured />
        </Suspense>
      </section>

      <section className="relative overflow-hidden bg-forest text-paper">
        <Image src="/images/ambiance/foret.jpg" alt="" fill sizes="100vw" className="object-cover opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="eyebrow text-paper/70!">Sécurité</p>
          <h2 className="heading mt-3 max-w-2xl text-4xl sm:text-5xl">L&apos;orange, en forêt comme en mer</h2>
          <p className="mt-4 max-w-xl text-paper/85">
            En battue, le vêtement orange vous rend visible des autres chasseurs alors que le gibier le distingue
            mal. En mer, la bouée orange à pavillon Alpha signale votre présence aux bateaux. Deux pratiques, une
            même règle : être vu.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/produits/veste-de-traque-oree-blaze" className="btn btn-primary">
              Vestes de traque
            </Link>
            <Link href="/produits/bouee-de-signalisation" className="btn btn-secondary">
              Bouées de signalisation
            </Link>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="h-96" />}>
        <Categories />
      </Suspense>
    </>
  );
}

// `connection()` : le catalogue est lu à l'exécution puis mis en cache, jamais figé au build.
// L'artefact de build ne dépend ainsi d'aucune base de données.
async function Featured() {
  await connection();
  const products = await getFeatured();
  return (
    <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {products.slice(0, 8).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

async function Categories() {
  await connection();
  const categories = await getCategories();

  return (
    <section aria-labelledby="rayons" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="eyebrow">Les rayons</p>
      <h2 id="rayons" className="heading mt-2 text-4xl">
        Par catégorie
      </h2>
      <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => (
          <li key={category.id}>
            <Link href={`${universes[category.universe].href}?categorie=${category.slug}`} className="group block">
              <div className="relative aspect-square overflow-hidden bg-[#e9e8e4]">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-2 text-xs font-semibold tracking-wider text-khaki uppercase">
                {universes[category.universe].label}
              </p>
              <p className="font-semibold group-hover:underline">{category.name}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
