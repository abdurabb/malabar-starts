import { Suspense } from "react";
import type { Metadata } from "next";
import { BrandsAdmin } from "@/components/admin/brands-admin";
import { listBrands } from "@/lib/brands";
import { loadPage } from "@/lib/load";

export const instant = false;

export const metadata: Metadata = {
  title: "Brands",
};

export default function AdminBrandsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink/60">Opening brands…</p>}>
      <AdminBrandsData />
    </Suspense>
  );
}

async function AdminBrandsData() {
  const loaded = await loadPage(() => listBrands({ page: 1, limit: 12, status: "all" }), null, "Brands could not be loaded.");
  return (
    <BrandsAdmin
      initialBrands={loaded.data?.brands ?? []}
      initialPagination={loaded.data?.pagination ?? null}
      initialError={loaded.error}
    />
  );
}
