"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { addToCart, type CartActionState } from "@/actions/cart";
import { discountPercent, formatPrice } from "@/lib/format";
import { MAX_QUANTITY_PER_LINE } from "@/lib/pricing";

type PurchaseVariant = {
  id: string;
  label: string;
  priceCents: number;
  compareAtCents: number | null;
  stock: number;
};

const LOW_STOCK = 5;

export function ProductPurchase({ variants }: { variants: PurchaseVariant[] }) {
  const initial = variants.find((v) => v.stock > 0) ?? variants[0];
  const [selectedId, setSelectedId] = useState(initial.id);
  const [quantity, setQuantity] = useState(1);
  const [state, formAction, pending] = useActionState<CartActionState, FormData>(addToCart, {
    status: "idle",
    message: "",
  });

  const selected = variants.find((v) => v.id === selectedId) ?? initial;
  const maxQuantity = Math.min(selected.stock, MAX_QUANTITY_PER_LINE);
  const soldOut = selected.stock === 0;
  const discount = discountPercent(selected.priceCents, selected.compareAtCents);
  const single = variants.length === 1;

  return (
    <form action={formAction}>
      <p className="flex flex-wrap items-baseline gap-3">
        <span className="heading text-4xl">{formatPrice(selected.priceCents)}</span>
        {selected.compareAtCents && (
          <>
            <s className="text-lg text-muted">{formatPrice(selected.compareAtCents)}</s>
            <span className="rotate-3 rounded-sm border border-line bg-blaze px-2 heading text-sm">−{discount} %</span>
          </>
        )}
      </p>
      <p className="mt-1 text-sm text-muted">TTC, livraison calculée au panier</p>

      {single ? (
        <input type="hidden" name="variantId" value={selected.id} />
      ) : (
        <fieldset className="mt-6">
          <legend className="label">Choisissez : {selected.label}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((variant) => (
              <label
                key={variant.id}
                className="relative grid min-h-11 min-w-14 cursor-pointer place-items-center rounded-sm border border-line bg-paper px-3 font-semibold transition-colors hover:bg-stone has-checked:bg-ink has-checked:text-paper has-disabled:cursor-not-allowed has-disabled:border-line has-disabled:text-muted has-disabled:line-through has-focus-visible:outline-3 has-focus-visible:outline-blaze"
              >
                <input
                  type="radio"
                  name="variantId"
                  value={variant.id}
                  checked={variant.id === selectedId}
                  onChange={() => {
                    setSelectedId(variant.id);
                    setQuantity(1);
                  }}
                  disabled={variant.stock === 0}
                  className="sr-only"
                />
                {variant.label}
                {variant.stock === 0 && <span className="sr-only"> (épuisé)</span>}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <p className={`mt-4 text-sm font-semibold ${soldOut ? "text-danger" : selected.stock <= LOW_STOCK ? "text-blaze-deep" : "text-success"}`}>
        {soldOut
          ? "Épuisé pour le moment"
          : selected.stock <= LOW_STOCK
            ? `Vite, plus que ${selected.stock} en stock !`
            : "En stock, expédié sous 24 h"}
      </p>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="quantite" className="label">
            Quantité
          </label>
          <div className="flex h-12 items-center rounded-sm border border-line bg-paper">
            <button
              type="button"
              className="grid size-11 place-items-center text-xl font-bold disabled:opacity-30"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || soldOut}
              aria-label="Retirer une unité"
            >
              −
            </button>
            <input
              id="quantite"
              name="quantity"
              type="number"
              inputMode="numeric"
              min={1}
              max={Math.max(maxQuantity, 1)}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.min(Math.max(1, Number(e.target.value) || 1), Math.max(maxQuantity, 1)))
              }
              className="w-10 [appearance:textfield] bg-transparent text-center font-mono font-bold [&::-webkit-inner-spin-button]:appearance-none"
              disabled={soldOut}
            />
            <button
              type="button"
              className="grid size-11 place-items-center text-xl font-bold disabled:opacity-30"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              disabled={quantity >= maxQuantity || soldOut}
              aria-label="Ajouter une unité"
            >
              +
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary h-12 flex-1 text-base sm:flex-none" disabled={pending || soldOut}>
          {soldOut ? "Épuisé" : pending ? "Ajout en cours…" : `Ajouter au panier · ${formatPrice(selected.priceCents * quantity)}`}
        </button>
      </div>

      <p role="status" className={`mt-4 min-h-6 text-sm font-medium ${state.status === "error" ? "text-danger" : "text-success"}`}>
        {state.message}
        {state.status === "success" && (
          <>
            {" "}
            <Link href="/panier" className="font-bold text-ink underline decoration-ink decoration-2 underline-offset-4">
              Voir le panier
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
