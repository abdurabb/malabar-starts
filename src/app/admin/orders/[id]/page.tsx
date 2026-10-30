import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderAdminDetail } from "@/components/admin/order-admin-detail";

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
  return <OrderAdminDetail id={id} />;
}
