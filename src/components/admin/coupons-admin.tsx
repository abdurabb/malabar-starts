"use client";

import { useEffect, useState } from "react";
import { CouponFormDialog } from "@/components/admin/coupon-form-dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ChoiceGroup, controlClass } from "@/components/shop/filter-controls";
import { errorText } from "@/lib/apiError";
import { deleteCoupon, formatCouponOffer, formatCouponWhen, listCoupons, setCouponStatus } from "@/lib/coupons";
import { toast } from "@/lib/toast";
import type { Coupon, CouponStatus, CouponType, Pagination } from "@/types/coupon";

const limit = 12;

type TypeFilter = CouponType | "all";

function windowText(coupon: Coupon) {
  if (!coupon.startsAt && !coupon.expiresAt) return "Always available";
  const start = coupon.startsAt ? formatCouponWhen(coupon.startsAt) : "Any time";
  const end = coupon.expiresAt ? formatCouponWhen(coupon.expiresAt) : "No end";
  return `${start} – ${end}`;
}

function timing(coupon: Coupon) {
  const now = Date.now();
  const start = coupon.startsAt ? new Date(coupon.startsAt).getTime() : null;
  const end = coupon.expiresAt ? new Date(coupon.expiresAt).getTime() : null;
  if (end !== null && !Number.isNaN(end) && end <= now) return "Expired";
  if (start !== null && !Number.isNaN(start) && start > now) return "Scheduled";
  return "";
}

