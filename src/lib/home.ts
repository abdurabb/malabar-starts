import { api } from "@/lib/api";
import type { Brand } from "@/types/brand";
import type { Category } from "@/types/category";
import type { OrderRecord } from "@/types/order";
import type { CatalogProduct } from "@/types/product";

export type HomeData = {
  success: true;
  categories: Category[];
  brands: Brand[];
  products: CatalogProduct[];
  orders: OrderRecord[];
};

export function getHome() {
  return api<HomeData>("/api/v1/home");
}
