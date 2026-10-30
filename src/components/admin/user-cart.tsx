"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductMedia } from "@/components/shop/product-card";
import { errorText } from "@/lib/apiError";
import { formatCouponValue, getUserCart } from "@/lib/carts";
import { formatPrice } from "@/lib/products";
import type { CartRecord } from "@/types/cart";
import type { Pagination } from "@/types/product";

const limit = 8;

export function UserCart({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState<CartRecord | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getUserCart(userId, { page, limit })
      .then((result) => {
        if (!active) return;
        setCart(result.cart);
        setPagination(result.pagination);
        setError("");
        if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
          setPage(result.pagination.totalPages);
        }
      })
      .catch((caught) => {
        if (!active) return;
        setCart(null);
        setPagination(null);
        setError(errorText(caught, "This cart could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, page]);

  const items = cart?.items ?? [];
  const totalPages = pagination?.totalPages ?? 0;

  return (
    <div className="mt-5 border-t border-ink/10 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="font-display text-2xl tracking-tight">Cart</h4>
        {cart ? <p className="text-sm text-ink/55">{cart.itemCount} in the cart</p> : null}
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {loading && items.length === 0 ? <p className="mt-4 text-sm text-ink/60">Loading cart…</p> : null}
      {!loading && !error && cart && cart.itemCount === 0 ? (
        <p className="mt-4 text-sm text-ink/60">This customer has nothing in the cart.</p>
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
                      <Link href={`/admin/products/${product.id}`} className="mt-1 block font-display text-2xl tracking-tight hover:text-wine">
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
                    <span>
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </span>
                    {product.mrp != null && product.mrp > product.price ? (
                      <span className="text-ink/40 line-through">{formatPrice(product.mrp)}</span>
                    ) : null}
                    <span className={product.stock > 0 ? "text-leaf" : "text-wine"}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                    {item.discount > 0 ? <span className="text-ink/55">Discount {formatPrice(item.discount)}</span> : null}
                    <span>{formatPrice(item.payableTotal)}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      {cart && items.length > 0 ? (
        <dl className="mt-4 grid gap-2 text-sm sm:max-w-xs sm:justify-self-end">
          <div className="flex justify-between gap-4">
            <dt className="text-ink/55">Subtotal</dt>
            <dd>{formatPrice(cart.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/55">
              Discount
              {cart.coupon ? ` (${cart.coupon.code} · ${formatCouponValue(cart.coupon)})` : ""}
            </dt>
            <dd>{formatPrice(cart.discount)}</dd>
          </div>
          <div className="flex justify-between gap-4 font-medium">
            <dt>Total</dt>
            <dd>{formatPrice(cart.total)}</dd>
          </div>
        </dl>
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
