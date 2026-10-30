import { api } from "@/lib/api";
import type { ManagedUser, Pagination, UserCreate, UserQuery, UserUpdate } from "@/types/user";

type UserListResponse = {
  success: true;
  users: ManagedUser[];
  pagination: Pagination;
};

type UserResponse = {
  success: true;
  message?: string;
  user: ManagedUser;
};

type MessageResponse = {
  success: true;
  message: string;
};

function queryString(query: UserQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  return `?${params.toString()}`;
}

export async function listUsers(query: UserQuery) {
  return api<UserListResponse>(`/api/v1/users${queryString(query)}`);
}

export async function getUser(id: string) {
  const result = await api<UserResponse>(`/api/v1/users/${id}`);
  return result.user;
}

export async function createUser(input: UserCreate) {
  return api<UserResponse>("/api/v1/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateUser(id: string, input: UserUpdate) {
  return api<UserResponse>(`/api/v1/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function setUserBlocked(id: string, isBlocked: boolean) {
  return api<UserResponse>(`/api/v1/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isBlocked }),
  });
}

export async function deleteUser(id: string) {
  return api<MessageResponse>(`/api/v1/users/${id}`, { method: "DELETE" });
}
