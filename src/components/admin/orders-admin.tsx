"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useServerSeed } from "@/hooks/useServerSeed";
import { CancelOrderDialog } from "@/components/shop/cancel-order-dialog";
import { FilterLabel, FilterSelect, controlClass } from "@/components/shop/filter-controls";
import { StatusBadge } from "@/components/shop/status-badge";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { errorText } from "@/lib/apiError";
import { formatOrderWhen, listOrders, updateOrderStatus } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { toast } from "@/lib/toast";
import { adminNextStatuses, isCancelStatus, isOrderStatus, orderStatusChoices, statusActionLabel, statusLabel } from "@/types/status";
import type { OrderRecord, OrderSort } from "@/types/order";
import type { OrderStatus } from "@/types/status";
import type { Pagination } from "@/types/product";

const limit = 10;

const sorts: { value: OrderSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "total_asc", label: "Total, low to high" },
  { value: "total_desc", label: "Total, high to low" },
];

const emptyApplied = {
  search: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  from: "",
  to: "",
  minTotal: "",
  maxTotal: "",
  userId: "",
  product: "",
};

type Applied = typeof emptyApplied;

const dateClass =
  "h-12 w-full rounded-full border border-ink/10 bg-ivory px-4 text-sm text-ink outline-none transition hover:border-wine/35 focus:border-wine";

function money(value: string) {
  if (!value) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 100000000) return Number.NaN;
  return number;
}

function filterIssue(filters: Applied) {
  if (filters.postalCode && !/^[A-Za-z0-9 -]{3,12}$/.test(filters.postalCode)) {
    return "Postal code must be 3–12 letters, numbers, spaces, or hyphens.";
  }
  if (filters.from && filters.to && filters.to < filters.from) return "The end date must be on or after the start date.";
  const min = money(filters.minTotal);
  const max = money(filters.maxTotal);
  if (Number.isNaN(min) || Number.isNaN(max)) return "Totals must be between 0 and 100000000.";
  if (min !== null && max !== null && max < min) return "The maximum total must be at least the minimum.";
  return "";
}

