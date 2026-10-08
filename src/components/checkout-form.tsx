"use client";

import { useActionState } from "react";
import { checkout, type CheckoutState } from "@/actions/checkout";
import { FieldError } from "./field-error";

type Address = {
  fullName: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string;
  city: string;
  phone: string;
};

const fields = [
  { name: "fullName", label: "Destinataire", autoComplete: "name", span: true },
  { name: "addressLine1", label: "Adresse", autoComplete: "address-line1", span: true },
  { name: "addressLine2", label: "Complément (facultatif)", autoComplete: "address-line2", span: true, optional: true },
  { name: "postalCode", label: "Code postal", autoComplete: "postal-code", inputMode: "numeric" },
  { name: "city", label: "Ville", autoComplete: "address-level2" },
  { name: "phone", label: "Téléphone (pour le livreur)", autoComplete: "tel", type: "tel", span: true },
] as const;

export function CheckoutForm({ defaults, payLabel }: { defaults?: Address; payLabel: string }) {
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(checkout, {});

  return (
    <form action={formAction} noValidate>
      {state.error && (
        <p role="alert" className="mb-6 rounded-sm border-2 border-danger bg-danger-tint px-4 py-3 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}
      <fieldset>
        <legend className="heading text-2xl">Adresse de livraison</legend>
        <p className="mt-1 text-sm text-muted">France métropolitaine uniquement.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className={"span" in field && field.span ? "sm:col-span-2" : undefined}>
              <label htmlFor={field.name} className="label">
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={"type" in field ? field.type : "text"}
                autoComplete={field.autoComplete}
                inputMode={"inputMode" in field ? field.inputMode : undefined}
                required={!("optional" in field)}
                defaultValue={defaults?.[field.name] ?? ""}
                aria-invalid={!!state.fields?.[field.name]}
                aria-describedby={`${field.name}-error`}
                className="field"
              />
              <FieldError id={`${field.name}-error`} errors={state.fields?.[field.name]} />
            </div>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="btn btn-primary mt-8 h-12 w-full text-base" disabled={pending}>
        {pending ? "Réservation de vos articles…" : payLabel}
      </button>
      <p className="mt-3 text-center text-xs text-muted">
        Vos articles sont réservés 30 minutes le temps du paiement.
      </p>
    </form>
  );
}
