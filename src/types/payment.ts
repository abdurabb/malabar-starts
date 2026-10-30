import type { Pagination } from "@/types/product";
import type { PaymentRecordStatus } from "@/types/status";

export type PaymentRecord = {
  id: string;
  orderId: string;
  orderNumber: string | null;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  paymentUrl: string | null;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  paidAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentQuery = {
  page?: number;
  limit?: number;
  status?: PaymentRecordStatus;
  orderId?: string;
  userId?: string;
};

export type { Pagination };
