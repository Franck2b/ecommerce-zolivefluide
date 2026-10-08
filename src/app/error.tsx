"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-20">
      <p className="eyebrow">Erreur</p>
      <h1 className="heading mt-3 text-5xl">Le service ne répond pas</h1>
      <p className="mt-4 text-ink-soft">Une erreur technique est survenue de notre côté. Réessayez dans quelques instants.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-8 self-start">
        Réessayer
      </button>
    </main>
  );
}
