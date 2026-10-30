/** Add or remove a status here. Filters, badges, and order steps follow these lists. */

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const PAYMENT_RECORD_STATUSES = [
  "pending",
  "paid",
  "failed",
  "expired",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentRecordStatus = (typeof PAYMENT_RECORD_STATUSES)[number];

const CANCEL_STATUS_NAME: string = "cancelled";
const REVIEW_STATUS_NAME: string = "delivered";
const CUSTOMER_CANCEL_BEFORE: string = "processing";
const ADMIN_CANCEL_BEFORE: string = "shipped";

const orderTones: Record<string, string> = {
  pending: "bg-wheat text-ink",
  confirmed: "bg-ice text-ink",
  processing: "bg-sand text-ink",
  shipped: "bg-blush text-wine",
  delivered: "bg-mint text-leaf",
  cancelled: "bg-ink/10 text-ink/55",
};

const paymentTones: Record<string, string> = {
  pending: "bg-wheat text-ink",
  paid: "bg-mint text-leaf",
  failed: "bg-blush text-wine",
  expired: "bg-sand text-ink",
  cancelled: "bg-ink/10 text-ink/55",
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function isPaymentRecordStatus(value: string): value is PaymentRecordStatus {
  return (PAYMENT_RECORD_STATUSES as readonly string[]).includes(value);
}

export function statusLabel(value: string) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function orderStatusChoices() {
  return ORDER_STATUSES.map((status) => ({ value: status, label: statusLabel(status) }));
}

export function paymentStatusChoices() {
  return PAYMENT_RECORD_STATUSES.map((status) => ({ value: status, label: statusLabel(status) }));
}

export function orderStatusClass(status: string) {
  if (!isOrderStatus(status)) return "bg-blush text-wine";
  return orderTones[status] ?? "bg-sand text-ink";
}

export function paymentStatusClass(status: string) {
  if (!isPaymentRecordStatus(status)) return "bg-blush text-wine";
  return paymentTones[status] ?? "bg-sand text-ink";
}

function fulfillmentFlow() {
  return ORDER_STATUSES.filter((status) => status !== CANCEL_STATUS_NAME);
}

export function orderFlow() {
  return fulfillmentFlow();
}

function findNamed(name: string): OrderStatus | null {
  return ORDER_STATUSES.find((status) => status === name) ?? null;
}

function cutoffIndex(steps: readonly OrderStatus[], name: string) {
  const index = steps.findIndex((status) => status === name);
  if (index >= 0) return index;
  return Math.max(steps.length - 1, 0);
}

export function cancelOrderStatus() {
  return findNamed(CANCEL_STATUS_NAME);
}

export function isCancelStatus(status: string) {
  const cancel = cancelOrderStatus();
  return Boolean(cancel && cancel === status);
}

/** The first fulfillment status is the one a new order can still change. */
export function canEditOrder(status: string) {
  const first = fulfillmentFlow()[0];
  return Boolean(first && first === status);
}

export function canReviewOrder(status: string) {
  return status === REVIEW_STATUS_NAME && isOrderStatus(status);
}

export function customerCanCancel(status: string) {
  if (!cancelOrderStatus()) return false;
  const steps = fulfillmentFlow();
  const index = steps.findIndex((item) => item === status);
  if (index < 0) return false;
  const processingAt = steps.findIndex((item) => item === CUSTOMER_CANCEL_BEFORE);
  const cutoff = processingAt >= 0 ? processingAt : cutoffIndex(steps, ADMIN_CANCEL_BEFORE);
  return index < cutoff;
}

/** One step forward through ORDER_STATUSES, plus cancel before the shipped step. */
export function adminNextStatuses(status: string): OrderStatus[] {
  const steps = fulfillmentFlow();
  const index = steps.findIndex((item) => item === status);
  if (index < 0) return [];
  const next: OrderStatus[] = [];
  const forward = steps[index + 1];
  if (forward) next.push(forward);
  const cancel = cancelOrderStatus();
  if (cancel && cancel !== forward && index < cutoffIndex(steps, ADMIN_CANCEL_BEFORE)) next.push(cancel);
  return next;
}

export function statusActionLabel(status: string) {
  if (isCancelStatus(status)) return "Cancel order";
  return `Mark ${statusLabel(status).toLowerCase()}`;
}
