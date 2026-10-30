import { addressError, toAddressDraft } from "@/lib/addresses";
import { api } from "@/lib/api";
import { canReviewOrder, statusLabel } from "@/types/status";
import type { Address } from "@/types/address";
import type { AddressFormState } from "@/types/address";
import type {
  DeliveryMode,
  OrderPayment,
  OrderQuery,
  OrderRecord,
  OrderUpdateInput,
  PlaceOrderInput,
} from "@/types/order";
import type { OrderStatus } from "@/types/status";
import type { Pagination } from "@/types/product";

type OrderListResponse = {
  success: true;
  orders: OrderRecord[];
  pagination: Pagination;
};

type OrderResponse = {
  success: true;
  order: OrderRecord;
};

type PlaceOrderResponse = {
  success: true;
  message: string;
  order: OrderRecord;
  payment: OrderPayment;
  address?: Address;
};

type OrderUpdateResponse = {
  success: true;
  message: string;
  order: OrderRecord;
  address?: Address;
};

type OrderStatusResponse = {
  success: true;
  message: string;
  order: OrderRecord;
};

export function noteError(note: string) {
  const value = note.trim();
  if (!value) return "";
  if (value.length < 2 || value.length > 500) return "Note must be 2–500 characters.";
  return "";
}

export function cancelReasonError(reason: string) {
  const value = reason.trim();
  if (value.length < 2 || value.length > 300) return "Cancel reason must be 2–300 characters.";
  return "";
}

export function deliveryInput(input: {
  mode: DeliveryMode;
  addressId: string;
  draft: AddressFormState;
  saveAddress: boolean;
  makeDefault: boolean;
}): { error: string } | { body: Omit<OrderUpdateInput, "note"> } {
  if (input.mode === "saved") {
    if (!input.addressId) return { error: "Choose a saved address." };
    return { body: { addressId: input.addressId } };
  }
  const error = addressError(input.draft);
  if (error) return { error };
  return {
    body: {
      address: toAddressDraft(input.draft),
      ...(input.saveAddress ? { saveAddress: true } : {}),
      ...(input.saveAddress && input.makeDefault ? { makeDefault: true } : {}),
    },
  };
}

export function isPaymentRedirect(value: unknown): value is string {
  if (typeof value !== "string" || !value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function formatOrderWhen(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function paymentMethodLabel(value: string | null) {
  if (value === "cod") return "Cash on delivery";
  if (value === "online") return "Online";
  if (!value) return "Not chosen yet";
  return statusLabel(value);
}

export function addressSourceLabel(source: string) {
  if (source === "permanent") return "Saved address";
  if (source === "temporary") return "One-time address";
  return statusLabel(source);
}

function queryString(query: OrderQuery) {
  const params = new URLSearchParams();
  const entries: [string, string | number | undefined][] = [
    ["page", query.page],
    ["limit", query.limit],
    ["search", query.search?.trim().slice(0, 100) || undefined],
    ["status", query.status],
    ["product", query.product?.trim() || undefined],
    ["userId", query.userId?.trim() || undefined],
    ["city", query.city?.trim() || undefined],
    ["state", query.state?.trim() || undefined],
    ["country", query.country?.trim() || undefined],
    ["postalCode", query.postalCode?.trim() || undefined],
    ["from", query.from],
    ["to", query.to],
    ["minTotal", query.minTotal],
    ["maxTotal", query.maxTotal],
    ["sort", query.sort],
  ];
  for (const [key, value] of entries) {
    if (value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

export async function listOrders(query: OrderQuery = {}) {
  return api<OrderListResponse>(`/api/v1/orders${queryString(query)}`);
}

export function orderNeedsItemReview(order: Pick<OrderRecord, "status" | "items">) {
  if (!canReviewOrder(order.status)) return false;
  if (order.items.length === 0) return true;
  return order.items.some((item) => item.review == null);
}

export async function getOrder(id: string) {
  const result = await api<OrderResponse>(`/api/v1/orders/${id}`);
  return result.order;
}

export async function placeOrder(input: PlaceOrderInput) {
  return api<PlaceOrderResponse>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateOrder(id: string, input: OrderUpdateInput) {
  return api<OrderUpdateResponse>(`/api/v1/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function updateOrderStatus(id: string, input: { status: OrderStatus; cancelReason?: string }) {
  return api<OrderStatusResponse>(`/api/v1/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
