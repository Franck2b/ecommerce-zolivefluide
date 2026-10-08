import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex flex-col leading-none ${className}`} aria-label="Affût & Apnée, accueil">
      <span className="heading text-2xl tracking-wide">
        Affût <span className="text-blaze">&amp;</span> Apnée
      </span>
      <span className="mt-1 hidden text-[0.625rem] font-semibold tracking-[0.24em] uppercase opacity-60 sm:block">
        Chasse · Chasse sous-marine
      </span>
    </Link>
  );
}
