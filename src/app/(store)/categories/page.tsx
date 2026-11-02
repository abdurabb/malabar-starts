import { Suspense } from "react";
import { ScreenStatus } from "@/components/auth/screen-status";
import { CategoriesView } from "@/components/shop/categories-view";
import { pageFrom, param, type QueryInput } from "@/lib/query";
import { siteName } from "@/lib/site";
import type { Metadata } from "next";

const description = `Categories of fresh chicken, frozen poultry, beef, mutton, and food stuff from ${siteName} in Sharjah.`;

export async function generateMetadata({ searchParams }: { searchParams: Promise<QueryInput> }): Promise<Metadata> {
  const query = await searchParams;
  const filtered = Boolean(param(query, "search") || pageFrom(query) > 1);
  return {
    title: "Categories",
    description,
    alternates: { canonical: "/categories" },
    openGraph: { title: "Categories", description, url: "/categories" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default function CategoriesPage({ searchParams }: { searchParams: Promise<QueryInput> }) {
  return (
    <Suspense fallback={<ScreenStatus label="Opening categories…" />}>
      <CategoriesView searchParams={searchParams} />
    </Suspense>
  );
}
