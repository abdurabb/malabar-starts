import { api } from "@/lib/api";
import { formatPrice } from "@/lib/products";
import type { CartCoupon, CartQuery, CartRecord } from "@/types/cart";
import type { Pagination } from "@/types/product";

type CartListResponse = {
  success: true;
  cart: CartRecord;
  pagination: Pagination;
};

type UserCartResponse = CartListResponse & {
  user: { id: string; name: string; email: string };
};

type CartMutationResponse = {
  success: true;
  message: string;
  cart: CartRecord;
};

function queryString(query: CartQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function formatCouponValue(coupon: Pick<CartCoupon, "couponType" | "value">) {
  const type = coupon.couponType.toLowerCase();
  if (type === "percent" || type === "percentage") return `${coupon.value}%`;
  return formatPrice(coupon.value);
}

export async function getCart(query: CartQuery = {}) {
  return api<CartListResponse>(`/api/v1/carts${queryString(query)}`);
}

export async function getUserCart(userId: string, query: CartQuery = {}) {
  return api<UserCartResponse>(`/api/v1/carts/user/${encodeURIComponent(userId)}${queryString(query)}`);
}

export async function addCartItem(productId: string) {
  return api<CartMutationResponse>("/api/v1/carts/items", {
    method: "POST",
    body: JSON.stringify({ product: productId }),
  });
}

export async function updateCartItem(itemId: string, value: "inc" | "dec") {
  return api<CartMutationResponse>(`/api/v1/carts/items/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    body: JSON.stringify({ value }),
  });
}

export async function removeCartItem(itemId: string) {
  return api<CartMutationResponse>(`/api/v1/carts/items/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
  });
}

export async function clearCart() {
  return api<CartMutationResponse>("/api/v1/carts", { method: "DELETE" });
}

export async function applyCartCoupon(code: string) {
  return api<CartMutationResponse>("/api/v1/carts/coupon", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function removeCartCoupon() {
  return api<CartMutationResponse>("/api/v1/carts/coupon", { method: "DELETE" });
}
