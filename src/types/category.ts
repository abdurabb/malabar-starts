import type { Pagination } from "@/types/product";

export type CategoryParent = {
  id: string;
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parent: CategoryParent | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryStatus = "active" | "inactive" | "all";

export type CategoryQuery = {
  page?: number;
  limit?: number;
  search?: string;
  parent?: string;
  status?: CategoryStatus;
};

export type CategoryWrite = {
  name?: string;
  description?: string | null;
  image?: string | null;
  parent?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

export type { Pagination };
