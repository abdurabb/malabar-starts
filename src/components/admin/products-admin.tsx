"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ChoiceGroup, controlClass, FilterSelect } from "@/components/shop/filter-controls";
import { ProductMedia, ProductRatingLine } from "@/components/shop/product-card";
import { errorText } from "@/lib/apiError";
import {
  deleteProduct,
  formatPrice,
  listBrandOptions,
  listCategoryOptions,
  listProducts,
  setProductStatus,
} from "@/lib/products";
import { toast } from "@/lib/toast";
import type { BrandOption, CatalogProduct, CategoryOption, Pagination, ProductSort, ProductStatus } from "@/types/product";

const limit = 10;

type StockFilter = "all" | "in" | "out";

export function ProductsAdmin() {
  const { confirm, dialog } = useConfirm();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState<ProductStatus>("all");
  const [stock, setStock] = useState<StockFilter>("all");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<ProductSort>("newest");
  const [editing, setEditing] = useState<CatalogProduct | null>(null);
  const [open, setOpen] = useState(false);
  const [listError, setListError] = useState("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    listBrandOptions().then(setBrands).catch(() => setBrands([]));
    listCategoryOptions().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listProducts({
      page,
      limit,
      search: appliedSearch || undefined,
      status,
      brand: brand || undefined,
      category: category || undefined,
      sort,
      inStock: stock === "all" ? undefined : stock === "in",
    })
      .then((result) => {
        if (!active) return;
        setProducts(result.products);
        setPagination(result.pagination);
        setListError("");
        if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
          setPage(result.pagination.totalPages);
        }
      })
      .catch((caught) => {
        if (!active) return;
        setProducts([]);
        setPagination(null);
        setListError(errorText(caught, "Products could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, appliedSearch, status, stock, brand, category, sort, version]);

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
    setStock("all");
    setBrand("");
    setCategory("");
    setSort("newest");
    setPage(1);
  }

  function openEdit(product: CatalogProduct) {
    setEditing(product);
    setOpen(true);
  }

  function onSaved(created: boolean) {
    setOpen(false);
    if (created) setPage(1);
    setVersion((current) => current + 1);
  }

  async function onStatus(product: CatalogProduct) {
    const nextActive = !product.isActive;
    const ok = await confirm({
      title: nextActive ? "Activate this product?" : "Deactivate this product?",
      message: nextActive
        ? `${product.name} will show on the counter again.`
        : `${product.name} will be hidden from customers.`,
      confirmLabel: nextActive ? "Activate" : "Deactivate",
      tone: nextActive ? "default" : "danger",
    });
    if (!ok) return;
    try {
      const result = await setProductStatus(product.id, nextActive);
      setProducts((current) => current.map((item) => (item.id === product.id ? result.product : item)));
      toast(result.message ?? (result.product.isActive ? "Product activated" : "Product deactivated"));
    } catch (caught) {
      toast(errorText(caught, "The status could not be changed."));
    }
  }

  async function onDelete(product: CatalogProduct) {
    const ok = await confirm({
      title: "Delete this product?",
      message: `${product.name} will be removed from the catalog. This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const result = await deleteProduct(product.id);
      if (editing?.id === product.id) setOpen(false);
      toast(result.message);
      if (products.length === 1 && page > 1) setPage(page - 1);
      setVersion((current) => current + 1);
    } catch (caught) {
      toast(errorText(caught, "The product could not be deleted."));
    }
  }

  const totalPages = pagination?.totalPages ?? 0;
  const activeFilters = [
    status !== "all" ? status : "",
    stock !== "all" ? stock : "",
    brand,
    category,
    sort !== "newest" ? sort : "",
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
            placeholder="Search products"
            maxLength={100}
            aria-label="Search products"
            className={`${controlClass} pl-11`}
          />
        </label>
        {pagination ? <p className="hidden shrink-0 text-sm text-ink/55 sm:block">{pagination.total} products</p> : null}
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-12 shrink-0 cursor-pointer items-center rounded-full bg-wine px-5 text-sm text-white transition hover:bg-wine-deep"
        >
          Add product
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
            label="Stock"
            value={stock}
            onChange={(value) => {
              setStock(value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All" },
              { value: "in", label: "In stock" },
              { value: "out", label: "Out of stock" },
            ]}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <FilterSelect
            label="Brand"
            value={brand}
            onChange={(value) => {
              setBrand(value);
              setPage(1);
            }}
            options={[{ value: "", label: "All brands" }, ...brands.map((item) => ({ value: item.id, label: item.name }))]}
          />
          <FilterSelect
            label="Category"
            value={category}
            onChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
            options={[{ value: "", label: "All categories" }, ...categories.map((item) => ({ value: item.id, label: item.name }))]}
          />
          <FilterSelect
            label="Sort"
            value={sort}
            onChange={(value) => {
              setSort(value as ProductSort);
              setPage(1);
            }}
            options={[
              { value: "newest", label: "Newest" },
              { value: "price_asc", label: "Price: low to high" },
              { value: "price_desc", label: "Price: high to low" },
              { value: "name", label: "Name" },
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
      {loading ? <p className="mt-6 text-sm text-ink/60">Loading products…</p> : null}
      {!loading && !listError && products.length === 0 ? (
        <div className="mt-6 rounded-[1.75rem] border border-dashed border-ink/15 bg-paper px-6 py-12 text-center">
          <p className="font-display text-3xl">No products in this view.</p>
          <button type="button" onClick={openCreate} className="mt-5 text-sm text-wine">
            Add the first one
          </button>
        </div>
      ) : null}

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <li key={product.id} className="flex min-w-0 gap-3 rounded-2xl border border-ink/10 bg-paper p-2.5">
            <Link href={`/admin/products/${product.id}`} className="shrink-0">
              <ProductMedia src={product.images[0]} alt="" className="size-16 rounded-xl object-cover" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/admin/products/${product.id}`} className="block truncate font-display text-lg leading-tight tracking-tight hover:text-wine">
                    {product.name}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-ink/55">
                    {product.category?.name ?? "No category"} · {product.brand?.name ?? "No brand"}
                  </p>
                  <ProductRatingLine rating={product.rating} />
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                    product.isActive ? "bg-mint text-leaf" : "bg-blush text-wine"
                  }`}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-display text-base">{formatPrice(product.price)}</span>
                <span className={product.stock > 0 ? "text-leaf" : "text-wine"}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="rounded-full border border-ink/15 px-2.5 py-1 text-xs hover:border-wine hover:text-wine"
                >
                  Details
                </Link>
                <button
                  type="button"
                  onClick={() => openEdit(product)}
                  className="rounded-full border border-ink/15 px-2.5 py-1 text-xs hover:border-wine hover:text-wine"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onStatus(product)}
                  className="rounded-full border border-ink/15 px-2.5 py-1 text-xs hover:border-wine hover:text-wine"
                >
                  {product.isActive ? "Deactivate" : "Activate"}
                </button>
                <button type="button" onClick={() => onDelete(product)} className="rounded-full px-2.5 py-1 text-xs text-wine">
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
            className="h-11 rounded-full border border-ink/15 bg-paper px-4 text-sm disabled:opacity-40"
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
            className="h-11 rounded-full border border-ink/15 bg-paper px-4 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}

      {open ? <ProductFormDialog product={editing} onClose={() => setOpen(false)} onSaved={onSaved} /> : null}
      {dialog}
    </div>
  );
}
