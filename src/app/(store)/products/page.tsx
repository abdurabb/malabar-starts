import { Suspense } from "react";
import { ScreenStatus } from "@/components/auth/screen-status";
import { ProductsView } from "@/components/shop/products-view";
import { getBrand } from "@/lib/brands";
import { getCategory } from "@/lib/categories";
import { pageFrom, param, type QueryInput } from "@/lib/query";
import { metaDescription, siteName } from "@/lib/site";
import type { Metadata } from "next";

const productsDescription = `Browse fresh chicken, frozen poultry, beef, mutton, and food stuff from ${siteName} in Sharjah.`;

export async function generateMetadata({ searchParams }: { searchParams: Promise<QueryInput> }): Promise<Metadata> {
  const query = await searchParams;
  const page = pageFrom(query);
  const search = param(query, "search");
  const categoryId = param(query, "category");
  const brandId = param(query, "brand");
  const narrowed = Boolean(search || param(query, "minPrice") || param(query, "maxPrice") || param(query, "sort") || page > 1);

  if (narrowed || (categoryId && brandId)) {
    return {
      title: "Products",
      description: productsDescription,
      alternates: { canonical: "/products" },
      robots: { index: false, follow: true },
    };
  }

  if (categoryId) {
    const category = await getCategory(categoryId).catch(() => null);
    if (!category || !category.isActive) {
      return { title: "Products", robots: { index: false, follow: true }, alternates: { canonical: "/products" } };
    }
    const description = metaDescription(category.description, `${category.name} supplied by ${siteName} in Sharjah.`);
    return {
      title: category.name,
      description,
      alternates: { canonical: `/products?category=${category.id}` },
      openGraph: { title: category.name, description, url: `/products?category=${category.id}` },
    };
  }

  if (brandId) {
    const brand = await getBrand(brandId).catch(() => null);
    if (!brand || !brand.isActive) {
      return { title: "Products", robots: { index: false, follow: true }, alternates: { canonical: "/products" } };
    }
    const description = metaDescription(brand.description, `${brand.name} products from ${siteName} in Sharjah.`);
    return {
      title: brand.name,
      description,
      alternates: { canonical: `/products?brand=${brand.id}` },
      openGraph: { title: brand.name, description, url: `/products?brand=${brand.id}` },
    };
  }

  return {
    title: "Products",
    description: productsDescription,
    alternates: { canonical: "/products" },
    openGraph: { title: "Products", description: productsDescription, url: "/products" },
  };
}

export default function ProductsPage({ searchParams }: { searchParams: Promise<QueryInput> }) {
  return (
    <Suspense fallback={<ScreenStatus label="Opening products…" />}>
      <ProductsView searchParams={searchParams} />
    </Suspense>
  );
}
