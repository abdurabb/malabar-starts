import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentDetailView } from "@/components/shop/payment-detail";
import { ApiError, errorText } from "@/lib/apiError";
import { getPayment } from "@/lib/payments";
import type { PaymentRecord } from "@/types/payment";

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
  let payment: PaymentRecord | null = null;
  let error = "";
  try {
    payment = await getPayment(id);
  } catch (caught) {
    error = caught instanceof ApiError && caught.status === 404 ? "Payment not found." : errorText(caught, "This payment could not be opened.");
  }
  return <PaymentDetailView id={id} initialPayment={payment} initialError={error} />;
}
