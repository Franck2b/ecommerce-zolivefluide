import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getCatalog } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const products = await getCatalog({ sort: "nouveautes" });
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/foret`, changeFrequency: "weekly" },
    { url: `${base}/mer`, changeFrequency: "weekly" },
    { url: `${base}/promos`, changeFrequency: "daily" },
    ...products.map((p) => ({ url: `${base}/produits/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
