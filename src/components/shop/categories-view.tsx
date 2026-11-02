import { Suspense } from "react";
import { CategoryCard } from "@/components/shop/category-card";
import { CatalogPager } from "@/components/shop/catalog-pager";
import { PageFrame } from "@/components/shop/page-frame";
import { QuerySearch } from "@/components/shop/query-search";
import { listCategories } from "@/lib/categories";
import { loadPage } from "@/lib/load";
import { routes } from "@/lib/navigation";
import { pageFrom, param, type QueryInput } from "@/lib/query";

const limit = 18;

export async function CategoriesView({ searchParams }: { searchParams: Promise<QueryInput> }) {
  const query = await searchParams;
  const page = pageFrom(query);
  const search = param(query, "search");
  const loaded = await loadPage(
    () => listCategories({ page, limit, search: search || undefined, status: "active" }),
    { success: true as const, categories: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } },
    "Categories could not be loaded.",
  );
  const categories = loaded.error ? [] : loaded.data.categories;
  const pagination = loaded.error ? null : loaded.data.pagination;

  return (
    <PageFrame
      eyebrow="Categories"
      title="Categories"
      lede="Choose a category and open the products kept there."
    >
      <Suspense fallback={<div className="mb-6 h-12 rounded-full bg-paper" />}>
        <QuerySearch
          pathname={routes.categories}
          placeholder="Search categories"
          label="Search categories"
          total={pagination?.total ?? null}
          unit="categories"
        />
      </Suspense>
      {loaded.error ? <p className="mb-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{loaded.error}</p> : null}
      {!loaded.error && categories.length === 0 ? (
        <p className="rounded-[1.5rem] border border-ink/10 bg-paper px-6 py-8 text-sm text-ink/70">
          No categories match this search.
        </p>
      ) : null}
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryCard category={category} />
          </li>
        ))}
      </ul>
      <CatalogPager
        pathname={routes.categories}
        query={query}
        page={pagination?.page ?? page}
        totalPages={pagination?.totalPages ?? 0}
        cursor
      />
    </PageFrame>
  );
}
