"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PaymentActions } from "@/components/shop/payment-actions";
import { PageFrame } from "@/components/shop/page-frame";
import { StatusBadge } from "@/components/shop/status-badge";
import { ApiError, errorText } from "@/lib/apiError";
import { formatOrderWhen } from "@/lib/orders";
import { formatPaymentAmount, getPayment } from "@/lib/payments";
import { routes } from "@/lib/navigation";
import type { PaymentRecord } from "@/types/payment";

export function PaymentDetailView({ id }: { id: string }) {
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPayment(id)
      .then((item) => {
        if (!active) return;
        setPayment(item);
        setError("");
      })
      .catch((caught) => {
        if (!active) return;
        setPayment(null);
        setError(caught instanceof ApiError && caught.status === 404 ? "Payment not found." : errorText(caught, "This payment could not be opened."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <PageFrame eyebrow="Payment" title="Payment">
      <Link href={routes.payments} className="text-sm text-wine">
        Payment history
      </Link>
      {loading ? <p className="mt-6 text-sm text-ink/60">Opening this payment…</p> : null}
      {error ? <p className="mt-6 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {payment ? (
        <article className="mt-4 max-w-3xl overflow-hidden rounded-[1.75rem] border border-ink/10 bg-paper">
          <div className="border-b border-dashed border-ink/15 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-wine">{payment.orderNumber ?? "Order"}</p>
                <h1 className="mt-2 font-display text-5xl tracking-tight">
                  {formatPaymentAmount(payment.amount, payment.currency)}
                </h1>
              </div>
              <StatusBadge status={payment.status} kind="payment" />
            </div>
            {payment.failureReason ? (
              <p className="mt-5 rounded-2xl bg-blush px-4 py-3 text-sm leading-6 text-wine">{payment.failureReason}</p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <PaymentActions payment={payment} allowNewLink size="md" />
              <Link
                href={`${routes.orders}/${payment.orderId}`}
                className="inline-flex h-12 items-center justify-center rounded-full border border-ink/15 px-5 text-sm hover:border-wine hover:text-wine"
              >
                View order
              </Link>
            </div>
          </div>
          <dl className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
            <Fact label="Created" value={formatOrderWhen(payment.createdAt)} />
            <Fact label="Paid" value={payment.paidAt ? formatOrderWhen(payment.paidAt) : "Not paid"} />
            <Fact label="Updated" value={formatOrderWhen(payment.updatedAt)} />
            <Fact label="Currency" value={(payment.currency || "").toUpperCase() || "—"} />
          </dl>
        </article>
      ) : null}
    </PageFrame>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-ink/45">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}
