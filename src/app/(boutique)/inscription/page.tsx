import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser, safeReturnPath } from "@/lib/auth";

export const metadata: Metadata = { title: "Créer un compte", robots: { index: false } };

export default function Page({ searchParams }: PageProps<"/inscription">) {
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="panel p-6 sm:p-8">
        <h1 className="heading text-3xl">Créer un compte</h1>
        <p className="mt-2 mb-8 text-ink-soft">Un compte pour commander et suivre vos colis.</p>
        <Suspense fallback={<div className="h-80" />}>
          <Form searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function Form({ searchParams }: { searchParams: PageProps<"/inscription">["searchParams"] }) {
  const { suite } = await searchParams;
  const returnTo = safeReturnPath(typeof suite === "string" ? suite : null);
  if (await getCurrentUser()) redirect(returnTo);
  return <AuthForm mode="inscription" returnTo={returnTo} />;
}
