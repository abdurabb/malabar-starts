import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsAdmin } from "@/components/admin/products-admin";
import { loadPage } from "@/lib/load";
import { listBrandOptions, listCategoryOptions, listProducts } from "@/lib/products";

export const instant = false;

export const metadata: Metadata = {
  title: "Products",
};

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink/60">Opening products…</p>}>
      <AdminProductsData />
    </Suspense>
  );
}

async function AdminProductsData() {
  const [loaded, brands, categories] = await Promise.all([
    loadPage(
      () => listProducts({ page: 1, limit: 10, status: "all", sort: "newest" }),
      null,
      "Products could not be loaded.",
    ),
    listBrandOptions().catch(() => []),
    listCategoryOptions().catch(() => []),
  ]);
  return (
    <ProductsAdmin
      initialProducts={loaded.data?.products ?? []}
      initialPagination={loaded.data?.pagination ?? null}
      initialError={loaded.error}
      initialBrands={brands}
      initialCategories={categories}
    />
  );
}