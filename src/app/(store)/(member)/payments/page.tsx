import { Suspense } from "react";
import type { Metadata } from "next";
import { ScreenStatus } from "@/components/auth/screen-status";
import { PaymentsView } from "@/components/shop/payments-view";
import { loadPage } from "@/lib/load";
import { listPayments, objectIdError } from "@/lib/payments";
import { param, type QueryInput } from "@/lib/query";

export const instant = false;

export const metadata: Metadata = {
  title: "Payment history",
};

export default function PaymentsPage({ searchParams }: { searchParams: Promise<QueryInput> }) {
  return (
    <Suspense fallback={<ScreenStatus label="Opening payments…" />}>
      <PaymentsPageData searchParams={searchParams} />
    </Suspense>
  );
}

async function PaymentsPageData({ searchParams }: { searchParams: Promise<QueryInput> }) {
  const orderId = param(await searchParams, "orderId");
  const invalid = objectIdError(orderId, "order id");
  const loaded = invalid
    ? { data: null, error: invalid }
    : await loadPage(
        () => listPayments({ page: 1, limit: 8, orderId: orderId || undefined }),
        null,
        "Payments could not be loaded.",
      );
  return (
    <PaymentsView
      initialPayments={loaded.data?.payments ?? []}
      initialPagination={loaded.data?.pagination ?? null}
      initialError={loaded.error}
    />
  );
}
