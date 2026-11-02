import { Suspense } from "react";
import { CatalogPager } from "@/components/shop/catalog-pager";
import { PageFrame } from "@/components/shop/page-frame";
import { ProductCard } from "@/components/shop/product-card";
import { ProductFilters } from "@/components/shop/product-filters";
import { loadPage } from "@/lib/load";
import { routes } from "@/lib/navigation";
import { listBrandOptions, listCategoryOptions, listProducts } from "@/lib/products";
import { pageFrom, param, type QueryInput } from "@/lib/query";
import type { CatalogProduct, Pagination, ProductSort } from "@/types/product";

const limit = 12;
const sorts = new Set<ProductSort>(["newest", "price_asc", "price_desc", "name"]);

function asSort(value: string): ProductSort {
  return sorts.has(value as ProductSort) ? (value as ProductSort) : "newest";
}

function priceOf(value: string) {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export async function ProductsView({ searchParams }: { searchParams: Promise<QueryInput> }) {
  const query = await searchParams;
  const page = pageFrom(query);
  const search = param(query, "search");
  const brand = param(query, "brand");
  const category = param(query, "category");
  const sort = asSort(param(query, "sort") || "newest");
  const minPrice = param(query, "minPrice");
  const maxPrice = param(query, "maxPrice");
  const empty = {
    success: true as const,
    products: [] as CatalogProduct[],
    pagination: { page: 1, limit, total: 0, totalPages: 0 } satisfies Pagination,
  };
  const [loaded, brands, categories] = await Promise.all([
    loadPage(
      () =>
        listProducts({
          page,
          limit,
          search: search || undefined,
          brand: brand || undefined,
          category: category || undefined,
          sort,
          minPrice: priceOf(minPrice),
          maxPrice: priceOf(maxPrice),
        }),
      empty,
      "Products could not be loaded.",
    ),
    listBrandOptions().catch(() => []),
    listCategoryOptions().catch(() => []),
  ]);
  const products = loaded.error ? [] : loaded.data.products;
  const pagination = loaded.error ? null : loaded.data.pagination;
  const categoryName = category ? categories.find((item) => item.id === category)?.name : "";
  const brandName = brand ? brands.find((item) => item.id === brand)?.name : "";
  const heading = categoryName && !brandName ? categoryName : brandName && !categoryName ? brandName : "Products";
  const lede =
    categoryName && !brandName
      ? `${categoryName} from the Sharjah counter.`
      : brandName && !categoryName
        ? `${brandName} products from the Sharjah counter.`
        : "Search the counter, then filter by category, brand, or price.";

  return (
    <PageFrame eyebrow="The counter" title={heading} lede={lede}>
      <Suspense fallback={<div className="mb-6 h-12 rounded-full bg-paper" />}>
        <ProductFilters brands={brands} categories={categories} pagination={pagination} />
      </Suspense>
      <div>
        {loaded.error ? <p className="mb-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{loaded.error}</p> : null}
        {!loaded.error && products.length === 0 ? (
          <p className="rounded-[1.5rem] border border-ink/10 bg-paper px-6 py-8 text-sm text-ink/70">
            No products match these filters.
          </p>
        ) : null}
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
        <CatalogPager pathname={routes.products} query={query} page={pagination?.page ?? page} totalPages={pagination?.totalPages ?? 0} />
      </div>
    </PageFrame>
  );
}
