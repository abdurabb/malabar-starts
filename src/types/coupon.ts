import type { Pagination } from "@/types/product";

export type CouponType = "price" | "percentage";

export type CouponStatus = "active" | "inactive" | "all";

export type Coupon = {
  id: string;
  code: string;
  couponType: CouponType;
  value: number;
  description: string | null;
  isActive: boolean;
  usageLimitPerUser: number;
  usedBy: string[];
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CouponQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: CouponStatus;
  couponType?: CouponType;
};

export type CouponCreate = {
  couponType: CouponType;
  value: number;
  code?: string;
  description?: string;
  usageLimitPerUser?: number;
  isActive?: boolean;
  startsAt?: string;
  expiresAt?: string;
};

export type CouponUpdate = {
  code?: string;
  couponType?: CouponType;
  value?: number;
  description?: string | null;
  usageLimitPerUser?: number;
  startsAt?: string | null;
  expiresAt?: string | null;
};

export type { Pagination };
