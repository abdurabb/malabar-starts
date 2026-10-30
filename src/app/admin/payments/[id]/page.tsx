import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentAdminDetail } from "@/components/admin/payment-admin-detail";

export const instant = false;

export const metadata: Metadata = {
  title: "Payment",
};

export default function AdminPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-ink/60">Opening this payment…</p>}>
      <AdminPaymentRoute params={params} />
    </Suspense>
  );
}

async function AdminPaymentRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaymentAdminDetail id={id} />;
}
