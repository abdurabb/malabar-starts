import { api } from "@/lib/api";
import type { Category, CategoryQuery, CategoryWrite, Pagination } from "@/types/category";

type CategoryListResponse = {
  success: true;
  categories: Category[];
  pagination: Pagination;
};

type CategoryResponse = {
  success: true;
  message?: string;
  category: Category;
};

type MessageResponse = {
  success: true;
  message: string;
};

function queryString(query: CategoryQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.parent) params.set("parent", query.parent);
  if (query.status) params.set("status", query.status);
  const text = params.toString();
  return text ? `?${text}` : "";
}

export async function listCategories(query: CategoryQuery = {}) {
  return api<CategoryListResponse>(`/api/v1/categories${queryString(query)}`);
}

export async function getCategory(id: string) {
  const result = await api<CategoryResponse>(`/api/v1/categories/${id}`);
  return result.category;
}

export async function createCategory(input: CategoryWrite & { name: string }) {
  return api<CategoryResponse>("/api/v1/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCategory(id: string, input: CategoryWrite) {
  return api<CategoryResponse>(`/api/v1/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteCategory(id: string) {
  return api<MessageResponse>(`/api/v1/categories/${id}`, { method: "DELETE" });
}
