"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useServerSeed } from "@/hooks/useServerSeed";
import { FilterSelect } from "@/components/shop/filter-controls";
import { StatusBadge } from "@/components/shop/status-badge";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ApiError, errorText } from "@/lib/apiError";
import { formatOrderWhen } from "@/lib/orders";
import { failureReasonError, formatPaymentAmount, getPayment, updatePaymentStatus } from "@/lib/payments";
import { toast } from "@/lib/toast";
import { isPaymentRecordStatus, paymentStatusChoices, statusLabel } from "@/types/status";
import type { PaymentRecord } from "@/types/payment";
import type { PaymentRecordStatus } from "@/types/status";

export function PaymentAdminDetail({
  id,
  initialPayment = null,
  initialError = "",
}: {
  id: string;
  initialPayment?: PaymentRecord | null;
  initialError?: string;
}) {
  const { confirm, dialog } = useConfirm();
  const seeded = initialPayment !== null && !initialError;
  const consumeSeed = useServerSeed(seeded);
  const [payment, setPayment] = useState<PaymentRecord | null>(seeded ? initialPayment : null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!seeded);

  useEffect(() => {
    if (consumeSeed()) return;
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

  if (loading) return <p className="text-sm text-ink/60">Opening this payment…</p>;

  if (!payment) {
    return (
      <div>
        <Link href="/admin/payments" className="text-sm text-wine">
          All payments
        </Link>
        <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error || "Payment not found."}</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/payments" className="text-sm text-wine">
        All payments
      </Link>
      <article className="mt-4 overflow-hidden rounded-[1.75rem] border border-ink/10 bg-paper">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-ink/15 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-wine">{payment.orderNumber ?? "Order"}</p>
            <h2 className="page-title mt-2">{formatPaymentAmount(payment.amount, payment.currency)}</h2>
            <p className="mt-3 text-sm text-ink/55">{formatOrderWhen(payment.createdAt)}</p>
          </div>
          <StatusBadge status={payment.status} kind="payment" />
        </div>
        {payment.failureReason ? (
          <p className="mx-6 mt-6 rounded-2xl bg-blush px-4 py-3 text-sm leading-6 text-wine sm:mx-8">{payment.failureReason}</p>
        ) : null}
        <dl className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
          <Fact label="Order">
            <Link href={`/admin/orders/${payment.orderId}`} className="hover:text-wine">
              {payment.orderNumber ?? payment.orderId}
            </Link>
          </Fact>
          <Fact label="Customer">
            <Link href={`/admin/customers/${payment.userId}`} className="hover:text-wine">
              Open customer
            </Link>
          </Fact>
          <Fact label="Paid">{payment.paidAt ? formatOrderWhen(payment.paidAt) : "Not paid"}</Fact>
          <Fact label="Updated">{formatOrderWhen(payment.updatedAt)}</Fact>
          <Fact label="Currency">{(payment.currency || "").toUpperCase() || "—"}</Fact>
          <Fact label="Checkout session">{payment.stripeSessionId || "—"}</Fact>
          <Fact label="Payment intent">{payment.stripePaymentIntentId || "—"}</Fact>
        </dl>
      </article>
      <StatusEditor
        payment={payment}
        onSave={async (input) => {
          const paid = input.status === "paid";
          const ok = await confirm({
            title: "Update payment?",
            message: paid
              ? "This payment will be marked paid. The order will be marked paid, and the payment method will be set to online."
              : `This payment will be marked ${statusLabel(input.status).toLowerCase()}.`,
            confirmLabel: "Update status",
          });
          if (!ok) return;
          const result = await updatePaymentStatus(payment.id, input);
          setPayment(result.payment);
          toast(result.message);
        }}
      />
      {dialog}
    </div>
  );
}

function StatusEditor({
  payment,
  onSave,
}: {
  payment: PaymentRecord;
  onSave: (input: { status: PaymentRecordStatus; failureReason?: string }) => Promise<void>;
}) {
  const [status, setStatus] = useState<PaymentRecordStatus>(payment.status);
  const [reason, setReason] = useState(payment.failureReason ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const needsReason = status === "failed" || status === "expired" || status === "cancelled";

  useEffect(() => {
    setStatus(payment.status);
    setReason(payment.failureReason ?? "");
    setError("");
  }, [payment]);

  async function save() {
    const issue = needsReason ? failureReasonError(reason) : "";
    if (issue) {
      setError(issue);
      return;
    }
    const trimmed = needsReason ? reason.trim() : "";
    if (status === payment.status) {
      setError("This payment already has that status.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSave({
        status,
        ...(trimmed ? { failureReason: trimmed } : {}),
      });
    } catch (caught) {
      setError(errorText(caught, "The payment status could not be updated."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="mt-6 max-w-xl rounded-[1.5rem] border border-ink/10 bg-paper p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <h3 className="page-title">Update status</h3>
      <p className="mt-2 text-sm leading-6 text-ink/60">
        Marking a payment paid also marks the order paid and sets the method to online.
      </p>
      <div className="mt-4">
        <FilterSelect
          label="Status"
          value={status}
          onChange={(value) => {
            if (!isPaymentRecordStatus(value)) return;
            setStatus(value);
            setError("");
          }}
          options={paymentStatusChoices()}
        />
      </div>
      {needsReason ? (
        <label className="mt-4 block text-sm text-ink/70">
          Failure reason
          <textarea
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError("");
            }}
            rows={3}
            maxLength={300}
            placeholder="Optional, 2–300 characters"
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3 text-sm outline-none focus:border-wine"
          />
          <span className="mt-2 block text-xs text-ink/45">{reason.trim().length}/300</span>
        </label>
      ) : null}
      {error ? <p className="mt-3 text-sm text-wine">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="mt-4 inline-flex h-12 items-center rounded-full bg-wine px-5 text-sm text-white hover:bg-wine-deep disabled:opacity-40"
      >
        {busy ? "Saving…" : "Save status"}
      </button>
    </form>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-[0.14em] text-ink/45">{label}</dt>
      <dd className="mt-1 break-all text-sm text-ink">{children || "—"}</dd>
    </div>
  );
}
