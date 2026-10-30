import type { Role } from "@/types/auth";
import type { Pagination } from "@/types/product";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  isEmailVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserListStatus = "all" | "active" | "blocked";

export type UserQuery = {
  page: number;
  limit: number;
  search?: string;
  status?: "active" | "blocked";
};

export type UserCreate = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role?: Role;
};

export type UserUpdate = {
  name?: string;
  email?: string;
  mobile?: string;
  password?: string;
  role?: Role;
};

export type { Pagination };