export function CouponsAdmin() {
  const { confirm, dialog } = useConfirm();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState<CouponStatus>("all");
  const [couponType, setCouponType] = useState<TypeFilter>("all");
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [open, setOpen] = useState(false);
  const [listError, setListError] = useState("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listCoupons({
      page,
      limit,
      search: appliedSearch || undefined,
      status,
      couponType: couponType === "all" ? undefined : couponType,
    })
      .then((result) => {
        if (!active) return;
        setCoupons(result.coupons);
        setPagination(result.pagination);
        setListError("");
        if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
          setPage(result.pagination.totalPages);
        }
      })
      .catch((caught) => {
        if (!active) return;
        setCoupons([]);
        setPagination(null);
        setListError(errorText(caught, "Coupons could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, appliedSearch, status, couponType, version]);

  useEffect(() => {
    const next = search.trim();
    if (next === appliedSearch) return;
    const handle = window.setTimeout(() => {
      setPage(1);
      setAppliedSearch(next);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [search, appliedSearch]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function clearFilters() {
    setStatus("all");
    setCouponType("all");
    setPage(1);
  }

  function onSaved(created: boolean) {
    setOpen(false);
    if (created) setPage(1);
    setVersion((current) => current + 1);
  }

  async function onStatus(coupon: Coupon) {
    const nextActive = !coupon.isActive;
    const ok = await confirm({
      title: nextActive ? "Activate this coupon?" : "Deactivate this coupon?",
      message: nextActive
        ? `${coupon.code} can be applied at checkout again.`
        : `${coupon.code} will stop applying at checkout.`,
      confirmLabel: nextActive ? "Activate" : "Deactivate",
      tone: nextActive ? "default" : "danger",
    });
    if (!ok) return;
    try {
      const result = await setCouponStatus(coupon.id, nextActive);
      setCoupons((current) => current.map((item) => (item.id === coupon.id ? result.coupon : item)));
      toast(result.message ?? (result.coupon.isActive ? "Coupon activated" : "Coupon deactivated"));
    } catch (caught) {
      toast(errorText(caught, "The status could not be changed."));
    }
  }

  async function onDelete(coupon: Coupon) {
    const ok = await confirm({
      title: "Delete this coupon?",
      message: `${coupon.code} will be removed. Customers will no longer be able to apply it.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const result = await deleteCoupon(coupon.id);
      if (editing?.id === coupon.id) setOpen(false);
      toast(result.message);
      if (coupons.length === 1 && page > 1) setPage(page - 1);
      setVersion((current) => current + 1);
    } catch (caught) {
      toast(errorText(caught, "The coupon could not be deleted."));
    }
  }

  const totalPages = pagination?.totalPages ?? 0;
  const activeFilters = [status !== "all" ? status : "", couponType !== "all" ? couponType : ""].filter(Boolean).length;

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
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filters
          {activeFilters > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-wine text-[11px] text-white">{activeFilters}</span>
          ) : null}
        </button>
        <label className="relative min-w-[12rem] flex-1">
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
            placeholder="Search coupons"
            maxLength={100}
            aria-label="Search coupons"
            className={`${controlClass} pl-11`}
          />
        </label>
        {pagination ? <p className="hidden shrink-0 text-sm text-ink/55 sm:block">{pagination.total} coupons</p> : null}
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-12 shrink-0 cursor-pointer items-center rounded-full bg-wine px-5 text-sm text-white transition hover:bg-wine-deep"
        >
          Add coupon
        </button>
      </div>

      {filtersOpen ? (
        <form
          className="mt-6 rounded-[1.75rem] border border-ink/10 bg-paper p-4 sm:p-5"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <ChoiceGroup
              label="Listing"
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
            <ChoiceGroup
              label="Offer"
              value={couponType}
              onChange={(value) => {
                setCouponType(value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All" },
                { value: "price", label: "Amount" },
                { value: "percentage", label: "Percent" },
              ]}
            />
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
      {loading ? <p className="mt-6 text-sm text-ink/60">Loading coupons…</p> : null}
      {!loading && !listError && coupons.length === 0 ? (
        <div className="mt-6 rounded-[1.75rem] border border-dashed border-ink/15 bg-paper px-6 py-12 text-center">
          <p className="font-display text-3xl">No coupons in this view.</p>
          <button type="button" onClick={openCreate} className="mt-5 cursor-pointer text-sm text-wine">
            Add the first one
          </button>
        </div>
      ) : null}

      <ul className="mt-5 grid gap-3">
        {coupons.map((coupon) => {
          const phase = timing(coupon);
          return (
            <li key={coupon.id} className="rounded-2xl border border-ink/10 bg-paper p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-2xl leading-none tracking-tight">{coupon.code}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                        coupon.isActive ? "bg-mint text-leaf" : "bg-blush text-wine"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink/70">
                      {coupon.couponType === "percentage" ? "Percent" : "Fixed amount"}
                    </span>
                    {phase ? (
                      <span className="rounded-full bg-wheat px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink/70">
                        {phase}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-ink">{formatCouponOffer(coupon)}</p>
                  {coupon.description ? <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink/65">{coupon.description}</p> : null}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(coupon);
                      setOpen(true);
                    }}
                    className="cursor-pointer rounded-full border border-ink/15 px-2.5 py-1 text-xs hover:border-wine hover:text-wine"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onStatus(coupon)}
                    className="cursor-pointer rounded-full border border-ink/15 px-2.5 py-1 text-xs hover:border-wine hover:text-wine"
                  >
                    {coupon.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button type="button" onClick={() => onDelete(coupon)} className="cursor-pointer rounded-full px-2.5 py-1 text-xs text-wine">
                    Delete
                  </button>
                </div>
              </div>
              <dl className="mt-3 grid gap-2 text-xs text-ink/60 sm:grid-cols-3">
                <div>
                  <dt className="uppercase tracking-[0.12em] text-ink/40">Use</dt>
                  <dd className="mt-1">
                    Used by {coupon.usedBy?.length ?? 0} · {coupon.usageLimitPerUser} per customer
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="uppercase tracking-[0.12em] text-ink/40">Window</dt>
                  <dd className="mt-1">{windowText(coupon)}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="h-11 cursor-pointer rounded-full border border-ink/15 bg-paper px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
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
            className="h-11 cursor-pointer rounded-full border border-ink/15 bg-paper px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}

      {open ? <CouponFormDialog coupon={editing} onClose={() => setOpen(false)} onSaved={onSaved} /> : null}
      {dialog}
    </div>
  );
}
