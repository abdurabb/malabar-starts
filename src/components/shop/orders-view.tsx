"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useServerSeed } from "@/hooks/useServerSeed";
import { FilterSelect, controlClass } from "@/components/shop/filter-controls";
import { PageFrame } from "@/components/shop/page-frame";
import { StatusBadge } from "@/components/shop/status-badge";
import { errorText } from "@/lib/apiError";
import { formatOrderWhen, listOrders, orderNeedsItemReview } from "@/lib/orders";
import { routes } from "@/lib/navigation";
import { formatPrice } from "@/lib/products";
import { isOrderStatus, orderStatusChoices, statusLabel } from "@/types/status";
import type { OrderRecord, OrderSort } from "@/types/order";
import type { OrderStatus } from "@/types/status";
import type { Pagination } from "@/types/product";

const limit = 8;

const sorts: { value: OrderSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "total_asc", label: "Total, low to high" },
  { value: "total_desc", label: "Total, high to low" },
];

export function OrdersView({
  initialOrders = [],
  initialPagination = null,
  initialError = "",
}: {
  initialOrders?: OrderRecord[];
  initialPagination?: Pagination | null;
  initialError?: string;
}) {
  const seeded = initialPagination !== null && !initialError;
  const consumeSeed = useServerSeed(seeded);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [sort, setSort] = useState<OrderSort>("newest");
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<OrderRecord[]>(seeded ? initialOrders : []);
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
    listOrders({
      page,
      limit,
      search: appliedSearch || undefined,
      status: status === "all" ? undefined : status,
      sort,
    })
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
        setError(errorText(caught, "Orders could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, appliedSearch, status, sort]);

  const totalPages = pagination?.totalPages ?? 0;
  const statusOptions = [{ value: "all", label: "All statuses" }, ...orderStatusChoices()];

  return (
    <PageFrame eyebrow="Orders" title="Orders" lede="Orders placed from your cart.">
      {pagination ? <p className="mb-5 text-sm text-ink/55">{pagination.total} orders</p> : null}
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem_16rem]">
        <label className="relative block">
          <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.16em] text-ink/45">Search</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order number or product"
            maxLength={100}
            aria-label="Search orders"
            className={controlClass}
          />
        </label>
        <FilterSelect
          label="Status"
          value={status}
          onChange={(value) => {
            if (value !== "all" && !isOrderStatus(value)) return;
            setStatus(value as OrderStatus | "all");
            setPage(1);
          }}
          options={statusOptions}
        />
        <FilterSelect
          label="Sort"
          value={sort}
          onChange={(value) => {
            setSort(value as OrderSort);
            setPage(1);
          }}
          options={sorts}
        />
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {loading && orders.length === 0 ? <p className="mt-6 text-sm text-ink/60">Loading orders…</p> : null}
      {!loading && !error && orders.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-ink/10 bg-paper p-8">
          <p className="text-base leading-7 text-ink/70">{appliedSearch || status !== "all" ? "No orders match." : "No orders yet."}</p>
          <Link href={routes.products} className="mt-4 inline-flex text-wine">
            Browse products
          </Link>
        </div>
      ) : null}
      {orders.length > 0 ? (
        <ul className="mt-6 grid gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`${routes.orders}/${order.id}`}
                className="block rounded-[1.25rem] border border-ink/10 bg-paper p-4 transition hover:border-wine"
              >
                <span className="flex flex-wrap items-start justify-between gap-3">
                  <span>
                    <span className="block text-base font-medium leading-snug">{order.orderNumber}</span>
                    <span className="mt-1 block text-sm text-ink/55">
                      {formatOrderWhen(order.createdAt)}
                      {order.shippingAddress.city ? ` · ${order.shippingAddress.city}` : ""}
                      {` · ${order.itemCount} items`}
                    </span>
                    {orderNeedsItemReview(order) ? (
                      <span className="mt-2 block text-xs uppercase tracking-[0.12em] text-wine">Write review</span>
                    ) : null}
                  </span>
                  <span className="text-right">
                    <StatusBadge status={order.status} />
                    <span className="mt-2 block text-sm">{formatPrice(order.total)}</span>
                    <span className="mt-1 block text-xs uppercase tracking-[0.12em] text-ink/45">
                      {statusLabel(order.paymentStatus)}
                    </span>
                  </span>
                </span>
              </Link>
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
