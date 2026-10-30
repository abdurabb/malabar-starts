import type { CatalogRef } from "@/types/product";

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number | null;
  stock: number;
  images: string[];
  unit: string | null;
  isActive: boolean;
  brand: CatalogRef | null;
  category: CatalogRef | null;
};

export type CartItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  discount: number;
  payableTotal: number;
  product: CartProduct;
};

export type CartCoupon = {
  id: string;
  code: string;
  couponType: string;
  value: number;
};

export type CartRecord = {
  id: string | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  coupon: CartCoupon | null;
};

export type CartQuery = {
  page?: number;
  limit?: number;
};
