"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { controlClass, FilterLabel, FilterSelect } from "@/components/shop/filter-controls";
import { routes } from "@/lib/navigation";
import type { BrandOption, CategoryOption, Pagination, ProductSort } from "@/types/product";

const sorts: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name", label: "Name" },
];

export function ProductFilters({
  brands,
  categories,
  pagination,
}: {
  brands: BrandOption[];
  categories: CategoryOption[];
  pagination: Pagination | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = (searchParams.get("sort") as ProductSort | null) ?? "newest";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const [draftSearch, setDraftSearch] = useState(search);
  const [draftMin, setDraftMin] = useState(minPrice);
  const [draftMax, setDraftMax] = useState(maxPrice);
  const [seenQuery, setSeenQuery] = useState(`${search}\n${minPrice}\n${maxPrice}`);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const nextQuery = `${search}\n${minPrice}\n${maxPrice}`;
  if (nextQuery !== seenQuery) {
    setSeenQuery(nextQuery);
    setDraftSearch((current) => (current.trim() === search ? current : search));
    setDraftMin(minPrice);
    setDraftMax(maxPrice);
  }

  useEffect(() => {
    const next = draftSearch.trim();
    if (next === search) return;
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("stock");
      if (next) params.set("search", next);
      else params.delete("search");
      params.delete("page");
      const text = params.toString();
      router.replace(text ? `${routes.products}?${text}` : routes.products);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [draftSearch, router, search, searchParams]);

  useEffect(() => {
    if (!filtersOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setFiltersOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [filtersOpen]);

  function replaceQuery(next: Record<string, string | null>, keepPage = false) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("stock");
    for (const [key, value] of Object.entries(next)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    if (!keepPage) params.delete("page");
    const text = params.toString();
    router.replace(text ? `${routes.products}?${text}` : routes.products);
  }

  function onApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const min = draftMin.trim();
    const max = draftMax.trim();
    if (min && max && Number(min) > Number(max)) {
      setError("Minimum price cannot exceed maximum price");
      return;
    }
    setError("");
    setFiltersOpen(false);
    replaceQuery({
      search: draftSearch.trim() || null,
      minPrice: min || null,
      maxPrice: max || null,
    });
  }

  function clearFilters() {
    setDraftMin("");
    setDraftMax("");
    setError("");
    setFiltersOpen(false);
    replaceQuery({
      minPrice: null,
      maxPrice: null,
      category: null,
      brand: null,
      sort: null,
    });
  }

  const activeFilters = [minPrice, maxPrice, brand, category, sort !== "newest" ? sort : ""].filter(Boolean).length;

  return (
    <>
      <div className="mb-6 flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          aria-expanded={filtersOpen}
          aria-controls="product-filters"
          className="inline-flex h-12 shrink-0 items-center gap-2.5 rounded-full border border-ink/10 bg-paper py-1 pl-1.5 pr-4 text-sm text-ink shadow-[0_8px_24px_rgba(42,33,28,0.06)] transition hover:border-wine/40"
        >
          <span className="grid size-9 place-items-center rounded-full bg-wine text-white">
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 17h16" />
              <circle cx="9" cy="7" r="2.25" className="fill-wine stroke-white" />
              <circle cx="15" cy="17" r="2.25" className="fill-wine stroke-white" />
            </svg>
          </span>
          <span className="hidden sm:inline">Filters</span>
          {activeFilters > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-blush text-[11px] text-wine">{activeFilters}</span>
          ) : null}
        </button>
        <label className="relative min-w-0 flex-1">
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
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
            placeholder="Search products"
            maxLength={100}
            className={`${controlClass} pl-11`}
            aria-label="Search products"
          />
        </label>
        {pagination ? <p className="hidden shrink-0 text-sm text-ink/55 sm:block">{pagination.total} products</p> : null}
      </div>
      {category ? (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <p className="rounded-full bg-blush px-3 py-1.5 text-sm text-wine">
            {categories.find((item) => item.id === category)?.name ?? "Selected category"}
          </p>
          <button type="button" onClick={() => replaceQuery({ category: null })} className="cursor-pointer text-sm text-ink/70 hover:text-wine">
            All products
          </button>
          <Link href={routes.categories} className="cursor-pointer text-sm text-ink/70 hover:text-wine">
            All categories
          </Link>
        </div>
      ) : null}
      {brand ? (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <p className="rounded-full bg-blush px-3 py-1.5 text-sm text-wine">
            {brands.find((item) => item.id === brand)?.name ?? "Selected brand"}
          </p>
          <button type="button" onClick={() => replaceQuery({ brand: null })} className="cursor-pointer text-sm text-ink/70 hover:text-wine">
            All products
          </button>
          <Link href={routes.brands} className="cursor-pointer text-sm text-ink/70 hover:text-wine">
            All brands
          </Link>
        </div>
      ) : null}
      <button
        type="button"
        aria-label="Close filters"
        tabIndex={filtersOpen ? 0 : -1}
        onClick={() => setFiltersOpen(false)}
        className={`fixed inset-0 z-[60] bg-ink/40 transition-opacity duration-300 ${
          filtersOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <form
        id="product-filters"
        onSubmit={onApply}
        aria-hidden={!filtersOpen}
        inert={!filtersOpen}
        className={`fixed inset-y-0 left-0 z-[70] w-[min(100%,22rem)] overflow-y-auto border-r border-ink/10 bg-paper p-5 shadow-[0_18px_50px_rgba(42,33,28,0.18)] transition-transform duration-300 ${
          filtersOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="page-title">Filters</h2>
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            aria-label="Close filters"
            className="grid size-10 place-items-center rounded-full border border-ink/10"
          >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="mt-5 grid gap-4">
          <label className="block">
            <FilterLabel>Min price</FilterLabel>
            <input
              value={draftMin}
              onChange={(event) => setDraftMin(event.target.value)}
              inputMode="decimal"
              placeholder="0"
              className={controlClass}
              aria-label="Minimum price"
            />
          </label>
          <label className="block">
            <FilterLabel>Max price</FilterLabel>
            <input
              value={draftMax}
              onChange={(event) => setDraftMax(event.target.value)}
              inputMode="decimal"
              placeholder="Any"
              className={controlClass}
              aria-label="Maximum price"
            />
          </label>
          <FilterSelect
            label="Category"
            value={category}
            onChange={(value) => replaceQuery({ category: value || null })}
            options={[{ value: "", label: "All categories" }, ...categories.map((item) => ({ value: item.id, label: item.name }))]}
          />
          <FilterSelect
            label="Brand"
            value={brand}
            onChange={(value) => replaceQuery({ brand: value || null })}
            options={[{ value: "", label: "All brands" }, ...brands.map((item) => ({ value: item.id, label: item.name }))]}
          />
          <FilterSelect
            label="Sort"
            value={sort}
            onChange={(value) => replaceQuery({ sort: value === "newest" ? null : value })}
            options={sorts}
          />
        </div>
        {filtersOpen && error ? <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
        <div className="mt-5 flex gap-2">
          <button type="submit" className="h-12 flex-1 rounded-full bg-wine px-5 text-sm text-white transition hover:bg-wine-deep">
            Apply
          </button>
          <button type="button" onClick={clearFilters} className="h-12 rounded-full border border-ink/15 px-4 text-sm text-ink">
            Clear
          </button>
        </div>
      </form>
    </>
  );
}
