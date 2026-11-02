import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminNote } from "@/components/admin/admin-views";
import { OrdersAdmin } from "@/components/admin/orders-admin";
import { loadPage } from "@/lib/load";
import { listOrders } from "@/lib/orders";

export const instant = false;

export const metadata: Metadata = {
  title: "Orders",
};

export default function AdminOrdersPage() {
  return (
    <>
      <AdminNote>Orders placed from a customer cart. Open an order to move it forward, or cancel it before it ships.</AdminNote>
      <Suspense fallback={<p className="text-sm text-ink/60">Opening orders…</p>}>
        <AdminOrdersData />
      </Suspense>
    </>
  );
}

async function AdminOrdersData() {
  const loaded = await loadPage(
    () => listOrders({ page: 1, limit: 10, sort: "newest" }),
    null,
    "Orders could not be loaded.",
  );
  return (
    <OrdersAdmin
      initialOrders={loaded.data?.orders ?? []}
      initialPagination={loaded.data?.pagination ?? null}
      initialError={loaded.error}
    />
  );
}
