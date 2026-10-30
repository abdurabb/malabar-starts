import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentDetailView } from "@/components/shop/payment-detail";

export const instant = false;

export const metadata: Metadata = {
  title: "Payment",
};

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-5 py-12 text-sm text-ink/60">Opening this payment…</p>}>
      <PaymentRoute params={params} />
    </Suspense>
  );
}

async function PaymentRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaymentDetailView id={id} />;
}
