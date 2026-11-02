"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductMedia } from "@/components/shop/product-card";
import { controlClass } from "@/components/shop/filter-controls";
import { errorText } from "@/lib/apiError";
import { formatPrice } from "@/lib/products";
import { listUserWishlist } from "@/lib/wishlists";
import type { Pagination } from "@/types/product";
import type { WishlistItem } from "@/types/wishlist";

const limit = 8;

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function UserWishlist({ userId }: { userId: string }) {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
    listUserWishlist(userId, { page, limit, search: appliedSearch || undefined })
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
        setError(errorText(caught, "This wishlist could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, page, appliedSearch]);

  const totalPages = pagination?.totalPages ?? 0;

  return (
    <div className="mt-5 border-t border-ink/10 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="page-title">Wishlist</h4>
        {pagination ? <p className="text-sm text-ink/55">{pagination.total} saved</p> : null}
      </div>
      <label className="relative mt-4 block">
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
          placeholder="Search saved products"
          maxLength={100}
          aria-label="Search wishlist"
          className={`${controlClass} pl-11`}
        />
      </label>
      {error ? <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {loading ? <p className="mt-4 text-sm text-ink/60">Loading wishlist…</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="mt-4 text-sm text-ink/60">
          {appliedSearch ? "No saved products match that search." : "This customer has not saved any products."}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className="mt-4 grid gap-3">
          {items.map((item) => {
            const product = item.product;
            return (
              <li key={item.id} className="flex gap-3 rounded-2xl border border-ink/10 p-3">
                <ProductMedia src={product.images[0]} alt="" className="size-20 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[0.65rem] uppercase tracking-[0.14em] text-wine">
                        {product.category?.name ?? "Uncategorized"}
                      </p>
                      <Link href={`/admin/products/${product.id}`} className="mt-1 block text-base font-medium leading-snug hover:text-wine">
                        {product.name}
                      </Link>
                      <p className="mt-1 truncate text-sm text-ink/55">
                        {product.brand?.name ?? "No brand"}
                        {" · "}
                        {product.unit ?? "Unit on request"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
                        product.isActive ? "bg-mint text-leaf" : "bg-blush text-wine"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span>{formatPrice(product.price)}</span>
                    {product.mrp != null && product.mrp > product.price ? (
                      <span className="text-ink/40 line-through">{formatPrice(product.mrp)}</span>
                    ) : null}
                    <span className={product.stock > 0 ? "text-leaf" : "text-wine"}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                    <span className="text-ink/45">Saved {formatWhen(item.createdAt)}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="h-11 cursor-pointer rounded-full border border-ink/15 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
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
            className="h-11 cursor-pointer rounded-full border border-ink/15 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
