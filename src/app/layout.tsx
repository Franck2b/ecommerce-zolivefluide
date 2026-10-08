import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const barlow = Barlow({ variable: "--font-barlow", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Affût & Apnée — Équipement de chasse et de chasse sous-marine",
    template: "%s · Affût & Apnée",
  },
  description:
    "Équipement de chasse et de chasse sous-marine sélectionné par des pratiquants : optiques, appeaux, vêtements de traque, palmes, masques et combinaisons. Livraison offerte dès 79 €.",
  openGraph: { type: "website", locale: "fr_FR", siteName: "Affût & Apnée" },
};

export const viewport: Viewport = {
  themeColor: "#1f2b23",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${barlowCondensed.variable} ${barlow.variable} ${plexMono.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
