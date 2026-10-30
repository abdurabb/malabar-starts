import { api } from "@/lib/api";
import type { CatalogProduct, Pagination } from "@/types/product";
import type { WishlistEntry, WishlistItem, WishlistOwner, WishlistProduct, WishlistQuery } from "@/types/wishlist";

type WishlistListResponse = {
  success: true;
  items: WishlistItem[];
  pagination: Pagination;
};

type UserWishlistResponse = WishlistListResponse & {
  user: WishlistOwner;
};

type WishlistItemResponse = {
  success: true;
  message: string;
  item: WishlistItem;
};

type MessageResponse = {
  success: true;
  message: string;
};

function queryString(query: WishlistQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const search = query.search?.trim().slice(0, 100);
  if (search) params.set("search", search);
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function toCatalogProduct(product: WishlistProduct): CatalogProduct {
  return {
    ...product,
    description: null,
    sku: null,
    rating: product.rating ?? 0,
    createdAt: "",
    updatedAt: "",
  };
}

export function toWishlistEntry(item: WishlistItem): WishlistEntry {
  return { id: item.id, productId: item.product.id };
}

export async function listWishlist(query: WishlistQuery = {}) {
  return api<WishlistListResponse>(`/api/v1/wishlists${queryString(query)}`);
}

export async function listUserWishlist(userId: string, query: WishlistQuery = {}) {
  return api<UserWishlistResponse>(`/api/v1/wishlists/user/${encodeURIComponent(userId)}${queryString(query)}`);
}

export async function addWishlistItem(productId: string) {
  return api<WishlistItemResponse>("/api/v1/wishlists", {
    method: "POST",
    body: JSON.stringify({ product: productId }),
  });
}

export async function removeWishlistItem(id: string) {
  return api<MessageResponse>(`/api/v1/wishlists/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function listWishlistEntries() {
  const limit = 100;
  const first = await listWishlist({ page: 1, limit });
  const items = [...first.items];
  if (first.pagination.totalPages > 1) {
    const pages = await Promise.all(
      Array.from({ length: first.pagination.totalPages - 1 }, (_, index) => listWishlist({ page: index + 2, limit })),
    );
    for (const page of pages) items.push(...page.items);
  }
  return items.map(toWishlistEntry);
}
