"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductMedia } from "@/components/shop/product-card";
import { StatusBadge } from "@/components/shop/status-badge";
import { controlClass } from "@/components/shop/filter-controls";
import { errorText } from "@/lib/apiError";
import { formatOrderWhen, listOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { statusLabel } from "@/types/status";
import type { OrderRecord } from "@/types/order";
import type { Pagination } from "@/types/product";

const limit = 8;

export function UserOrders({ userId }: { userId: string }) {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
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
    listOrders({ page, limit, userId, search: appliedSearch || undefined })
      .then((result) => {
        if (!active) return;
        setOrders(result.orders);
        setPagination(result.pagination);
        setError("");
        if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
          setPage(result.pagination.totalPages);
        }
      })
      .catch((caught) => {
        if (!active) return;
        setOrders([]);
        setPagination(null);
        setError(errorText(caught, "These orders could not be loaded."));
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
        <h4 className="page-title">Orders</h4>
        {pagination ? <p className="text-sm text-ink/55">{pagination.total} orders</p> : null}
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
          placeholder="Search order number or product"
          maxLength={100}
          aria-label="Search orders"
          className={`${controlClass} pl-11`}
        />
      </label>
      {error ? <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {loading ? <p className="mt-4 text-sm text-ink/60">Loading orders…</p> : null}
      {!loading && !error && orders.length === 0 ? (
        <p className="mt-4 text-sm text-ink/60">
          {appliedSearch ? "No orders match that search." : "This customer has no orders."}
        </p>
      ) : null}
      {orders.length > 0 ? (
        <ul className="mt-4 grid gap-3">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-ink/10 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/admin/orders/${order.id}`} className="text-base font-medium leading-snug hover:text-wine">
                    {order.orderNumber}
                  </Link>
                  <p className="mt-1 text-sm text-ink/55">
                    {formatOrderWhen(order.createdAt)}
                    {order.shippingAddress.city ? ` · ${order.shippingAddress.city}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={order.status} />
                  <p className="mt-2 text-sm">{formatPrice(order.total)}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink/45">{statusLabel(order.paymentStatus)}</p>
                </div>
              </div>
              <ul className="mt-3 grid gap-2">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <ProductMedia src={item.image} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <Link href={`/admin/products/${item.product}`} className="block truncate text-sm hover:text-wine">
                        {item.name}
                      </Link>
                      <p className="text-xs text-ink/55">
                        {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
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
