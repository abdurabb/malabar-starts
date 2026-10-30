"use client";

import { useEffect, useState } from "react";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ChoiceGroup, controlClass } from "@/components/shop/filter-controls";
import { ProductMedia } from "@/components/shop/product-card";
import { errorText } from "@/lib/apiError";
import { deleteCategory, listCategories, updateCategory } from "@/lib/categories";
import { toast } from "@/lib/toast";
import type { Category, CategoryStatus, Pagination } from "@/types/category";

const limit = 12;

export function CategoriesAdmin() {
  const { confirm, dialog } = useConfirm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState<CategoryStatus>("all");
  // Parent filter is off until subcategories are in use.
  // const [parents, setParents] = useState<Category[]>([]);
  // const [parent, setParent] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [listError, setListError] = useState("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // useEffect(() => {
  //   listCategories({ limit: 100, status: "all" })
  //     .then((result) => setParents(result.categories))
  //     .catch(() => setParents([]));
  // }, [version]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listCategories({
      page,
      limit,
      search: appliedSearch || undefined,
      status,
      // parent: parent || undefined,
    })
      .then((result) => {
        if (!active) return;
        setCategories(result.categories);
        setPagination(result.pagination);
        setListError("");
        if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
          setPage(result.pagination.totalPages);
        }
      })
      .catch((caught) => {
        if (!active) return;
        setCategories([]);
        setPagination(null);
        setListError(errorText(caught, "Categories could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, appliedSearch, status, version]);

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
    setPage(1);
  }

  function onSaved(created: boolean) {
    setOpen(false);
    if (created) setPage(1);
    setVersion((current) => current + 1);
  }

  async function onStatus(category: Category) {
    const nextActive = !category.isActive;
    const ok = await confirm({
      title: nextActive ? "Activate this category?" : "Deactivate this category?",
      message: nextActive
        ? `${category.name} will show in the shop again.`
        : `${category.name} will be hidden from the shop.`,
      confirmLabel: nextActive ? "Activate" : "Deactivate",
      tone: nextActive ? "default" : "danger",
    });
    if (!ok) return;
    try {
      const result = await updateCategory(category.id, { isActive: nextActive });
      setCategories((current) => current.map((item) => (item.id === category.id ? result.category : item)));
      toast(result.message ?? (result.category.isActive ? "Category activated" : "Category deactivated"));
    } catch (caught) {
      toast(errorText(caught, "The status could not be changed."));
    }
  }

  async function onDelete(category: Category) {
    const ok = await confirm({
      title: "Delete this category?",
      message: `${category.name} will be removed. This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const result = await deleteCategory(category.id);
      if (editing?.id === category.id) setOpen(false);
      toast(result.message);
      if (categories.length === 1 && page > 1) setPage(page - 1);
      setVersion((current) => current + 1);
    } catch (caught) {
      toast(errorText(caught, "The category could not be deleted."));
    }
  }

  const totalPages = pagination?.totalPages ?? 0;
  const activeFilters = [status !== "all" ? status : ""].filter(Boolean).length;

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
            placeholder="Search categories"
            maxLength={100}
            aria-label="Search categories"
            className={`${controlClass} pl-11`}
          />
        </label>
        {pagination ? <p className="hidden shrink-0 text-sm text-ink/55 sm:block">{pagination.total} categories</p> : null}
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-12 shrink-0 cursor-pointer items-center rounded-full bg-wine px-5 text-sm text-white transition hover:bg-wine-deep"
        >
          Add category
        </button>
      </div>

      {filtersOpen ? (
        <form
          className="mt-6 rounded-[1.75rem] border border-ink/10 bg-paper p-4 sm:p-5"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="max-w-md">
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
          </div>
          {/* Parent filter is off until subcategories are in use.
          <FilterSelect
            label="Parent"
            value={parent}
            onChange={(value) => {
              setParent(value);
              setPage(1);
            }}
            options={[
              { value: "", label: "All parents" },
              { value: "root", label: "Root only" },
              ...parents.map((item) => ({ value: item.id, label: item.name })),
            ]}
          />
          */}
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
      {loading ? <p className="mt-6 text-sm text-ink/60">Loading categories…</p> : null}
      {!loading && !listError && categories.length === 0 ? (
        <div className="mt-6 rounded-[1.75rem] border border-dashed border-ink/15 bg-paper px-6 py-12 text-center">
          <p className="font-display text-3xl">No categories in this view.</p>
          <button type="button" onClick={openCreate} className="mt-5 cursor-pointer text-sm text-wine">
            Add the first one
          </button>
        </div>
      ) : null}

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <li key={category.id} className="flex min-w-0 gap-3 rounded-2xl border border-ink/10 bg-paper p-2.5">
            <ProductMedia src={category.image} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-display text-lg leading-tight tracking-tight">{category.name}</p>
                  {/* <p className="mt-0.5 truncate text-xs text-ink/55">
                    {category.parent?.name ?? "Root"} · order {category.sortOrder}
                  </p> */}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                    category.isActive ? "bg-mint text-leaf" : "bg-blush text-wine"
                  }`}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {category.description ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/65">{category.description}</p> : null}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(category);
                    setOpen(true);
                  }}
                  className="cursor-pointer rounded-full border border-ink/15 px-2.5 py-1 text-xs hover:border-wine hover:text-wine"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onStatus(category)}
                  className="cursor-pointer rounded-full border border-ink/15 px-2.5 py-1 text-xs hover:border-wine hover:text-wine"
                >
                  {category.isActive ? "Deactivate" : "Activate"}
                </button>
                <button type="button" onClick={() => onDelete(category)} className="cursor-pointer rounded-full px-2.5 py-1 text-xs text-wine">
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
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

      {open ? <CategoryFormDialog category={editing} onClose={() => setOpen(false)} onSaved={onSaved} /> : null}
      {dialog}
    </div>
  );
}
