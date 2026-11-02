"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useServerSeed } from "@/hooks/useServerSeed";
import { FilterSelect, controlClass } from "@/components/shop/filter-controls";
import { PaymentPager, PaymentRows } from "@/components/shop/payment-card";
import { errorText } from "@/lib/apiError";
import { listPayments, objectIdError } from "@/lib/payments";
import { isPaymentRecordStatus, paymentStatusChoices } from "@/types/status";
import type { PaymentRecord } from "@/types/payment";
import type { Pagination } from "@/types/product";
import type { PaymentRecordStatus } from "@/types/status";

const limit = 10;

export function PaymentsAdmin({
  initialPayments = [],
  initialPagination = null,
  initialError = "",
}: {
  initialPayments?: PaymentRecord[];
  initialPagination?: Pagination | null;
  initialError?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramOrderId = searchParams.get("orderId") ?? "";
  const paramUserId = searchParams.get("userId") ?? "";
  const paramStatus = searchParams.get("status") ?? "";
  const safeStatus: PaymentRecordStatus | "all" = isPaymentRecordStatus(paramStatus) ? paramStatus : "all";
  const [orderId, setOrderId] = useState(paramOrderId);
  const [userId, setUserId] = useState(paramUserId);
  const [appliedOrderId, setAppliedOrderId] = useState(paramOrderId);
  const [appliedUserId, setAppliedUserId] = useState(paramUserId);
  const [tracked, setTracked] = useState(`${paramOrderId}\n${paramUserId}\n${safeStatus}`);
  const [status, setStatus] = useState<PaymentRecordStatus | "all">(safeStatus);
  const [page, setPage] = useState(1);
  const seeded = initialPagination !== null && !initialError;
  const consumeSeed = useServerSeed(seeded);
  const [payments, setPayments] = useState<PaymentRecord[]>(seeded ? initialPayments : []);
  const [pagination, setPagination] = useState<Pagination | null>(seeded ? initialPagination : null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!seeded);

  const nextTracked = `${paramOrderId}\n${paramUserId}\n${safeStatus}`;
  if (nextTracked !== tracked) {
    setTracked(nextTracked);
    setOrderId(paramOrderId);
    setUserId(paramUserId);
    setAppliedOrderId(paramOrderId);
    setAppliedUserId(paramUserId);
    setStatus(safeStatus);
    setPage(1);
  }

  useEffect(() => {
    const nextOrder = orderId.trim();
    const nextUser = userId.trim();
    if (nextOrder === appliedOrderId && nextUser === appliedUserId) return;
    const handle = window.setTimeout(() => {
      setPage(1);
      setAppliedOrderId(nextOrder);
      setAppliedUserId(nextUser);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [orderId, userId, appliedOrderId, appliedUserId]);

  useEffect(() => {
    const issue = objectIdError(appliedOrderId, "order id") || objectIdError(appliedUserId, "user id");
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
      userId: appliedUserId || undefined,
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
  }, [page, appliedOrderId, appliedUserId, status]);

  const totalPages = pagination?.totalPages ?? 0;
  const statusOptions = [{ value: "all", label: "All statuses" }, ...paymentStatusChoices()];
  const filtered = Boolean(appliedOrderId || appliedUserId || status !== "all");

  function clearFilters() {
    setStatus("all");
    setOrderId("");
    setUserId("");
    setAppliedOrderId("");
    setAppliedUserId("");
    setPage(1);
    router.replace("/admin/payments");
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid min-w-0 flex-1 gap-4 md:grid-cols-3">
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
            <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.16em] text-ink/45">Order id</span>
            <input
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              maxLength={100}
              aria-label="Filter by order id"
              className={controlClass}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.16em] text-ink/45">Customer id</span>
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              maxLength={100}
              aria-label="Filter by customer id"
              className={controlClass}
            />
          </label>
        </div>
        {pagination ? <p className="shrink-0 text-sm text-ink/55">{pagination.total} payments</p> : null}
      </div>
      {filtered ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="h-11 cursor-pointer rounded-full border border-ink/15 px-5 text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : null}
      {error ? <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {loading && payments.length === 0 ? <p className="mt-6 text-sm text-ink/60">Loading payments…</p> : null}
      {!loading && !error && payments.length === 0 ? (
        <p className="mt-6 rounded-[1.5rem] border border-dashed border-ink/15 bg-paper px-6 py-12 text-center text-base leading-7 text-ink/70">
          {filtered ? "No payments match." : "No payments yet."}
        </p>
      ) : null}
      {payments.length > 0 ? (
        <PaymentRows payments={payments} hrefFor={(payment) => `/admin/payments/${payment.id}`} showCustomer />
      ) : null}
      <PaymentPager page={page} totalPages={totalPages} currentPage={pagination?.page} onPage={setPage} />
    </div>
  );
}
