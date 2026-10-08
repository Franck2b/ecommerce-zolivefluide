import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { updateCartItem } from "@/actions/cart";
import { ArrowIcon } from "@/components/icons";
import { OrderSummary } from "@/components/order-summary";
import { ProductImage } from "@/components/product-image";
import { getCart, type CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { MAX_QUANTITY_PER_LINE } from "@/lib/pricing";

export const metadata: Metadata = { title: "Panier", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <h1 className="heading text-5xl">Panier</h1>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-sm bg-line/60" />}>
        <CartContent />
      </Suspense>
    </div>
  );
}

async function CartContent() {
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return (
      <div className="panel mt-8 px-6 py-16 text-center">
        <p className="heading text-3xl">Votre panier est vide</p>
        <p className="mt-2 text-ink-soft">Parcourez nos rayons chasse et chasse sous-marine pour préparer votre prochaine sortie.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/foret" className="btn btn-primary">
            Chasse <ArrowIcon />
          </Link>
          <Link href="/mer" className="btn btn-secondary">
            Chasse sous-marine <ArrowIcon />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <ul className="panel divide-y divide-line" aria-label="Articles du panier">
        {cart.lines.map((line) => (
          <CartRow key={line.variantId} line={line} />
        ))}
      </ul>

      <aside className="panel p-6 lg:sticky lg:top-24" aria-labelledby="recap">
        <h2 id="recap" className="mb-5 heading text-2xl">
          Récapitulatif
        </h2>
        <OrderSummary {...cart} showFreeShippingGauge />
        {cart.hasProblems ? (
          <p role="alert" className="mt-6 rounded-sm border-2 border-danger bg-danger-tint p-3 text-sm font-medium text-danger">
            Certains articles ne sont plus disponibles dans la quantité demandée. Ajustez-les pour continuer.
          </p>
        ) : (
          <Link href="/commande" className="btn btn-primary mt-6 w-full">
            Passer commande <ArrowIcon />
          </Link>
        )}
        <p className="mt-4 text-center text-xs text-muted">Paiement sécurisé · Retours gratuits 30 jours</p>
      </aside>
    </div>
  );
}

function CartRow({ line }: { line: CartLine }) {
  const maxQuantity = Math.min(line.stock, MAX_QUANTITY_PER_LINE);

  return (
    <li className="flex gap-4 p-4 sm:p-5">
      <ProductImage src={line.product.image} alt="" sizes="96px" className="size-20 shrink-0 sm:size-24" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-start justify-between gap-x-4">
          <div className="min-w-0">
            <Link href={`/produits/${line.product.slug}`} className="font-bold hover:underline">
              {line.product.name}
            </Link>
            <p className="text-sm text-muted">{line.label}</p>
          </div>
          <p className="font-mono font-bold">{formatPrice(line.unitPriceCents * line.quantity)}</p>
        </div>

        {line.problem === "unavailable" && (
          <p className="text-sm font-medium text-danger">Ce produit n&apos;est plus disponible. Retirez-le pour continuer.</p>
        )}
        {line.problem === "insufficient_stock" && (
          <p className="text-sm font-medium text-danger">
            Il n&apos;en reste que {line.stock}. Réduisez la quantité pour continuer.
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          <form action={updateCartItem} className="flex h-10 items-center rounded-sm border border-line bg-paper">
            <input type="hidden" name="variantId" value={line.variantId} />
            <button
              name="quantity"
              value={line.quantity - 1}
              className="grid size-9 place-items-center text-lg font-bold disabled:opacity-30"
              aria-label={`Retirer un ${line.product.name}`}
              disabled={line.problem === "unavailable"}
            >
              −
            </button>
            <span className="w-8 text-center font-mono font-bold" aria-label="Quantité">
              {line.quantity}
            </span>
            <button
              name="quantity"
              value={line.quantity + 1}
              className="grid size-9 place-items-center text-lg font-bold disabled:opacity-30"
              aria-label={`Ajouter un ${line.product.name}`}
              disabled={line.quantity >= maxQuantity}
            >
              +
            </button>
          </form>
          <form action={updateCartItem}>
            <input type="hidden" name="variantId" value={line.variantId} />
            <button name="quantity" value={0} className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-danger">
              Retirer
            </button>
          </form>
          <p className="text-xs text-muted">{formatPrice(line.unitPriceCents)} l&apos;unité</p>
        </div>
      </div>
    </li>
  );
}
