"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "@/actions/auth";
import { FieldError } from "./field-error";

type Props = { mode: "connexion" | "inscription"; returnTo: string };

export function AuthForm({ mode, returnTo }: Props) {
  const signingUp = mode === "inscription";
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signingUp ? signUp : signIn, {});
  const suite = returnTo === "/compte" ? "" : `?suite=${encodeURIComponent(returnTo)}`;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="suite" value={returnTo} />
      {state.error && (
        <p role="alert" className="rounded-sm border-2 border-danger bg-danger-tint px-4 py-3 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}
      {signingUp && (
        <div>
          <label htmlFor="name" className="label">
            Prénom et nom
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            defaultValue={state.values?.name}
            aria-invalid={!!state.fields?.name}
            aria-describedby="name-error"
            className="field"
          />
          <FieldError id="name-error" errors={state.fields?.name} />
        </div>
      )}
      <div>
        <label htmlFor="email" className="label">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          aria-invalid={!!state.fields?.email}
          aria-describedby="email-error"
          className="field"
        />
        <FieldError id="email-error" errors={state.fields?.email} />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={signingUp ? "new-password" : "current-password"}
          required
          minLength={signingUp ? 10 : undefined}
          aria-invalid={!!state.fields?.password}
          aria-describedby="password-error password-hint"
          className="field"
        />
        {signingUp && (
          <p id="password-hint" className="mt-1.5 text-xs text-muted">
            10 caractères minimum. Une phrase courte est plus solide qu&apos;un mot compliqué.
          </p>
        )}
        <FieldError id="password-error" errors={state.fields?.password} />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Un instant…" : signingUp ? "Créer mon compte" : "Se connecter"}
      </button>
      <p className="text-center text-sm text-ink-soft">
        {signingUp ? "Déjà un compte ? " : "Pas encore de compte ? "}
        <Link
          href={`/${signingUp ? "connexion" : "inscription"}${suite}`}
          className="font-bold text-ink underline decoration-ink decoration-2 underline-offset-4"
        >
          {signingUp ? "Se connecter" : "Créer un compte"}
        </Link>
      </p>
    </form>
  );
}
