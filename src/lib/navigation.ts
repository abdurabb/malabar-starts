import type { AuthSession } from "@/types/auth";

export const routes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  verifyOtp: "/verify-otp",
  forgotPassword: "/forgot-password",
  products: "/products",
  categories: "/categories",
  brands: "/brands",
  cart: "/cart",
  checkout: "/checkout",
  orders: "/orders",
  payments: "/payments",
  wishlist: "/wishlist",
  profile: "/profile",
  addresses: "/addresses",
  admin: "/admin",
} as const;

export function destinationFor(session: AuthSession, next?: string | null) {
  if (session.user.role === "admin") return routes.admin;
  if (next && isSafeNext(next)) return next;
  return routes.home;
}

function isSafeNext(next: string) {
  if (!next.startsWith("/") || next.startsWith("//")) return false;
  if (next.startsWith("/login") || next.startsWith("/signup") || next.startsWith("/forgot-password")) return false;
  if (next.startsWith("/admin") || next.startsWith("/verify-otp")) return false;
  if (next.startsWith("/complete-profile")) return false;
  return true;
}
