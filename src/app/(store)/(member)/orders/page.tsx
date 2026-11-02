import { Suspense } from "react";
import type { Metadata } from "next";
import { ScreenStatus } from "@/components/auth/screen-status";
import { OrdersView } from "@/components/shop/orders-view";
import { loadPage } from "@/lib/load";
import { listOrders } from "@/lib/orders";

export const instant = false;

export const metadata: Metadata = {
  title: "Orders",
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<ScreenStatus label="Opening orders…" />}>
      <OrdersPageData />
    </Suspense>
  );
}

async function OrdersPageData() {
  const loaded = await loadPage(
    () => listOrders({ page: 1, limit: 8, sort: "newest" }),
    null,
    "Orders could not be loaded.",
  );
  return (
    <OrdersView
      initialOrders={loaded.data?.orders ?? []}
      initialPagination={loaded.data?.pagination ?? null}
      initialError={loaded.error}
    />
  );
}
