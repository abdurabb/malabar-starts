"use client";

import { useState } from "react";
import { ReviewComposer } from "@/components/shop/review-composer";
import { StarRating } from "@/components/shop/star-rating";
import { ApiError, errorText } from "@/lib/apiError";
import { createReview, reviewFormError, updateReview } from "@/lib/reviews";
import { toast } from "@/lib/toast";
import type { OrderItem, OrderItemReview } from "@/types/order";
import type { ReviewUpdateInput } from "@/types/review";

export function OrderItemReview({
  orderId,
  item,
  onSaved,
}: {
  orderId: string;
  item: OrderItem;
  onSaved: (review: OrderItemReview) => void;
}) {
  const review = item.review ?? null;
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [comment, setComment] = useState(review?.comment ?? "");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  function openWrite() {
    setRating(0);
    setComment("");
    setFormError("");
    setOpen(true);
  }

  function openEdit() {
    if (!review) return;
    setRating(review.rating);
    setComment(review.comment ?? "");
    setFormError("");
    setOpen(true);
  }

  function closeForm() {
    if (busy) return;
    setOpen(false);
    setFormError("");
  }

  async function onSubmit() {
    const issue = reviewFormError(rating, comment);
    if (issue) {
      setFormError(issue);
      return;
    }
    if (review) {
      const nextComment = comment.trim();
      const previous = review.comment ?? "";
      const unchanged = rating === review.rating && nextComment === previous;
      if (unchanged) {
        setOpen(false);
        return;
      }
    }
    setFormError("");
    setBusy(true);
    try {
      if (review) {
        const nextComment = comment.trim();
        const previous = review.comment ?? "";
        const input: ReviewUpdateInput = {};
        if (rating !== review.rating) input.rating = rating;
        if (nextComment !== previous) input.comment = nextComment || null;
        const result = await updateReview(review.id, input);
        onSaved({
          id: result.review.id,
          rating: result.review.rating,
          comment: result.review.comment,
        });
        setOpen(false);
        toast(result.message ?? "Review updated");
      } else {
        const result = await createReview({
          order: orderId,
          product: item.product,
          rating,
          comment,
        });
        onSaved({
          id: result.review.id,
          rating: result.review.rating,
          comment: result.review.comment,
        });
        setOpen(false);
        toast(result.message ?? "Review added");
      }
    } catch (caught) {
      const fallback = review ? "The review could not be updated." : "The review could not be added.";
      setFormError(caught instanceof ApiError && caught.status === 409 ? caught.message || "You have already reviewed this product." : errorText(caught, fallback));
    } finally {
      setBusy(false);
    }
  }

  if (review && !open) {
    return (
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-sm text-ink/55">{review.rating} / 5</span>
        </div>
        {review.comment ? <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-ink/75">{review.comment}</p> : null}
        <button type="button" onClick={openEdit} className="mt-2 text-sm text-wine">
          Edit review
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={openWrite}
        className="inline-flex h-9 items-center rounded-full border border-ink/15 px-3 text-xs hover:border-wine hover:text-wine"
      >
        Write review
      </button>
    );
  }

  return (
    <ReviewComposer
      rating={rating}
      comment={comment}
      busy={busy}
      error={formError}
      submitLabel={review ? "Save review" : "Add review"}
      onRating={(value) => {
        setRating(value);
        setFormError("");
      }}
      onComment={(value) => {
        setComment(value);
        setFormError("");
      }}
      onSubmit={onSubmit}
      onCancel={closeForm}
    />
  );
}
