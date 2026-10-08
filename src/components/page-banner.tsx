import Image from "next/image";

type Props = { title: string; text: string; image: string; eyebrow?: string };

export function PageBanner({ title, text, image, eyebrow }: Props) {
  return (
    <header className="relative overflow-hidden bg-forest text-paper">
      <Image src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        {eyebrow && <p className="eyebrow text-paper/75!">{eyebrow}</p>}
        <h1 className="heading mt-2 text-5xl sm:text-6xl">{title}</h1>
        <p className="mt-3 max-w-xl text-lg text-paper/85">{text}</p>
      </div>
    </header>
  );
}
