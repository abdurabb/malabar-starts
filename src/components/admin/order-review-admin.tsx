"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductMedia } from "@/components/shop/product-card";
import { StarRating } from "@/components/shop/star-rating";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { errorText } from "@/lib/apiError";
import { deleteReview, findOrderReview, formatReviewWhen, setReviewPublish } from "@/lib/reviews";
import { toast } from "@/lib/toast";
import type { OrderRecord } from "@/types/order";
import type { ReviewRecord } from "@/types/review";

export function OrderReviewAdmin({ order }: { order: OrderRecord }) {
  const { confirm, dialog } = useConfirm();
  const [review, setReview] = useState<ReviewRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  const productKey = order.items.map((item) => item.product).join(",");

  useEffect(() => {
    let active = true;
    setLoading(true);
    findOrderReview(
      order.id,
      productKey.split(",").filter(Boolean),
      order.user?.id,
    )
      .then((found) => {
        if (!active) return;
        setReview(found);
        setError("");
      })
      .catch((caught) => {
        if (!active) return;
        setReview(null);
        setError(errorText(caught, "The review for this order could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [order.id, order.user?.id, productKey, version]);

  async function onPublish() {
    if (!review) return;
    const next = !review.isPublish;
    const ok = await confirm({
      title: next ? "Publish this review?" : "Hide this review?",
      message: next ? "Customers will see it on the product page." : "Customers will no longer see it on the product page.",
      confirmLabel: next ? "Publish" : "Hide",
      tone: next ? "default" : "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const result = await setReviewPublish(review.id, next);
      setReview(result.review);
      toast(result.message ?? (result.review.isPublish ? "Review published" : "Review unpublished"));
    } catch (caught) {
      toast(errorText(caught, "The review could not be updated."));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!review) return;
    const ok = await confirm({
      title: "Delete this review?",
      message: "It will be removed. The customer can write a new review for this order.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const result = await deleteReview(review.id);
      setReview(null);
      toast(result.message);
      setVersion((current) => current + 1);
    } catch (caught) {
      toast(errorText(caught, "The review could not be deleted."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-[1.25rem] border border-ink/10 bg-paper p-4 sm:p-5">
      <h2 className="font-display text-3xl tracking-tight">Review</h2>
      {loading ? <p className="mt-4 text-sm text-ink/60">Looking for a review…</p> : null}
      {error ? <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {!loading && !error && !review ? <p className="mt-4 text-sm text-ink/60">This order has no review yet.</p> : null}
      {review ? (
        <div className="mt-4 flex gap-3">
          <ProductMedia src={review.product.image} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link href={`/admin/products/${review.product.id}`} className="font-display text-2xl tracking-tight hover:text-wine">
                  {review.product.name ?? "Product"}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StarRating rating={review.rating} />
                  <span className="text-sm text-ink/55">{review.rating} / 5</span>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
                  review.isPublish ? "bg-mint text-leaf" : "bg-blush text-wine"
                }`}
              >
                {review.isPublish ? "Published" : "Hidden"}
              </span>
            </div>
            {review.comment ? <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-ink/75">{review.comment}</p> : (
              <p className="mt-3 text-sm text-ink/45">No comment</p>
            )}
            <p className="mt-3 text-xs text-ink/45">
              {review.user.name ?? "Customer"} · {formatReviewWhen(review.createdAt)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onPublish}
                disabled={busy}
                className="cursor-pointer rounded-full border border-ink/15 px-4 py-2 text-sm hover:border-wine hover:text-wine disabled:opacity-40"
              >
                {review.isPublish ? "Hide" : "Publish"}
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={busy}
                className="cursor-pointer rounded-full px-4 py-2 text-sm text-wine disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {dialog}
    </section>
  );
}
