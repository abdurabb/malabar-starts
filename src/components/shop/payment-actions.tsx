"use client";

import { useState } from "react";
import { errorText } from "@/lib/apiError";
import { isPaymentRedirect } from "@/lib/orders";
import { canContinuePayment, canRequestPaymentLink, createPayment } from "@/lib/payments";
import { toast } from "@/lib/toast";
import type { PaymentRecord } from "@/types/payment";

export function NewPaymentLinkButton({
  orderId,
  label = "New payment link",
  tone = "primary",
  size = "sm",
}: {
  orderId: string;
  label?: string;
  tone?: "primary" | "ghost";
  size?: "sm" | "md";
}) {
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (pending) return;
    setPending(true);
    try {
      const result = await createPayment(orderId);
      if (isPaymentRedirect(result.payment.paymentUrl)) {
        window.location.assign(result.payment.paymentUrl);
        return;
      }
      toast(result.message || "Payment link created, but no checkout URL was returned.");
      setPending(false);
    } catch (caught) {
      toast(errorText(caught, "A payment link could not be created."));
      setPending(false);
    }
  }

  const height = size === "md" ? "h-12 px-5" : "h-10 px-4";
  const look =
    tone === "primary"
      ? "bg-wine text-white hover:bg-wine-deep"
      : "border border-ink/15 bg-paper text-ink hover:border-wine hover:text-wine";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`inline-flex cursor-pointer ${height} items-center justify-center rounded-full text-sm disabled:cursor-not-allowed disabled:opacity-40 ${look}`}
    >
      {pending ? "Opening checkout…" : label}
    </button>
  );
}

export function PaymentActions({
  payment,
  allowNewLink = false,
  size = "sm",
}: {
  payment: Pick<PaymentRecord, "status" | "paymentUrl" | "orderId">;
  allowNewLink?: boolean;
  size?: "sm" | "md";
}) {
  const continueUrl = canContinuePayment(payment) ? payment.paymentUrl : null;
  const showNew = allowNewLink && canRequestPaymentLink(payment.status);
  if (!continueUrl && !showNew) return null;

  const height = size === "md" ? "h-12 px-5" : "h-10 px-4";

  return (
    <>
      {continueUrl ? (
        <a
          href={continueUrl}
          className={`inline-flex ${height} items-center justify-center rounded-full bg-wine text-sm text-white hover:bg-wine-deep`}
        >
          Continue payment
        </a>
      ) : null}
      {showNew ? (
        <NewPaymentLinkButton
          orderId={payment.orderId}
          tone={continueUrl ? "ghost" : "primary"}
          size={size}
          label={continueUrl ? "New payment link" : "Pay now"}
        />
      ) : null}
    </>
  );
}
