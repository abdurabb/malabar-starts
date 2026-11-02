import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoriesAdmin } from "@/components/admin/categories-admin";
import { listCategories } from "@/lib/categories";
import { loadPage } from "@/lib/load";

export const instant = false;

export const metadata: Metadata = {
  title: "Categories",
};

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink/60">Opening categories…</p>}>
      <AdminCategoriesData />
    </Suspense>
  );
}

async function AdminCategoriesData() {
  const loaded = await loadPage(
    () => listCategories({ page: 1, limit: 12, status: "all" }),
    null,
    "Categories could not be loaded.",
  );
  return (
    <CategoriesAdmin
      initialCategories={loaded.data?.categories ?? []}
      initialPagination={loaded.data?.pagination ?? null}
      initialError={loaded.error}
    />
  );
}
