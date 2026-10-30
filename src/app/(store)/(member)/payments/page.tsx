import { Suspense } from "react";
import type { Metadata } from "next";
import { ScreenStatus } from "@/components/auth/screen-status";
import { PaymentsView } from "@/components/shop/payments-view";

export const instant = false;

export const metadata: Metadata = {
  title: "Payment history",
};

export default function PaymentsPage() {
  return (
    <Suspense fallback={<ScreenStatus label="Opening payments…" />}>
      <PaymentsView />
    </Suspense>
  );
}
