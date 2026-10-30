"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChoiceGroup, FilterLabel, controlClass } from "@/components/shop/filter-controls";
import { ProductMedia } from "@/components/shop/product-card";
import { StarRating } from "@/components/shop/star-rating";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { errorText } from "@/lib/apiError";
import { deleteReview, formatReviewWhen, listReviews, setReviewPublish } from "@/lib/reviews";
import { toast } from "@/lib/toast";
import type { Pagination } from "@/types/product";
import type { ReviewRecord } from "@/types/review";

const limit = 12;

type Visibility = "all" | "published" | "hidden";

export function ReviewsAdmin({
  userId,
  productId,
  embedded = false,
}: {
  userId?: string;
  productId?: string;
  embedded?: boolean;
}) {
  const { confirm, dialog } = useConfirm();
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const next = search.trim();
    if (next === appliedSearch) return;
    const handle = window.setTimeout(() => {
      setPage(1);
      setAppliedSearch(next);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [search, appliedSearch]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listReviews({
      page,
      limit,
      search: appliedSearch || undefined,
      user: userId,
      product: productId,
      isPublish: visibility === "all" ? undefined : visibility === "published",
    })
      .then((result) => {
        if (!active) return;
        setReviews(result.reviews);
        setPagination(result.pagination);
        setError("");
        if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
          setPage(result.pagination.totalPages);
        }
      })
      .catch((caught) => {
        if (!active) return;
        setReviews([]);
        setPagination(null);
        setError(errorText(caught, "Reviews could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, appliedSearch, visibility, userId, productId, version]);

  async function onPublish(review: ReviewRecord) {
    const next = !review.isPublish;
    const ok = await confirm({
      title: next ? "Publish this review?" : "Hide this review?",
      message: next
        ? "Customers will see it on the product page."
        : "Customers will no longer see it on the product page.",
      confirmLabel: next ? "Publish" : "Hide",
      tone: next ? "default" : "danger",
    });
    if (!ok) return;
    try {
      const result = await setReviewPublish(review.id, next);
      toast(result.message ?? (result.review.isPublish ? "Review published" : "Review unpublished"));
      if (visibility === "all") {
        setReviews((current) => current.map((item) => (item.id === review.id ? result.review : item)));
      } else if (reviews.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setVersion((current) => current + 1);
      }
    } catch (caught) {
      toast(errorText(caught, "The review could not be updated."));
    }
  }

  async function onDelete(review: ReviewRecord) {
    const label = review.product.name ?? "This review";
    const ok = await confirm({
      title: "Delete this review?",
      message: `${label} will lose this review. The customer can write another one for that order.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const result = await deleteReview(review.id);
      toast(result.message);
      if (reviews.length === 1 && page > 1) setPage(page - 1);
      setVersion((current) => current + 1);
    } catch (caught) {
      toast(errorText(caught, "The review could not be deleted."));
    }
  }

  const totalPages = pagination?.totalPages ?? 0;

  return (
    <div className={embedded ? "mt-5 border-t border-ink/10 pt-4" : ""}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {embedded ? <h4 className="font-display text-2xl tracking-tight">Reviews</h4> : null}
        {pagination ? <p className="text-sm text-ink/55">{pagination.total} reviews</p> : null}
      </div>
      <div className="mt-4 grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <label className="block">
          <FilterLabel>Search</FilterLabel>
          <span className="relative block">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-wine"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16.5 20 20.5" />
            </svg>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search review comments"
              maxLength={100}
              aria-label="Search reviews"
              className={`${controlClass} pl-11`}
            />
          </span>
        </label>
        <ChoiceGroup
          label="Visibility"
          value={visibility}
          onChange={(value) => {
            setVisibility(value);
            setPage(1);
          }}
          options={[
            { value: "all", label: "All" },
            { value: "published", label: "Published" },
            { value: "hidden", label: "Hidden" },
          ]}
        />
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {loading ? <p className="mt-4 text-sm text-ink/60">Loading reviews…</p> : null}
      {!loading && !error && reviews.length === 0 ? (
        <p className="mt-4 text-sm text-ink/60">
          {appliedSearch || visibility !== "all" ? "No reviews match this view." : "No reviews yet."}
        </p>
      ) : null}
      {reviews.length > 0 ? (
        <ul className="mt-4 grid gap-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-2xl border border-ink/10 bg-paper p-4">
              <div className="flex gap-3">
                <ProductMedia src={review.product.image} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/admin/products/${review.product.id}`} className="block font-display text-2xl tracking-tight hover:text-wine">
                        {review.product.name ?? "Product"}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-ink/55">{review.rating} / 5</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
                            review.isPublish ? "bg-mint text-leaf" : "bg-blush text-wine"
                          }`}
                        >
                          {review.isPublish ? "Published" : "Hidden"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPublish(review)}
                        className="cursor-pointer rounded-full border border-ink/15 px-2.5 py-1 text-xs hover:border-wine hover:text-wine"
                      >
                        {review.isPublish ? "Hide" : "Publish"}
                      </button>
                      <button type="button" onClick={() => onDelete(review)} className="cursor-pointer rounded-full px-2.5 py-1 text-xs text-wine">
                        Delete
                      </button>
                    </div>
                  </div>
                  {review.comment ? <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-ink/75">{review.comment}</p> : null}
                  <p className="mt-3 text-xs text-ink/50">
                    {userId ? (
                      review.user.name ?? "Customer"
                    ) : (
                      <Link href={`/admin/customers/${review.user.id}`} className="hover:text-wine">
                        {review.user.name ?? "Customer"}
                      </Link>
                    )}
                    {" · "}
                    <Link href={`/admin/orders/${review.order.id}`} className="hover:text-wine">
                      {review.order.orderNumber ?? "Order"}
                    </Link>
                    {" · "}
                    {formatReviewWhen(review.createdAt)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="h-11 cursor-pointer rounded-full border border-ink/15 bg-paper px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <p className="text-sm text-ink/60">
            Page {pagination?.page} of {totalPages}
          </p>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="h-11 cursor-pointer rounded-full border border-ink/15 bg-paper px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
      {dialog}
    </div>
  );
}
