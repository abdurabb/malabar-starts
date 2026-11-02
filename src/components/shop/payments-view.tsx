"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useServerSeed } from "@/hooks/useServerSeed";
import { FilterSelect, controlClass } from "@/components/shop/filter-controls";
import { PageFrame } from "@/components/shop/page-frame";
import { PaymentActions } from "@/components/shop/payment-actions";
import { PaymentPager, PaymentRows } from "@/components/shop/payment-card";
import { errorText } from "@/lib/apiError";
import { canContinuePayment, canRequestPaymentLink, listPayments, objectIdError } from "@/lib/payments";
import { routes } from "@/lib/navigation";
import { isPaymentRecordStatus, paymentStatusChoices } from "@/types/status";
import type { PaymentRecord } from "@/types/payment";
import type { Pagination } from "@/types/product";
import type { PaymentRecordStatus } from "@/types/status";

const limit = 8;

export function PaymentsView({
  initialPayments = [],
  initialPagination = null,
  initialError = "",
}: {
  initialPayments?: PaymentRecord[];
  initialPagination?: Pagination | null;
  initialError?: string;
}) {
  const searchParams = useSearchParams();
  const paramOrderId = searchParams.get("orderId") ?? "";
  const seeded = initialPagination !== null && !initialError;
  const consumeSeed = useServerSeed(seeded);
  const [orderId, setOrderId] = useState(paramOrderId);
  const [appliedOrderId, setAppliedOrderId] = useState(paramOrderId);
  const [trackedOrderId, setTrackedOrderId] = useState(paramOrderId);
  const [status, setStatus] = useState<PaymentRecordStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [payments, setPayments] = useState<PaymentRecord[]>(seeded ? initialPayments : []);
  const [pagination, setPagination] = useState<Pagination | null>(seeded ? initialPagination : null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!seeded);

  if (paramOrderId !== trackedOrderId) {
    setTrackedOrderId(paramOrderId);
    setOrderId(paramOrderId);
    setAppliedOrderId(paramOrderId);
    setPage(1);
  }

  useEffect(() => {
    const next = orderId.trim();
    if (next === appliedOrderId) return;
    const handle = window.setTimeout(() => {
      setPage(1);
      setAppliedOrderId(next);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [orderId, appliedOrderId]);

  useEffect(() => {
    const issue = objectIdError(appliedOrderId, "order id");
    if (issue) {
      setError(issue);
      setLoading(false);
      return;
    }
    if (consumeSeed()) return;
    let active = true;
    setLoading(true);
    listPayments({
      page,
      limit,
      status: status === "all" ? undefined : status,
      orderId: appliedOrderId || undefined,
    })
      .then((result) => {
        if (!active) return;
        setPayments(result.payments);
        setPagination(result.pagination);
        setError("");
        if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
          setPage(result.pagination.totalPages);
        }
      })
      .catch((caught) => {
        if (!active) return;
        setPayments([]);
        setPagination(null);
        setError(errorText(caught, "Payments could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, appliedOrderId, status]);

  const totalPages = pagination?.totalPages ?? 0;
  const statusOptions = [{ value: "all", label: "All statuses" }, ...paymentStatusChoices()];
  const filtered = Boolean(appliedOrderId || status !== "all");

  return (
    <PageFrame
      eyebrow="Payments"
      title="Payment history"
      lede="Online payments for your orders. Continue an open checkout, or request a new link when the last one expired."
    >
      {pagination ? <p className="mb-5 text-sm text-ink/55">{pagination.total} payments</p> : null}
      <div className="grid gap-4 md:grid-cols-[14rem_minmax(0,1fr)]">
        <FilterSelect
          label="Status"
          value={status}
          onChange={(value) => {
            if (value !== "all" && !isPaymentRecordStatus(value)) return;
            setStatus(value as PaymentRecordStatus | "all");
            setPage(1);
          }}
          options={statusOptions}
        />
        <label className="block">
          <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.16em] text-ink/45">Order</span>
          <input
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Order id"
            maxLength={100}
            aria-label="Filter by order id"
            className={controlClass}
          />
        </label>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {loading && payments.length === 0 ? <p className="mt-6 text-sm text-ink/60">Loading payments…</p> : null}
      {!loading && !error && payments.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-ink/10 bg-paper p-8">
          <p className="text-base leading-7 text-ink/70">{filtered ? "No payments match." : "No payments yet."}</p>
          <Link href={routes.orders} className="mt-4 inline-flex text-wine">
            View orders
          </Link>
        </div>
      ) : null}
      {payments.length > 0 ? (
        <PaymentRows
          payments={payments}
          hrefFor={(payment) => `${routes.payments}/${payment.id}`}
          actionsFor={(payment) =>
            canContinuePayment(payment) || canRequestPaymentLink(payment.status) ? (
              <PaymentActions payment={payment} allowNewLink />
            ) : null
          }
        />
      ) : null}
      <PaymentPager page={page} totalPages={totalPages} currentPage={pagination?.page} onPage={setPage} />
    </PageFrame>
  );
}
