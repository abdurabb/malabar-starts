import { api } from "@/lib/api";
import type { Pagination } from "@/types/product";
import type { ReviewCreateInput, ReviewQuery, ReviewRecord, ReviewUpdateInput } from "@/types/review";

type ReviewListResponse = {
  success: true;
  reviews: ReviewRecord[];
  pagination: Pagination;
};

type ReviewResponse = {
  success: true;
  message?: string;
  review: ReviewRecord;
};

type MessageResponse = {
  success: true;
  message: string;
};

const scanPageLimit = 100;
const scanPageCap = 20;

function queryString(query: ReviewQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const search = query.search?.trim().slice(0, 100);
  if (search) params.set("search", search);
  const product = query.product?.trim();
  if (product) params.set("product", product);
  const user = query.user?.trim();
  if (user) params.set("user", user);
  if (typeof query.isPublish === "boolean") params.set("isPublish", String(query.isPublish));
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function reviewFormError(rating: number, comment: string) {
  if (!Number.isInteger(rating)) return "Rating must be a whole number";
  if (rating < 1) return "Rating is required";
  if (rating > 5) return "Rating cannot exceed 5";
  const value = comment.trim();
  if (value.length === 1) return "Comment must be at least 2 characters";
  if (value.length > 1000) return "Comment cannot exceed 1000 characters";
  return "";
}

export function formatReviewWhen(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export async function listReviews(query: ReviewQuery = {}) {
  return api<ReviewListResponse>(`/api/v1/reviews${queryString(query)}`);
}

export async function getReview(id: string) {
  const result = await api<ReviewResponse>(`/api/v1/reviews/${id}`);
  return result.review;
}

export async function createReview(input: ReviewCreateInput) {
  const comment = input.comment?.trim();
  return api<ReviewResponse>("/api/v1/reviews", {
    method: "POST",
    body: JSON.stringify({
      order: input.order,
      product: input.product,
      rating: input.rating,
      ...(comment ? { comment } : {}),
    }),
  });
}

export async function updateReview(id: string, input: ReviewUpdateInput) {
  return api<ReviewResponse>(`/api/v1/reviews/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function setReviewPublish(id: string, isPublish: boolean) {
  return api<ReviewResponse>(`/api/v1/reviews/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isPublish }),
  });
}

export async function deleteReview(id: string) {
  return api<MessageResponse>(`/api/v1/reviews/${id}`, { method: "DELETE" });
}

async function scanForOrder(query: ReviewQuery, orderId: string) {
  let page = 1;
  while (page <= scanPageCap) {
    const result = await listReviews({ ...query, page, limit: scanPageLimit });
    const match = result.reviews.find((review) => review.order.id === orderId);
    if (match) return match;
    if (result.pagination.totalPages === 0 || page >= result.pagination.totalPages) return null;
    page += 1;
  }
  return null;
}

/** The list API has no order filter. Admins can scan a customer's reviews. Everyone else scans by product. */
export async function findOrderReview(orderId: string, productIds: string[], userId?: string) {
  if (userId) return scanForOrder({ user: userId }, orderId);
  const ids = [...new Set(productIds.map((id) => id.trim()).filter(Boolean))];
  for (const product of ids) {
    const match = await scanForOrder({ product }, orderId);
    if (match) return match;
  }
  return null;
}
