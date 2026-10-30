import { api } from "@/lib/api";
import type { Brand, BrandQuery, BrandWrite, Pagination } from "@/types/brand";

type BrandListResponse = {
  success: true;
  brands: Brand[];
  pagination: Pagination;
};

type BrandResponse = {
  success: true;
  message?: string;
  brand: Brand;
};

type MessageResponse = {
  success: true;
  message: string;
};

function queryString(query: BrandQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  const text = params.toString();
  return text ? `?${text}` : "";
}

export async function listBrands(query: BrandQuery = {}) {
  return api<BrandListResponse>(`/api/v1/brands${queryString(query)}`);
}

export async function getBrand(id: string) {
  const result = await api<BrandResponse>(`/api/v1/brands/${id}`);
  return result.brand;
}

export async function createBrand(input: BrandWrite & { name: string }) {
  return api<BrandResponse>("/api/v1/brands", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateBrand(id: string, input: BrandWrite) {
  return api<BrandResponse>(`/api/v1/brands/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteBrand(id: string) {
  return api<MessageResponse>(`/api/v1/brands/${id}`, { method: "DELETE" });
}
