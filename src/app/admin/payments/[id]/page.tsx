import { Suspense } from "react";
import { ApiError, errorText } from "@/lib/apiError";
import { getPayment } from "@/lib/payments";
import type { PaymentRecord } from "@/types/payment";
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
  let payment: PaymentRecord | null = null;
  let error = "";
  try {
    payment = await getPayment(id);
  } catch (caught) {
    error = caught instanceof ApiError && caught.status === 404 ? "Payment not found." : errorText(caught, "This payment could not be opened.");
  }
  return <PaymentAdminDetail id={id} initialPayment={payment} initialError={error} />;
}
