import { Suspense } from "react";
import type { Metadata } from "next";
import { CouponsAdmin } from "@/components/admin/coupons-admin";
import { listCoupons } from "@/lib/coupons";
import { loadPage } from "@/lib/load";

export const instant = false;

export const metadata: Metadata = {
  title: "Coupons",
};

export default function AdminCouponsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink/60">Opening coupons…</p>}>
      <AdminCouponsData />
    </Suspense>
  );
}

async function AdminCouponsData() {
  const loaded = await loadPage(
    () => listCoupons({ page: 1, limit: 12, status: "all" }),
    null,
    "Coupons could not be loaded.",
  );
  return (
    <CouponsAdmin
      initialCoupons={loaded.data?.coupons ?? []}
      initialPagination={loaded.data?.pagination ?? null}
      initialError={loaded.error}
    />
  );
}
