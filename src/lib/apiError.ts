import type { ApiFieldError } from "@/types/apiError";

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: ApiFieldError[];

  constructor(message: string, status = 400, code?: string, errors?: ApiFieldError[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export function errorText(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) return fallback;
  if (error.errors?.length) return error.errors.map((item) => item.message).join(" ");
  return error.message || fallback;
}

export function isUnverifiedEmail(error: unknown) {
  return error instanceof ApiError && error.status === 403 && error.message === "Email is not verified";
}
