import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminNote } from "@/components/admin/admin-views";
import { PaymentsAdmin } from "@/components/admin/payments-admin";
import { loadPage } from "@/lib/load";
import { listPayments, objectIdError } from "@/lib/payments";
import { param, type QueryInput } from "@/lib/query";
import { isPaymentRecordStatus } from "@/types/status";

export const instant = false;

export const metadata: Metadata = {
  title: "Payments",
};

export default function AdminPaymentsPage({ searchParams }: { searchParams: Promise<QueryInput> }) {
  return (
    <>
      <AdminNote>
        Online payments for customer orders. A customer only sees their own. Open a payment to change its status.
      </AdminNote>
      <Suspense fallback={<p className="text-sm text-ink/60">Loading payments…</p>}>
        <AdminPaymentsData searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function AdminPaymentsData({ searchParams }: { searchParams: Promise<QueryInput> }) {
  const query = await searchParams;
  const orderId = param(query, "orderId");
  const userId = param(query, "userId");
  const statusValue = param(query, "status");
  const status = isPaymentRecordStatus(statusValue) ? statusValue : undefined;
  const invalid = objectIdError(orderId, "order id") || objectIdError(userId, "user id");
  const loaded = invalid
    ? { data: null, error: invalid }
    : await loadPage(
        () =>
          listPayments({
            page: 1,
            limit: 10,
            status,
            orderId: orderId || undefined,
            userId: userId || undefined,
          }),
        null,
        "Payments could not be loaded.",
      );
  return (
    <PaymentsAdmin
      initialPayments={loaded.data?.payments ?? []}
      initialPagination={loaded.data?.pagination ?? null}
      initialError={loaded.error}
    />
  );
}
