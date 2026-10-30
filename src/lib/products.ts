import { api } from "@/lib/api";
import { listBrands } from "@/lib/brands";
import { listCategories } from "@/lib/categories";
import type { CatalogProduct, Pagination, ProductInput, ProductQuery, ProductUpdate } from "@/types/product";

type ProductListResponse = {
  success: true;
  products: CatalogProduct[];
  pagination: Pagination;
};

type ProductResponse = {
  success: true;
  message?: string;
  product: CatalogProduct;
};

type MessageResponse = {
  success: true;
  message: string;
};

function queryString(query: ProductQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.brand) params.set("brand", query.brand);
  if (query.category) params.set("category", query.category);
  if (query.status) params.set("status", query.status);
  if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  if (query.inStock !== undefined) params.set("inStock", String(query.inStock));
  if (query.sort) params.set("sort", query.sort);
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function formatPrice(value: number) {
  return `AED ${value.toFixed(2)}`;
}

export async function listProducts(query: ProductQuery = {}) {
  return api<ProductListResponse>(`/api/v1/products${queryString(query)}`);
}

export async function getProduct(id: string) {
  const result = await api<ProductResponse>(`/api/v1/products/${id}`);
  return result.product;
}

export async function createProduct(input: ProductInput) {
  return api<ProductResponse>("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProduct(id: string, input: ProductUpdate) {
  return api<ProductResponse>(`/api/v1/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function setProductStatus(id: string, isActive: boolean) {
  return api<ProductResponse>(`/api/v1/products/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export async function deleteProduct(id: string) {
  return api<MessageResponse>(`/api/v1/products/${id}`, { method: "DELETE" });
}

export async function listBrandOptions() {
  const result = await listBrands({ limit: 100, status: "active" });
  return result.brands;
}

export async function listCategoryOptions() {
  const result = await listCategories({ limit: 100, status: "active" });
  return result.categories;
}
