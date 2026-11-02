import { Suspense } from "react";
import { BrandCard } from "@/components/shop/brand-card";
import { CatalogPager } from "@/components/shop/catalog-pager";
import { PageFrame } from "@/components/shop/page-frame";
import { QuerySearch } from "@/components/shop/query-search";
import { listBrands } from "@/lib/brands";
import { loadPage } from "@/lib/load";
import { routes } from "@/lib/navigation";
import { pageFrom, param, type QueryInput } from "@/lib/query";

const limit = 18;

export async function BrandsView({ searchParams }: { searchParams: Promise<QueryInput> }) {
  const query = await searchParams;
  const page = pageFrom(query);
  const search = param(query, "search");
  const loaded = await loadPage(
    () => listBrands({ page, limit, search: search || undefined, status: "active" }),
    { success: true as const, brands: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } },
    "Brands could not be loaded.",
  );
  const brands = loaded.error ? [] : loaded.data.brands;
  const pagination = loaded.error ? null : loaded.data.pagination;

  return (
    <PageFrame
      eyebrow="Brands"
      title="Brands"
      lede="Choose a brand and open the products sold under that name."
    >
      <Suspense fallback={<div className="mb-6 h-12 rounded-full bg-paper" />}>
        <QuerySearch
          pathname={routes.brands}
          placeholder="Search brands"
          label="Search brands"
          total={pagination?.total ?? null}
          unit="brands"
        />
      </Suspense>
      {loaded.error ? <p className="mb-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{loaded.error}</p> : null}
      {!loaded.error && brands.length === 0 ? (
        <p className="rounded-[1.5rem] border border-ink/10 bg-paper px-6 py-8 text-sm text-ink/70">
          No brands match this search.
        </p>
      ) : null}
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
        {brands.map((brand) => (
          <li key={brand.id}>
            <BrandCard brand={brand} />
          </li>
        ))}
      </ul>
      <CatalogPager
        pathname={routes.brands}
        query={query}
        page={pagination?.page ?? page}
        totalPages={pagination?.totalPages ?? 0}
        cursor
      />
    </PageFrame>
  );
}
