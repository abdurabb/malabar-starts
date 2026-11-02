import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderAdminDetail } from "@/components/admin/order-admin-detail";
import { ApiError, errorText } from "@/lib/apiError";
import { getOrder } from "@/lib/orders";
import type { OrderRecord } from "@/types/order";

export const instant = false;

export const metadata: Metadata = {
  title: "Order",
};

export default function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-ink/60">Opening this order…</p>}>
      <AdminOrderRoute params={params} />
    </Suspense>
  );
}

async function AdminOrderRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let order: OrderRecord | null = null;
  let error = "";
  try {
    order = await getOrder(id);
  } catch (caught) {
    error = caught instanceof ApiError && caught.status === 404 ? "Order not found." : errorText(caught, "This order could not be opened.");
  }
  return <OrderAdminDetail id={id} initialOrder={order} initialError={error} />;
}
