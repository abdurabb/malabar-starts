import { Suspense } from "react";
import { ScreenStatus } from "@/components/auth/screen-status";
import { BrandsView } from "@/components/shop/brands-view";
import { pageFrom, param, type QueryInput } from "@/lib/query";
import { siteName } from "@/lib/site";
import type { Metadata } from "next";

const description = `Brands stocked by ${siteName} in Sharjah, from fresh chicken and frozen poultry to beef and mutton.`;

export async function generateMetadata({ searchParams }: { searchParams: Promise<QueryInput> }): Promise<Metadata> {
  const query = await searchParams;
  const filtered = Boolean(param(query, "search") || pageFrom(query) > 1);
  return {
    title: "Brands",
    description,
    alternates: { canonical: "/brands" },
    openGraph: { title: "Brands", description, url: "/brands" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default function BrandsPage({ searchParams }: { searchParams: Promise<QueryInput> }) {
  return (
    <Suspense fallback={<ScreenStatus label="Opening brands…" />}>
      <BrandsView searchParams={searchParams} />
    </Suspense>
  );
}
