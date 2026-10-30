export type ReviewUser = {
  id: string;
  name: string | null;
};

export type ReviewOrder = {
  id: string;
  orderNumber: string | null;
};

export type ReviewProduct = {
  id: string;
  name: string | null;
  slug: string | null;
  image: string | null;
};

export type ReviewRecord = {
  id: string;
  user: ReviewUser;
  order: ReviewOrder;
  product: ReviewProduct;
  rating: number;
  comment: string | null;
  isPublish: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReviewQuery = {
  page?: number;
  limit?: number;
  search?: string;
  product?: string;
  user?: string;
  isPublish?: boolean;
};

export type ReviewCreateInput = {
  order: string;
  product: string;
  rating: number;
  comment?: string;
};

export type ReviewUpdateInput = {
  rating?: number;
  comment?: string | null;
};
