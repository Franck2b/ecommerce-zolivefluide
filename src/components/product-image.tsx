import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** Photo produit carrée sur fond neutre, recadrée pour remplir son conteneur. */
export function ProductImage({ src, alt, sizes, priority, className = "" }: Props) {
  return (
    <div className={`relative aspect-square overflow-hidden bg-[#e9e8e4] ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
