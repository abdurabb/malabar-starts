import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderDetailView } from "@/components/shop/order-detail-view";
import { ApiError, errorText } from "@/lib/apiError";
import { listAddresses } from "@/lib/addresses";
import { getOrder } from "@/lib/orders";
import { canEditOrder } from "@/types/status";
import type { Address } from "@/types/address";
import type { OrderRecord } from "@/types/order";

export const instant = false;

export const metadata: Metadata = {
  title: "Order",
};

export default function CustomerOrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-5 py-12 text-sm text-ink/60">Opening this order…</p>}>
      <CustomerOrderRoute params={params} />
    </Suspense>
  );
}

async function CustomerOrderRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let order: OrderRecord | null = null;
  let error = "";
  try {
    order = await getOrder(id);
  } catch (caught) {
    error = caught instanceof ApiError && caught.status === 404 ? "Order not found." : errorText(caught, "This order could not be opened.");
  }
  let addresses: Address[] | undefined;
  if (order && canEditOrder(order.status)) {
    try {
      addresses = (await listAddresses({ limit: 50, sort: "newest" })).addresses;
    } catch {
      addresses = undefined;
    }
  }
  return <OrderDetailView id={id} initialOrder={order} initialError={error} initialAddresses={addresses} />;
}
