import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminNote } from "@/components/admin/admin-views";
import { PaymentsAdmin } from "@/components/admin/payments-admin";

export const instant = false;

export const metadata: Metadata = {
  title: "Payments",
};

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink/60">Loading payments…</p>}>
      <AdminNote>
        Online payments for customer orders. A customer only sees their own. Open a payment to change its status.
      </AdminNote>
      <PaymentsAdmin />
    </Suspense>
  );
}
