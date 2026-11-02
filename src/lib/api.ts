import { ApiError } from "@/lib/apiError";
import { clearToken, readToken, TOKEN_KEY } from "@/lib/authSession";
import type { ApiErrorBody } from "@/types/apiError";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/backend";

const sessionEndingCodes = new Set([
  "TOKEN_NOT_FOUND",
  "INVALID_TOKEN",
  "TOKEN_EXPIRED",
  "USER_NOT_FOUND",
  "ACCOUNT_BLOCKED",
]);

async function resolveToken() {
  if (typeof window !== "undefined") return readToken();
  try {
    const { cookies } = await import("next/headers");
    const value = (await cookies()).get(TOKEN_KEY)?.value;
    return value ? decodeURIComponent(value) : null;
  } catch {
    return null;
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = await resolveToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("The counter could not be reached.", 0);
  }

  if (!response.ok) {
    let message = "Request failed.";
    let code: string | undefined;
    let errors = undefined as ApiErrorBody["errors"];
    try {
      const data = (await response.json()) as ApiErrorBody;
      if (data.message) message = data.message;
      if (data.code) code = data.code;
      if (Array.isArray(data.errors)) errors = data.errors;
    } catch {
      message = response.statusText || message;
    }
    if (code && sessionEndingCodes.has(code)) clearToken();
    throw new ApiError(message, response.status, code, errors);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
