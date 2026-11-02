"use client";

import { useEffect, useState } from "react";
import { useServerSeed } from "@/hooks/useServerSeed";
import { ReviewComposer } from "@/components/shop/review-composer";
import { ProductMedia } from "@/components/shop/product-card";
import { StarRating } from "@/components/shop/star-rating";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/hooks/useAuth";
import { errorText } from "@/lib/apiError";
import { deleteReview, formatReviewWhen, listReviews, reviewFormError, updateReview } from "@/lib/reviews";
import { toast } from "@/lib/toast";
import type { Pagination } from "@/types/product";
import type { ReviewRecord, ReviewUpdateInput } from "@/types/review";

const limit = 6;

export function ProductReviews({
  productId,
  initialReviews,
  initialPagination = null,
  initialError = "",
}: {
  productId: string;
  initialReviews?: ReviewRecord[];
  initialPagination?: Pagination | null;
  initialError?: string;
}) {
  const { session } = useAuth();
  const { confirm, dialog } = useConfirm();
  const seeded = initialReviews !== undefined && !initialError;
  const consumeSeed = useServerSeed(seeded);
  const [reviews, setReviews] = useState<ReviewRecord[]>(initialReviews ?? []);
  const [pagination, setPagination] = useState<Pagination | null>(initialPagination);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!seeded);
  const [version, setVersion] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPage(1);
    setEditingId(null);
  }, [productId]);

  useEffect(() => {
    if (consumeSeed()) return;
    let active = true;
    setLoading(true);
    listReviews({ product: productId, page, limit, isPublish: true })
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
  }, [productId, page, version]);

  function owned(review: ReviewRecord) {
    return session?.user.role === "user" && session.user.id === review.user.id;
  }

  function startEdit(review: ReviewRecord) {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment ?? "");
    setFormError("");
  }

  async function onSubmit(review: ReviewRecord) {
    const issue = reviewFormError(rating, comment);
    if (issue) {
      setFormError(issue);
      return;
    }
    const nextComment = comment.trim();
    const previous = review.comment ?? "";
    const input: ReviewUpdateInput = {};
    if (rating !== review.rating) input.rating = rating;
    if (nextComment !== previous) input.comment = nextComment;
    if (!input.rating && input.comment === undefined) {
      setEditingId(null);
      return;
    }
    setBusy(true);
    try {
      const result = await updateReview(review.id, input);
      setReviews((current) => current.map((item) => (item.id === review.id ? result.review : item)));
      setEditingId(null);
      toast(result.message ?? "Review updated");
    } catch (caught) {
      setFormError(errorText(caught, "The review could not be updated."));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(review: ReviewRecord) {
    const ok = await confirm({
      title: "Delete this review?",
      message: "It will disappear from this product. You can write another from the delivered order.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const result = await deleteReview(review.id);
      toast(result.message);
      if (reviews.length === 1 && page > 1) setPage(page - 1);
      setVersion((current) => current + 1);
    } catch (caught) {
      toast(errorText(caught, "The review could not be deleted."));
    } finally {
      setBusy(false);
    }
  }

  const totalPages = pagination?.totalPages ?? 0;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-ink/10 pt-10">
        <div>
          <h2 className="page-title">Reviews</h2>
          <p className="page-body text-ink/70">Notes from customers who bought this product.</p>
        </div>
        {pagination ? <p className="text-sm text-ink/55">{pagination.total} reviews</p> : null}
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {loading ? <p className="mt-4 text-sm text-ink/60">Loading reviews…</p> : null}
      {!loading && !error && reviews.length === 0 ? <p className="mt-4 text-sm text-ink/60">No reviews yet.</p> : null}
      {reviews.length > 0 ? (
        <ul className="mt-5 grid gap-3">
          {reviews.map((review) => {
            const mine = owned(review);
            return (
              <li key={review.id} className="rounded-[1.25rem] border border-ink/10 bg-paper p-4">
                <div className="flex gap-3">
                  <ProductMedia src={review.product.image} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-medium leading-snug">{review.user.name ?? "Customer"}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <StarRating rating={review.rating} />
                          <span className="text-sm text-ink/55">{review.rating} / 5</span>
                          {mine ? (
                            <span className="rounded-full bg-blush px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-wine">
                              Your review
                            </span>
                          ) : null}
                          {!review.isPublish ? (
                            <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink/70">
                              Hidden
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-xs text-ink/45">{formatReviewWhen(review.createdAt)}</p>
                    </div>
                    {editingId === review.id ? (
                      <div className="mt-4">
                        <ReviewComposer
                          rating={rating}
                          comment={comment}
                          busy={busy}
                          error={formError}
                          submitLabel="Save review"
                          onRating={(value) => {
                            setRating(value);
                            setFormError("");
                          }}
                          onComment={(value) => {
                            setComment(value);
                            setFormError("");
                          }}
                          onSubmit={() => onSubmit(review)}
                          onCancel={() => setEditingId(null)}
                        />
                      </div>
                    ) : (
                      <>
                        {review.comment ? <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-ink/75">{review.comment}</p> : null}
                        {mine ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(review)}
                              disabled={busy}
                              className="h-10 rounded-full border border-ink/15 px-4 text-sm disabled:opacity-40"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(review)}
                              disabled={busy}
                              className="h-10 rounded-full px-4 text-sm text-wine disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="h-11 rounded-full border border-ink/15 px-4 text-sm disabled:opacity-40"
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
            className="h-11 rounded-full border border-ink/15 px-4 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
      {dialog}
    </section>
  );
}
