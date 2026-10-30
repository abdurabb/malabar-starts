"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CategoryCard } from "@/components/shop/category-card";
import { controlClass } from "@/components/shop/filter-controls";
import { PageFrame } from "@/components/shop/page-frame";
import { errorText } from "@/lib/apiError";
import { listCategories } from "@/lib/categories";
import { routes } from "@/lib/navigation";
import type { Category, Pagination } from "@/types/category";

const limit = 18;

export function CategoriesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const search = searchParams.get("search") ?? "";
  const [draftSearch, setDraftSearch] = useState(search);
  const [categories, setCategories] = useState<Category[]>([]);
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
    listCategories({
      page,
      limit,
      search: search || undefined,
      status: "active",
    })
      .then((result) => {
        if (!active) return;
        setCategories(result.categories);
        setPagination(result.pagination);
      })
      .catch((caught) => {
        if (!active) return;
        setCategories([]);
        setPagination(null);
        setError(errorText(caught, "Categories could not be loaded."));
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
    router.replace(text ? `${routes.categories}?${text}` : routes.categories);
  }

  const totalPages = pagination?.totalPages ?? 0;

  return (
    <PageFrame eyebrow="Categories" title="Categories" lede="">
      <div className="mb-6 flex items-center gap-3">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search categories</span>
          <input
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
            placeholder="Search categories"
            maxLength={100}
            className={controlClass}
            aria-label="Search categories"
          />
        </label>
        {pagination ? <p className="hidden shrink-0 text-sm text-ink/55 sm:block">{pagination.total} categories</p> : null}
      </div>
      {error ? <p className="mb-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {loading ? <p className="text-sm text-ink/60">Loading categories…</p> : null}
      {!loading && !error && categories.length === 0 ? (
        <p className="rounded-[1.5rem] border border-ink/10 bg-paper px-6 py-8 text-sm text-ink/70">
          No categories match this search.
        </p>
      ) : null}
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryCard category={category} />
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
