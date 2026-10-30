import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderDetailView } from "@/components/shop/order-detail-view";

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
  return <OrderDetailView id={id} />;
}
