"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandCard } from "@/components/shop/brand-card";
import { controlClass } from "@/components/shop/filter-controls";
import { PageFrame } from "@/components/shop/page-frame";
import { errorText } from "@/lib/apiError";
import { listBrands } from "@/lib/brands";
import { routes } from "@/lib/navigation";
import type { Brand, Pagination } from "@/types/brand";

const limit = 18;

export function BrandsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const search = searchParams.get("search") ?? "";
  const [draftSearch, setDraftSearch] = useState(search);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDraftSearch((current) => (current.trim() === search ? current : search));
  }, [search]);

  useEffect(() => {
    const next = draftSearch.trim();
    if (next === search) return;
    const handle = window.setTimeout(() => {
      replaceQuery({ search: next || null });
    }, 350);
    return () => window.clearTimeout(handle);
  }, [draftSearch, search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listBrands({
      page,
      limit,
      search: search || undefined,
      status: "active",
    })
      .then((result) => {
        if (!active) return;
        setBrands(result.brands);
        setPagination(result.pagination);
      })
      .catch((caught) => {
        if (!active) return;
        setBrands([]);
        setPagination(null);
        setError(errorText(caught, "Brands could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, search]);

  function replaceQuery(next: Record<string, string | null>, keepPage = false) {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    if (!keepPage) params.delete("page");
    const text = params.toString();
    router.replace(text ? `${routes.brands}?${text}` : routes.brands);
  }

  const totalPages = pagination?.totalPages ?? 0;

  return (
    <PageFrame eyebrow="Brands" title="Brands" lede="">
      <div className="mb-6 flex items-center gap-3">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search brands</span>
          <input
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
            placeholder="Search brands"
            maxLength={100}
            className={controlClass}
            aria-label="Search brands"
          />
        </label>
        {pagination ? <p className="hidden shrink-0 text-sm text-ink/55 sm:block">{pagination.total} brands</p> : null}
      </div>
      {error ? <p className="mb-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {loading ? <p className="text-sm text-ink/60">Loading brands…</p> : null}
      {!loading && !error && brands.length === 0 ? (
        <p className="rounded-[1.5rem] border border-ink/10 bg-paper px-6 py-8 text-sm text-ink/70">
          No brands match this search.
        </p>
      ) : null}
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
        {brands.map((brand) => (
          <li key={brand.id}>
            <BrandCard brand={brand} />
          </li>
        ))}
      </ul>
      {pagination && totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => replaceQuery({ page: page - 1 <= 1 ? null : String(page - 1) }, true)}
            className="cursor-pointer rounded-full border border-ink/15 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <p className="text-sm text-ink/60">
            Page {pagination.page} of {totalPages}
          </p>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => replaceQuery({ page: String(page + 1) }, true)}
            className="cursor-pointer rounded-full border border-ink/15 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </PageFrame>
  );
}