function isoBound(value: string, end: boolean) {
  if (!value) return undefined;
  const date = new Date(`${value}${end ? "T23:59:59.999Z" : "T00:00:00.000Z"}`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function OrdersAdmin({
  initialOrders = [],
  initialPagination = null,
  initialError = "",
}: {
  initialOrders?: OrderRecord[];
  initialPagination?: Pagination | null;
  initialError?: string;
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [userId, setUserId] = useState("");
  const [product, setProduct] = useState("");
  const [applied, setApplied] = useState<Applied>(emptyApplied);
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [sort, setSort] = useState<OrderSort>("newest");
  const [page, setPage] = useState(1);
  const seeded = initialPagination !== null && !initialError;
  const consumeSeed = useServerSeed(seeded);
  const [orders, setOrders] = useState<OrderRecord[]>(seeded ? initialOrders : []);
  const [pagination, setPagination] = useState<Pagination | null>(seeded ? initialPagination : null);
  const [listError, setListError] = useState("");
  const [loading, setLoading] = useState(!seeded);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<OrderRecord | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = {
        search: search.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        postalCode: postalCode.trim(),
        from,
        to,
        minTotal: minTotal.trim(),
        maxTotal: maxTotal.trim(),
        userId: userId.trim(),
        product: product.trim(),
      };
      const same = (Object.keys(next) as (keyof Applied)[]).every((key) => applied[key] === next[key]);
      if (same) return;
      setApplied(next);
      setPage(1);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [applied, search, city, state, country, postalCode, from, to, minTotal, maxTotal, userId, product]);

  useEffect(() => {
    const issue = filterIssue(applied);
    if (issue) {
      setListError(issue);
      setLoading(false);
      return;
    }
    if (consumeSeed()) return;
    let active = true;
    setLoading(true);
    const min = money(applied.minTotal);
    const max = money(applied.maxTotal);
    listOrders({
      page,
      limit,
      search: applied.search || undefined,
      status: status === "all" ? undefined : status,
      sort,
      city: applied.city || undefined,
      state: applied.state || undefined,
      country: applied.country || undefined,
      postalCode: applied.postalCode || undefined,
      from: isoBound(applied.from, false),
      to: isoBound(applied.to, true),
      minTotal: min ?? undefined,
      maxTotal: max ?? undefined,
      userId: applied.userId || undefined,
      product: applied.product || undefined,
    })
      .then((result) => {
        if (!active) return;
        setOrders(result.orders);
        setPagination(result.pagination);
        setListError("");
        if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
          setPage(result.pagination.totalPages);
        }
      })
      .catch((caught) => {
        if (!active) return;
        setOrders([]);
        setPagination(null);
        setListError(errorText(caught, "Orders could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, applied, status, sort]);

  async function onAdvance(order: OrderRecord, status: OrderStatus) {
    if (isCancelStatus(status)) {
      setCancelTarget(order);
      return;
    }
    const ok = await confirm({
      title: `${statusActionLabel(status)}?`,
      message: `${order.orderNumber} will be marked ${statusLabel(status).toLowerCase()}.`,
      confirmLabel: statusActionLabel(status),
    });
    if (!ok) return;
    setBusyId(order.id);
    try {
      const result = await updateOrderStatus(order.id, { status });
      setOrders((current) => current.map((item) => (item.id === order.id ? result.order : item)));
      toast(result.message);
    } catch (caught) {
      toast(errorText(caught, "The status could not be updated."));
    } finally {
      setBusyId(null);
    }
  }

  async function onCancel(reason: string) {
    const order = cancelTarget;
    const status = order ? adminNextStatuses(order.status).find((item) => isCancelStatus(item)) : undefined;
    if (!order || !status) return;
    setBusyId(order.id);
    try {
      const result = await updateOrderStatus(order.id, { status, cancelReason: reason });
      setOrders((current) => current.map((item) => (item.id === order.id ? result.order : item)));
      setCancelTarget(null);
      toast(result.message);
    } catch (caught) {
      toast(errorText(caught, "The order could not be cancelled."));
    } finally {
      setBusyId(null);
    }
  }

  function clearFilters() {
    setStatus("all");
    setSort("newest");
    setCity("");
    setState("");
    setCountry("");
    setPostalCode("");
    setFrom("");
    setTo("");
    setMinTotal("");
    setMaxTotal("");
    setUserId("");
    setProduct("");
    setApplied((current) => ({ ...emptyApplied, search: current.search }));
    setPage(1);
  }

  const totalPages = pagination?.totalPages ?? 0;
  const statusOptions = [{ value: "all", label: "All statuses" }, ...orderStatusChoices()];
  const activeFilters = [
    status !== "all",
    sort !== "newest",
    applied.city,
    applied.state,
    applied.country,
    applied.postalCode,
    applied.from,
    applied.to,
    applied.minTotal,
    applied.maxTotal,
    applied.userId,
    applied.product,
  ].filter(Boolean).length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFiltersOpen((current) => !current)}
          aria-expanded={filtersOpen}
          className={`inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-5 text-sm transition ${
            filtersOpen ? "border-wine bg-blush text-wine" : "border-ink/15 bg-paper text-ink hover:border-wine"
          }`}
        >
          Filters
          {activeFilters > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-wine text-[11px] text-white">{activeFilters}</span>
          ) : null}
        </button>
        <label className="relative min-w-[12rem] flex-1">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order number or product"
            maxLength={100}
            aria-label="Search orders"
            className={`${controlClass} pl-4`}
          />
        </label>
        {pagination ? <p className="hidden shrink-0 text-sm text-ink/55 sm:block">{pagination.total} orders</p> : null}
      </div>

      {filtersOpen ? (
        <form className="mt-6 rounded-[1.75rem] border border-ink/10 bg-paper p-4 sm:p-5" onSubmit={(event) => event.preventDefault()}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
            <label className="block">
              <FilterLabel>City</FilterLabel>
              <input value={city} onChange={(event) => setCity(event.target.value)} maxLength={80} className={controlClass} />
            </label>
            <label className="block">
              <FilterLabel>State</FilterLabel>
              <input value={state} onChange={(event) => setState(event.target.value)} maxLength={80} className={controlClass} />
            </label>
            <label className="block">
              <FilterLabel>Country</FilterLabel>
              <input value={country} onChange={(event) => setCountry(event.target.value)} maxLength={80} className={controlClass} />
            </label>
            <label className="block">
              <FilterLabel>Postal code</FilterLabel>
              <input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} maxLength={12} className={controlClass} />
            </label>
            <label className="block">
              <FilterLabel>From</FilterLabel>
              <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className={dateClass} />
            </label>
            <label className="block">
              <FilterLabel>To</FilterLabel>
              <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className={dateClass} />
            </label>
            <label className="block">
              <FilterLabel>Minimum total</FilterLabel>
              <input value={minTotal} onChange={(event) => setMinTotal(event.target.value)} inputMode="decimal" className={controlClass} />
            </label>
            <label className="block">
              <FilterLabel>Maximum total</FilterLabel>
              <input value={maxTotal} onChange={(event) => setMaxTotal(event.target.value)} inputMode="decimal" className={controlClass} />
            </label>
            <label className="block">
              <FilterLabel>Customer id</FilterLabel>
              <input value={userId} onChange={(event) => setUserId(event.target.value)} maxLength={100} className={controlClass} />
            </label>
            <label className="block">
              <FilterLabel>Product id</FilterLabel>
              <input value={product} onChange={(event) => setProduct(event.target.value)} maxLength={100} className={controlClass} />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={activeFilters === 0}
              className="h-12 cursor-pointer rounded-full border border-ink/15 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear filters
            </button>
          </div>
        </form>
      ) : null}

      {listError ? <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{listError}</p> : null}
      {loading ? <p className="mt-6 text-sm text-ink/60">Loading orders…</p> : null}
      {!loading && !listError && orders.length === 0 ? (
        <p className="mt-6 rounded-[1.5rem] border border-dashed border-ink/15 bg-paper px-6 py-12 text-center text-base leading-7 text-ink/70">
          No orders in this view.
        </p>
      ) : null}
      {orders.length > 0 ? (
        <ul className="mt-5 grid gap-3">
          {orders.map((order) => {
            const next = adminNextStatuses(order.status);
            const busy = busyId === order.id;
            return (
              <li key={order.id}>
                <div
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && event.target === event.currentTarget) router.push(`/admin/orders/${order.id}`);
                  }}
                  className="cursor-pointer rounded-2xl border border-ink/10 bg-paper p-4 transition hover:border-wine"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-medium leading-snug">{order.orderNumber}</p>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="mt-2 text-sm text-ink/70">
                        {order.user ? (
                          <Link
                            href={`/admin/customers/${order.user.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="hover:text-wine"
                          >
                            {order.user.name}
                          </Link>
                        ) : (
                          "Account removed"
                        )}
                        {order.user?.email ? <span className="text-ink/50"> · {order.user.email}</span> : null}
                      </p>
                      <p className="mt-1 text-sm text-ink/55">
                        {formatOrderWhen(order.createdAt)}
                        {order.shippingAddress.city ? ` · ${order.shippingAddress.city}` : ""}
                        {order.shippingAddress.country ? `, ${order.shippingAddress.country}` : ""}
                        {` · ${order.itemCount} items`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{formatPrice(order.total)}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink/45">{statusLabel(order.paymentStatus)}</p>
                    </div>
                  </div>
                  {next.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-3">
                      {next.map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={busy}
                          onClick={(event) => {
                            event.stopPropagation();
                            onAdvance(order, status);
                          }}
                          className={`inline-flex h-9 items-center rounded-full px-3 text-xs disabled:opacity-40 ${
                            isCancelStatus(status) ? "border border-wine text-wine" : "bg-wine text-white hover:bg-wine-deep"
                          }`}
                        >
                          {statusActionLabel(status)}
                        </button>
                      ))}
                    </div>
                  ) : null}
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
      {cancelTarget ? (
        <CancelOrderDialog
          orderNumber={cancelTarget.orderNumber}
          busy={busyId === cancelTarget.id}
          onClose={() => {
            if (busyId !== cancelTarget.id) setCancelTarget(null);
          }}
          onConfirm={onCancel}
        />
      ) : null}
      {dialog}
    </div>
  );
}
