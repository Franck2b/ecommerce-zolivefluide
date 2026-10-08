import type { ReactNode } from "react";

export function ProsePage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="heading text-5xl">{title}</h1>
      <div className="mt-8 space-y-4 leading-relaxed text-ink-soft [&_h2]:heading [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:text-ink">
        {children}
      </div>
    </div>
  );
}
