// import { ApiError } from "@/lib/apiError";
// import { clearToken, readToken, TOKEN_KEY } from "@/lib/authSession";
// import type { ApiErrorBody } from "@/types/apiError";

// // const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/backend";
// // const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/backend";

// const API_BASE = "/api/backend";
// const base = await getApiBase();

// const sessionEndingCodes = new Set([
//   "TOKEN_NOT_FOUND",
//   "INVALID_TOKEN",
//   "TOKEN_EXPIRED",
//   "USER_NOT_FOUND",
//   "ACCOUNT_BLOCKED",
// ]);

// async function resolveToken() {
//   if (typeof window !== "undefined") return readToken();
//   try {
//     const { cookies } = await import("next/headers");
//     const value = (await cookies()).get(TOKEN_KEY)?.value;
//     return value ? decodeURIComponent(value) : null;
//   } catch {
//     return null;
//   }
// }

// export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
//   const headers = new Headers(init.headers);
//   if (init.body && !headers.has("Content-Type")) {
//     headers.set("Content-Type", "application/json");
//   }

//   const token = await resolveToken();
//   if (token && !headers.has("Authorization")) {
//     headers.set("Authorization", `Bearer ${token}`);
//   }

//   let response: Response;
//   try {
//     response = await fetch(`${base}${path}`, {
//       ...init,
//       headers,
//       cache: "no-store",
//     });
//   } catch {
//     throw new ApiError("The counter could not be reached.", 0);
//   }

//   if (!response.ok) {
//     let message = "Request failed.";
//     let code: string | undefined;
//     let errors = undefined as ApiErrorBody["errors"];
//     try {
//       const data = (await response.json()) as ApiErrorBody;
//       if (data.message) message = data.message;
//       if (data.code) code = data.code;
//       if (Array.isArray(data.errors)) errors = data.errors;
//     } catch {
//       message = response.statusText || message;
//     }
//     if (code && sessionEndingCodes.has(code)) clearToken();
//     throw new ApiError(message, response.status, code, errors);
//   }

//   if (response.status === 204) return undefined as T;
//   return (await response.json()) as T;
// }




// async function getApiBase() {
//   if (typeof window !== "undefined") {
//     return API_BASE;
//   }

//   try {
//     const { headers } = await import("next/headers");
//     const requestHeaders = await headers();

//     const host =
//       requestHeaders.get("x-forwarded-host") ??
//       requestHeaders.get("host");

//     const protocol =
//       requestHeaders.get("x-forwarded-proto") ?? "https";

//     if (host) {
//       return `${protocol}://${host}${API_BASE}`;
//     }
//   } catch {
//     // Outside request scope, such as during static generation.
//   }

//   return process.env.NEXT_PUBLIC_SITE_URL
//     ? `${process.env.NEXT_PUBLIC_SITE_URL}${API_BASE}`
//     : API_BASE;
// }




import { ApiError } from "@/lib/apiError";
import { clearToken, readToken, TOKEN_KEY } from "@/lib/authSession";
import type { ApiErrorBody } from "@/types/apiError";

const API_BASE = "/api/backend";

const sessionEndingCodes = new Set([
  "TOKEN_NOT_FOUND",
  "INVALID_TOKEN",
  "TOKEN_EXPIRED",
  "USER_NOT_FOUND",
  "ACCOUNT_BLOCKED",
]);

async function getApiBase() {
  // Browser requests use the relative Vercel proxy URL.
  if (typeof window !== "undefined") {
    return API_BASE;
  }

  // Server-side requests need an absolute URL.
  try {
    const { headers } = await import("next/headers");
    const requestHeaders = await headers();

    const host =
      requestHeaders.get("x-forwarded-host") ??
      requestHeaders.get("host");

    const protocol =
      requestHeaders.get("x-forwarded-proto") ?? "https";

    if (host) {
      return `${protocol}://${host}${API_BASE}`;
    }
  } catch {
    // Build-time or outside request context.
  }

  // Fallback for server-side requests.
  return `${process.env.NEXT_PUBLIC_SITE_URL}${API_BASE}`;
}

async function resolveToken() {
  if (typeof window !== "undefined") {
    return readToken();
  }

  try {
    const { cookies } = await import("next/headers");
    const value = (await cookies()).get(TOKEN_KEY)?.value;
    return value ? decodeURIComponent(value) : null;
  } catch {
    return null;
  }
}

export async function api<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
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
    const base = await getApiBase();

    response = await fetch(`${base}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error("API connection error:", error);
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

    if (code && sessionEndingCodes.has(code)) {
      clearToken();
    }

    throw new ApiError(message, response.status, code, errors);
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}
