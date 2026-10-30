import { api } from "@/lib/api";
import { formatPrice } from "@/lib/products";
import type { Coupon, CouponCreate, CouponQuery, CouponUpdate, Pagination } from "@/types/coupon";

type CouponListResponse = {
  success: true;
  coupons: Coupon[];
  pagination: Pagination;
};

type CouponResponse = {
  success: true;
  message?: string;
  coupon: Coupon;
};

type MessageResponse = {
  success: true;
  message: string;
};

function queryString(query: CouponQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.couponType) params.set("couponType", query.couponType);
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function formatCouponOffer(coupon: Pick<Coupon, "couponType" | "value">) {
  if (coupon.couponType === "percentage") return `${coupon.value}% off`;
  return `${formatPrice(coupon.value)} off`;
}

export function formatCouponWhen(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export async function listCoupons(query: CouponQuery = {}) {
  return api<CouponListResponse>(`/api/v1/coupons${queryString(query)}`);
}

export async function getCoupon(id: string) {
  const result = await api<CouponResponse>(`/api/v1/coupons/${id}`);
  return result.coupon;
}

export async function createCoupon(input: CouponCreate) {
  return api<CouponResponse>("/api/v1/coupons", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCoupon(id: string, input: CouponUpdate) {
  return api<CouponResponse>(`/api/v1/coupons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function setCouponStatus(id: string, isActive: boolean) {
  return api<CouponResponse>(`/api/v1/coupons/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export async function deleteCoupon(id: string) {
  return api<MessageResponse>(`/api/v1/coupons/${id}`, { method: "DELETE" });
}
