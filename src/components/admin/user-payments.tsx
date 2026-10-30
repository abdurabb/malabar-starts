"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FilterSelect } from "@/components/shop/filter-controls";
import { PaymentPager, PaymentRows } from "@/components/shop/payment-card";
import { errorText } from "@/lib/apiError";
import { listPayments } from "@/lib/payments";
import { isPaymentRecordStatus, paymentStatusChoices } from "@/types/status";
import type { PaymentRecord } from "@/types/payment";
import type { Pagination } from "@/types/product";
import type { PaymentRecordStatus } from "@/types/status";

const limit = 8;

export function UserPayments({ userId }: { userId: string }) {
  const [status, setStatus] = useState<PaymentRecordStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listPayments({
      page,
      limit,
      userId,
      status: status === "all" ? undefined : status,
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
  }, [page, status, userId]);

  const totalPages = pagination?.totalPages ?? 0;

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full max-w-xs">
          <FilterSelect
            label="Status"
            value={status}
            onChange={(value) => {
              if (value !== "all" && !isPaymentRecordStatus(value)) return;
              setStatus(value as PaymentRecordStatus | "all");
              setPage(1);
            }}
            options={[{ value: "all", label: "All statuses" }, ...paymentStatusChoices()]}
          />
        </div>
        <Link href={`/admin/payments?userId=${encodeURIComponent(userId)}`} className="text-sm text-wine">
          Open in payments
        </Link>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {loading && payments.length === 0 ? <p className="mt-4 text-sm text-ink/60">Loading payments…</p> : null}
      {!loading && !error && payments.length === 0 ? (
        <p className="mt-4 text-sm text-ink/60">
          {status === "all" ? "This customer has no payments." : "No payments match that status."}
        </p>
      ) : null}
      {payments.length > 0 ? (
        <PaymentRows payments={payments} hrefFor={(payment) => `/admin/payments/${payment.id}`} showOrder />
      ) : null}
      <PaymentPager page={page} totalPages={totalPages} currentPage={pagination?.page} onPage={setPage} />
    </div>
  );
}
