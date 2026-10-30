import { api } from "@/lib/api";
import { isPaymentRedirect } from "@/lib/orders";
import type { PaymentQuery, PaymentRecord } from "@/types/payment";
import type { Pagination } from "@/types/product";
import type { PaymentRecordStatus } from "@/types/status";

type PaymentListResponse = {
  success: true;
  payments: PaymentRecord[];
  pagination: Pagination;
};

type PaymentResponse = {
  success: true;
  payment: PaymentRecord;
};

type PaymentMessageResponse = {
  success: true;
  message: string;
  payment: PaymentRecord;
};

export function formatPaymentAmount(amount: number, currency: string) {
  const value = Number.isFinite(amount) ? amount : 0;
  const code = (currency || "aed").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return `${code} ${value.toFixed(2)}`;
  try {
    return new Intl.NumberFormat("en-AE", { style: "currency", currency: code }).format(value);
  } catch {
    return `${code} ${value.toFixed(2)}`;
  }
}

export function failureReasonError(reason: string) {
  const value = reason.trim();
  if (!value) return "";
  if (value.length < 2 || value.length > 300) return "Failure reason must be 2–300 characters.";
  return "";
}

export function canContinuePayment(payment: Pick<PaymentRecord, "status" | "paymentUrl">) {
  return payment.status === "pending" && isPaymentRedirect(payment.paymentUrl);
}

export function canRequestPaymentLink(status: string) {
  return status !== "paid";
}

export function objectIdError(value: string, label: string) {
  if (!value) return "";
  if (!/^[a-fA-F0-9]{24}$/.test(value)) return `Invalid ${label}.`;
  return "";
}

function queryString(query: PaymentQuery) {
  const params = new URLSearchParams();
  const entries: [string, string | number | undefined][] = [
    ["page", query.page],
    ["limit", query.limit],
    ["status", query.status],
    ["orderId", query.orderId?.trim() || undefined],
    ["userId", query.userId?.trim() || undefined],
  ];
  for (const [key, value] of entries) {
    if (value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

export async function listPayments(query: PaymentQuery = {}) {
  return api<PaymentListResponse>(`/api/v1/payments${queryString(query)}`);
}

export async function getPayment(id: string) {
  const result = await api<PaymentResponse>(`/api/v1/payments/${id}`);
  return result.payment;
}

export async function createPayment(orderId: string) {
  return api<PaymentMessageResponse>("/api/v1/payments", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}

export async function updatePaymentStatus(
  id: string,
  input: { status: PaymentRecordStatus; failureReason?: string },
) {
  return api<PaymentMessageResponse>(`/api/v1/payments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
