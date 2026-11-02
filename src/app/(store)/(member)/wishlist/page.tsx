import { Suspense } from "react";
import type { Metadata } from "next";
import { ScreenStatus } from "@/components/auth/screen-status";
import { WishlistView } from "@/components/shop/wishlist-view";
import { loadPage } from "@/lib/load";
import { listWishlist } from "@/lib/wishlists";

export const instant = false;

export const metadata: Metadata = {
  title: "Wishlist",
};

export default function WishlistPage() {
  return (
    <Suspense fallback={<ScreenStatus label="Opening the wishlist…" />}>
      <WishlistPageData />
    </Suspense>
  );
}

async function WishlistPageData() {
  const loaded = await loadPage(() => listWishlist({ page: 1, limit: 12 }), null, "The wishlist could not be loaded.");
  return (
    <WishlistView
      initialItems={loaded.data?.items ?? []}
      initialPagination={loaded.data?.pagination ?? null}
      initialError={loaded.error}
    />
  );
}
