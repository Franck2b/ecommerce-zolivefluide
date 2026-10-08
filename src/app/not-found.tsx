import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-20">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="heading mt-3 text-5xl">Page introuvable</h1>
      <p className="mt-4 text-ink-soft">Cette page n&apos;existe pas ou n&apos;existe plus. Le produit a peut-être été retiré du catalogue.</p>
      <Link href="/" className="btn btn-primary mt-8 self-start">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
