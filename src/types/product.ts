export type CatalogRef = {
  id: string;
  name: string;
  slug: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number | null;
  stock: number;
  images: string[];
  brand: CatalogRef | null;
  category: CatalogRef | null;
  sku: string | null;
  unit: string | null;
  isActive: boolean;
  rating: number;
  createdAt: string;
  updatedAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProductSort = "newest" | "price_asc" | "price_desc" | "name";
export type ProductStatus = "active" | "inactive" | "all";

export type ProductQuery = {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  category?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: ProductSort;
};

export type ProductInput = {
  name: string;
  description?: string | null;
  price: number;
  mrp?: number | null;
  stock: number;
  images?: string[];
  brand: string;
  category: string;
  sku?: string | null;
  unit?: string | null;
  isActive?: boolean;
};

export type ProductUpdate = Partial<Omit<ProductInput, "isActive">>;

export type BrandOption = {
  id: string;
  name: string;
  slug: string;
};

export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};
