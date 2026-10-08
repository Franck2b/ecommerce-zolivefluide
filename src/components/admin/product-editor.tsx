"use client";

import { useActionState, useState } from "react";
import { saveProduct, type ProductFormState } from "@/actions/admin";
import type { Category, Product, Spec, Variant } from "@/db/schema";
import { FieldError } from "../field-error";
import { ProductImage } from "../product-image";

type Props = {
  product?: Product & { variants: Variant[] };
  categories: Category[];
};

type VariantRow = { key: string; id?: string; label: string; sku: string; price: string; compareAt: string; stock: string };

const toEuros = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(2).replace(".", ","));
const toCents = (euros: string) => (euros.trim() ? Math.round(Number(euros.replace(",", ".")) * 100) : null);

let nextKey = 0;
const newKey = () => `nouveau-${nextKey++}`;

export function ProductEditor({ product, categories }: Props) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(saveProduct, {});
  const [fields, setFields] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    brand: product?.brand ?? "",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    tip: product?.tip ?? "",
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    image: product?.image ?? "/images/produits/",
    isPublished: product?.isPublished ?? false,
    isFeatured: product?.isFeatured ?? false,
  });
  const [specs, setSpecs] = useState<(Spec & { key: string })[]>(
    (product?.specs ?? []).map((spec) => ({ ...spec, key: newKey() })),
  );
  const [variantRows, setVariantRows] = useState<VariantRow[]>(
    product?.variants.map((v) => ({
      key: v.id,
      id: v.id,
      label: v.label,
      sku: v.sku,
      price: toEuros(v.priceCents),
      compareAt: toEuros(v.compareAtCents),
      stock: String(v.stock),
    })) ?? [{ key: newKey(), label: "Modèle unique", sku: "", price: "", compareAt: "", stock: "0" }],
  );

  const set = <K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) =>
    setFields((current) => ({ ...current, [key]: value }));

  const payload = JSON.stringify({
    ...fields,
    specs: specs.map(({ label, value }) => ({ label, value })),
    variants: variantRows.map((row) => ({
      id: row.id,
      label: row.label,
      sku: row.sku,
      priceCents: toCents(row.price),
      compareAtCents: toCents(row.compareAt),
      stock: row.stock,
    })),
  });

  const textField = (name: "name" | "slug" | "brand" | "tagline", label: string, hint?: string) => (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input
        id={name}
        value={fields[name]}
        onChange={(e) => set(name, e.target.value)}
        aria-invalid={!!state.fields?.[name]}
        aria-describedby={`${name}-error`}
        className="field"
      />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <FieldError id={`${name}-error`} errors={state.fields?.[name]} />
    </div>
  );

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <input type="hidden" name="payload" value={payload} />
      {product && <input type="hidden" name="productId" value={product.id} />}

      <div className="space-y-8">
        {state.error && (
          <p role="alert" className="rounded-sm border-2 border-danger bg-danger-tint px-4 py-3 text-sm font-medium text-danger">
            {state.error}
          </p>
        )}

        <fieldset className="panel space-y-5 p-6">
          <legend className="sr-only">Informations</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            {textField("name", "Nom")}
            {textField("brand", "Marque")}
          </div>
          {textField("slug", "Slug (URL)", "Ex. : palmes-sirene-carbone → /produits/palmes-sirene-carbone")}
          {textField("tagline", "Accroche", "Une phrase, affichée sous le nom.")}
          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              value={fields.description}
              onChange={(e) => set("description", e.target.value)}
              aria-invalid={!!state.fields?.description}
              aria-describedby="description-error"
              className="field"
            />
            <FieldError id="description-error" errors={state.fields?.description} />
          </div>
          <div>
            <label htmlFor="tip" className="label">
              Le mot du guide
            </label>
            <textarea
              id="tip"
              rows={2}
              value={fields.tip}
              onChange={(e) => set("tip", e.target.value)}
              aria-invalid={!!state.fields?.tip}
              aria-describedby="tip-error"
              className="field"
            />
            <FieldError id="tip-error" errors={state.fields?.tip} />
          </div>
        </fieldset>

        <fieldset className="panel p-6">
          <legend className="sr-only">Variantes</legend>
          <div className="flex items-center justify-between">
            <h2 className="heading text-xl">Variantes &amp; stock</h2>
            <button
              type="button"
              className="btn btn-secondary min-h-9 text-sm"
              onClick={() =>
                setVariantRows((rows) => [...rows, { key: newKey(), label: "", sku: "", price: "", compareAt: "", stock: "0" }])
              }
            >
              Ajouter une variante
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">
            Prix en euros TTC. Le prix barré est facultatif et doit être supérieur au prix de vente.
          </p>
          <FieldError id="variants-error" errors={state.fields?.variants} />
          <div className="mt-4 space-y-3">
            {variantRows.map((row, index) => {
              const update = (patch: Partial<VariantRow>) =>
                setVariantRows((rows) => rows.map((r) => (r.key === row.key ? { ...r, ...patch } : r)));
              return (
                <div key={row.key} className="grid grid-cols-2 gap-2 rounded-sm border border-line p-3 sm:grid-cols-[1fr_1.3fr_0.8fr_0.8fr_0.6fr_auto] sm:items-end">
                  <VariantInput label="Libellé" value={row.label} onChange={(label) => update({ label })} index={index} />
                  <VariantInput label="SKU" value={row.sku} onChange={(sku) => update({ sku })} index={index} />
                  <VariantInput label="Prix €" value={row.price} onChange={(price) => update({ price })} index={index} inputMode="decimal" />
                  <VariantInput label="Prix barré €" value={row.compareAt} onChange={(compareAt) => update({ compareAt })} index={index} inputMode="decimal" />
                  <VariantInput label="Stock" value={row.stock} onChange={(stock) => update({ stock })} index={index} inputMode="numeric" />
                  <button
                    type="button"
                    className="btn btn-ghost min-h-11 text-sm text-danger disabled:opacity-30"
                    onClick={() => setVariantRows((rows) => rows.filter((r) => r.key !== row.key))}
                    disabled={variantRows.length === 1}
                    aria-label={`Supprimer la variante ${row.label || index + 1}`}
                  >
                    Supprimer
                  </button>
                </div>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="panel p-6">
          <legend className="sr-only">Caractéristiques</legend>
          <div className="flex items-center justify-between">
            <h2 className="heading text-xl">Caractéristiques</h2>
            <button
              type="button"
              className="btn btn-secondary min-h-9 text-sm"
              onClick={() => setSpecs((rows) => [...rows, { key: newKey(), label: "", value: "" }])}
              disabled={specs.length >= 8}
            >
              Ajouter une ligne
            </button>
          </div>
          <FieldError id="specs-error" errors={state.fields?.specs} />
          <div className="mt-4 space-y-2">
            {specs.length === 0 && <p className="text-sm text-muted">Poids, matière, dimensions… affichés sur la fiche.</p>}
            {specs.map((spec, index) => {
              const update = (patch: Partial<Spec>) =>
                setSpecs((rows) => rows.map((r) => (r.key === spec.key ? { ...r, ...patch } : r)));
              return (
                <div key={spec.key} className="flex gap-2">
                  <input
                    aria-label={`Caractéristique ${index + 1}`}
                    placeholder="Poids"
                    value={spec.label}
                    onChange={(e) => update({ label: e.target.value })}
                    className="field"
                  />
                  <input
                    aria-label={`Valeur ${index + 1}`}
                    placeholder="690 g"
                    value={spec.value}
                    onChange={(e) => update({ value: e.target.value })}
                    className="field"
                  />
                  <button
                    type="button"
                    className="btn btn-ghost text-sm text-danger"
                    onClick={() => setSpecs((rows) => rows.filter((r) => r.key !== spec.key))}
                    aria-label={`Supprimer la ligne ${index + 1}`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </fieldset>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <div className="panel space-y-4 p-5">
          <label className="flex items-center gap-3 font-semibold">
            <input
              type="checkbox"
              checked={fields.isPublished}
              onChange={(e) => set("isPublished", e.target.checked)}
              className="size-5 accent-blaze"
            />
            En ligne sur la boutique
          </label>
          <label className="flex items-center gap-3 font-semibold">
            <input
              type="checkbox"
              checked={fields.isFeatured}
              onChange={(e) => set("isFeatured", e.target.checked)}
              className="size-5 accent-blaze"
            />
            Coup de cœur (accueil)
          </label>
          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? "Enregistrement…" : product ? "Enregistrer" : "Créer le produit"}
          </button>
        </div>

        <div className="panel space-y-4 p-5">
          <div>
            <label htmlFor="categoryId" className="label">
              Catégorie
            </label>
            <select id="categoryId" value={fields.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="field">
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.universe === "foret" ? "Forêt" : "Mer"} · {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="image" className="label">
              Photo (chemin dans /public)
            </label>
            <input
              id="image"
              value={fields.image}
              onChange={(e) => set("image", e.target.value)}
              aria-invalid={!!state.fields?.image}
              aria-describedby="image-error"
              className="field"
            />
            <FieldError id="image-error" errors={state.fields?.image} />
          </div>
          {/\.(jpe?g|png|webp)$/i.test(fields.image) && (
            <ProductImage src={fields.image} alt="Aperçu" sizes="320px" />
          )}
        </div>
      </aside>
    </form>
  );
}

function VariantInput({
  label,
  value,
  onChange,
  index,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  index: number;
  inputMode?: "decimal" | "numeric";
}) {
  const id = `variante-${index}-${label}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold">
        {label}
      </label>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} inputMode={inputMode} className="field min-h-10" />
    </div>
  );
}
