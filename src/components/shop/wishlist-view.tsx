"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useServerSeed } from "@/hooks/useServerSeed";
import { PageFrame } from "@/components/shop/page-frame";
import { ProductCard } from "@/components/shop/product-card";
import { controlClass } from "@/components/shop/filter-controls";
import { errorText } from "@/lib/apiError";
import { routes } from "@/lib/navigation";
import { listWishlist, toCatalogProduct } from "@/lib/wishlists";
import { useAppSelector } from "@/redux/hooks";
import type { Pagination } from "@/types/product";
import type { WishlistItem } from "@/types/wishlist";

const limit = 12;

export function WishlistView({
  initialItems = [],
  initialPagination = null,
  initialError = "",
}: {
  initialItems?: WishlistItem[];
  initialPagination?: Pagination | null;
  initialError?: string;
}) {
  const revision = useAppSelector((state) => state.shop.wishlistRevision);
  const seeded = initialPagination !== null && !initialError;
  const consumeSeed = useServerSeed(seeded);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<WishlistItem[]>(seeded ? initialItems : []);
  const [pagination, setPagination] = useState<Pagination | null>(seeded ? initialPagination : null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!seeded);

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
    if (consumeSeed()) return;
    let active = true;
    setLoading(true);
    listWishlist({ page, limit, search: appliedSearch || undefined })
      .then((result) => {
        if (!active) return;
        setItems(result.items);
        setPagination(result.pagination);
        setError("");
        if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
          setPage(result.pagination.totalPages);
        }
      })
      .catch((caught) => {
        if (!active) return;
        setItems([]);
        setPagination(null);
        setError(errorText(caught, "The wishlist could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, appliedSearch, revision]);

  const totalPages = pagination?.totalPages ?? 0;

  return (
    <PageFrame
      eyebrow="Wishlist"
      title="Cuts saved for later."
      lede="Keep a bird or a kilo here until the kitchen is ready to book it."
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[12rem] flex-1">
          <span className="sr-only">Search wishlist</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search saved products"
            maxLength={100}
            className={controlClass}
          />
        </label>
        {pagination ? <p className="text-sm text-ink/55">{pagination.total} saved</p> : null}
      </div>
      {error ? <p className="mb-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {loading ? <p className="text-sm text-ink/60">Loading saved products…</p> : null}
      {!loading && !error && items.length === 0 ? (
        <div className="rounded-[1.5rem] border border-ink/10 bg-paper p-8">
          <p className="text-base leading-7 text-ink/70">{appliedSearch ? "Nothing matches that search." : "Nothing saved yet."}</p>
          {appliedSearch ? null : (
            <Link href={routes.products} className="mt-4 inline-flex text-wine">
              Browse products
            </Link>
          )}
        </div>
      ) : null}
      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <li key={item.id}>
              <ProductCard product={toCatalogProduct(item.product)} wishlistItemId={item.id} />
            </li>
          ))}
        </ul>
      ) : null}
      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-full border border-ink/15 px-4 py-2 text-sm disabled:opacity-40"
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
            className="rounded-full border border-ink/15 px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </PageFrame>
  );
}
