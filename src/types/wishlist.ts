import type { CatalogRef, Pagination } from "@/types/product";

export type WishlistProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number | null;
  stock: number;
  images: string[];
  unit: string | null;
  isActive: boolean;
  rating?: number;
  brand: CatalogRef | null;
  category: CatalogRef | null;
};

export type WishlistItem = {
  id: string;
  product: WishlistProduct;
  createdAt: string;
};

export type WishlistEntry = {
  id: string;
  productId: string;
};

export type WishlistQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

export type WishlistOwner = {
  id: string;
  name: string;
  email: string;
};

export type { Pagination };
