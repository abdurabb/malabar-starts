import type { MetadataRoute } from "next";
import { catalogSitemap } from "@/lib/catalogIndex";
import { siteOrigin } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const catalog = await catalogSitemap().catch(() => []);
  return [
    { url: origin, changeFrequency: "daily", priority: 1 },
    { url: `${origin}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${origin}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${origin}/brands`, changeFrequency: "weekly", priority: 0.8 },
    ...catalog,
  ];
}
