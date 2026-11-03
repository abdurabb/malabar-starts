import { cacheLife } from "next/cache";
import type { MetadataRoute } from "next";
import { apiOrigin } from "@/lib/apiOrigin";
import { siteOrigin } from "@/lib/site";

type Listed = {
  id: string;
  updatedAt?: string;
  isActive?: boolean;
};

type ListedPage = {
  pagination?: { totalPages?: number };
  products?: Listed[];
  categories?: Listed[];
  brands?: Listed[];
};

async function listAll(path: string, key: "products" | "categories" | "brands") {
  const base = apiOrigin();
  const items: Listed[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= 50) {
    const params = new URLSearchParams({
      page: String(page),
      limit: "100",
      status: "active",
    });
    let response: Response;
    try {
      response = await fetch(`${base}${path}?${params.toString()}`);
    } catch {
      break;
    }
    if (!response.ok) break;
    const data = (await response.json()) as ListedPage;
    const batch = data[key] ?? [];
    items.push(...batch.filter((item) => item.isActive !== false && item.id));
    totalPages = data.pagination?.totalPages ?? page;
    page += 1;
  }

  return items;
}

export async function catalogSitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");

  const origin = siteOrigin();
  const [products, categories, brands] = await Promise.all([
    listAll("/api/v1/products", "products"),
    listAll("/api/v1/categories", "categories"),
    listAll("/api/v1/brands", "brands"),
  ]);

  return [
    ...products.map((product) => ({
      url: `${origin}/products/${product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...categories.map((category) => ({
      url: `${origin}/products?category=${category.id}`,
      lastModified: category.updatedAt ? new Date(category.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...brands.map((brand) => ({
      url: `${origin}/products?brand=${brand.id}`,
      lastModified: brand.updatedAt ? new Date(brand.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
