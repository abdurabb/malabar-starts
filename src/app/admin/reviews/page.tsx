import { Suspense } from "react";
import type { Metadata } from "next";
import { ReviewsAdmin } from "@/components/admin/reviews-admin";
import { loadPage } from "@/lib/load";
import { listReviews } from "@/lib/reviews";

export const instant = false;

export const metadata: Metadata = {
  title: "Reviews",
};

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink/60">Opening reviews…</p>}>
      <AdminReviewsData />
    </Suspense>
  );
}

async function AdminReviewsData() {
  const loaded = await loadPage(() => listReviews({ page: 1, limit: 12 }), null, "Reviews could not be loaded.");
  return (
    <ReviewsAdmin
      initialReviews={loaded.data?.reviews ?? []}
      initialPagination={loaded.data?.pagination ?? null}
      initialError={loaded.error}
    />
  );
}
