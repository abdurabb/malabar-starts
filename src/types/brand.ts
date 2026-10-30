import type { Pagination } from "@/types/product";

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type BrandStatus = "active" | "inactive" | "all";

export type BrandQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: BrandStatus;
};

export type BrandWrite = {
  name?: string;
  description?: string | null;
  logo?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

export type { Pagination };
