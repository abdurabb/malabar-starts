"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { FormError } from "@/components/auth/fields";
import { FilterSelect } from "@/components/shop/filter-controls";
import { errorText } from "@/lib/apiError";
import { createProduct, listBrandOptions, listCategoryOptions, updateProduct } from "@/lib/products";
import { toast } from "@/lib/toast";
import type { BrandOption, CatalogProduct, CategoryOption } from "@/types/product";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  mrp: "",
  stock: "",
  images: "",
  brand: "",
  category: "",
  sku: "",
  unit: "",
  isActive: true,
};

type FormState = typeof emptyForm;

const inputClass =
  "mt-2 w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-wine";

function imagesFromText(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateForm(form: FormState) {
  const name = form.name.trim();
  if (name.length < 2) return name ? "Name must be at least 2 characters" : "Name is required";
  if (name.length > 160) return "Name cannot exceed 160 characters";
  if (!/[A-Za-z0-9]/.test(name)) return "Name must contain letters or numbers";
  if (form.description.trim().length > 2000) return "Description cannot exceed 2000 characters";
  const price = Number(form.price);
  if (!(price > 0) || price > 1000000) return "Price must be greater than 0";
  const mrpText = form.mrp.trim();
  if (mrpText) {
    const mrp = Number(mrpText);
    if (!(mrp > 0) || mrp > 1000000) return "MRP must be greater than 0";
    if (!(mrp > price)) return "MRP must be greater than the price";
  }
  if (!/^\d+$/.test(form.stock.trim())) return "Stock must be a whole number";
  const stock = Number(form.stock);
  if (stock > 1000000) return "Stock cannot exceed 1000000";
  const images = imagesFromText(form.images);
  if (images.length > 8) return "A product can have at most 8 images";
  if (new Set(images).size !== images.length) return "Images must be unique";
  if (images.some((url) => !/^https?:\/\//.test(url) || url.length > 2000)) {
    return "Each image must be a valid http or https URL";
  }
  if (!form.brand) return "Brand is required";
  if (!form.category) return "Category is required";
  const sku = form.sku.trim();
  if (sku && !/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(sku)) {
    return "SKU can contain only letters, numbers, and hyphens";
  }
  if (sku && (sku.length < 2 || sku.length > 40)) return "SKU must be 2–40 characters";
  if (form.unit.trim().length > 40) return "Unit cannot exceed 40 characters";
  return "";
}

function toForm(product: CatalogProduct): FormState {
  return {
    name: product.name,
    description: product.description ?? "",
    price: String(product.price),
    mrp: product.mrp == null ? "" : String(product.mrp),
    stock: String(product.stock),
    images: product.images.join("\n"),
    brand: product.brand?.id ?? "",
    category: product.category?.id ?? "",
    sku: product.sku ?? "",
    unit: product.unit ?? "",
    isActive: product.isActive,
  };
}

export function ProductFormDialog({
  product,
  onClose,
  onSaved,
}: {
  product: CatalogProduct | null;
  onClose: () => void;
  onSaved: (created: boolean) => void;
}) {
  const [form, setForm] = useState<FormState>(() => (product ? toForm(product) : emptyForm));
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    listBrandOptions().then(setBrands).catch(() => setBrands([]));
    listCategoryOptions().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onCloseRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [pending]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function close() {
    if (pending) return;
    onClose();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = validateForm(form);
    if (message) {
      setError(message);
      return;
    }
    const images = imagesFromText(form.images);
    const description = form.description.trim();
    const sku = form.sku.trim();
    const unit = form.unit.trim();
    const mrp = form.mrp.trim();
    const shared = {
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      brand: form.brand,
      category: form.category,
      images,
    };
    setPending(true);
    setError("");
    try {
      if (product) {
        const result = await updateProduct(product.id, {
          ...shared,
          description: description || null,
          mrp: mrp ? Number(mrp) : null,
          sku: sku ? sku.toUpperCase() : null,
          unit: unit || null,
        });
        toast(result.message ?? "Product updated");
        onSaved(false);
      } else {
        const result = await createProduct({
          ...shared,
          ...(description ? { description } : {}),
          ...(mrp ? { mrp: Number(mrp) } : {}),
          ...(images.length ? { images } : { images: undefined }),
          ...(sku ? { sku: sku.toUpperCase() } : {}),
          ...(unit ? { unit } : {}),
          isActive: form.isActive,
        });
        toast(result.message ?? "Product created");
        onSaved(true);
      }
    } catch (caught) {
      setError(errorText(caught, "The product could not be saved."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button type="button" aria-label="Close product form" className="absolute inset-0 bg-ink/40" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] bg-paper p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-wine">{product ? "Update" : "New product"}</p>
            <h2 id="product-form-title" className="page-title mt-1">
              {product ? product.name : "Add a product"}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex size-11 items-center justify-center rounded-full border border-ink/15"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-ink/70 sm:col-span-2">
              Name
              <input value={form.name} onChange={(event) => setField("name", event.target.value)} className={inputClass} autoFocus />
            </label>
            <label className="block text-sm text-ink/70 sm:col-span-2">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                rows={3}
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink/70">
              Price
              <input value={form.price} onChange={(event) => setField("price", event.target.value)} inputMode="decimal" className={inputClass} />
            </label>
            <label className="block text-sm text-ink/70">
              MRP
              <input
                value={form.mrp}
                onChange={(event) => setField("mrp", event.target.value)}
                inputMode="decimal"
                placeholder="Optional, above the price"
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink/70">
              Stock
              <input value={form.stock} onChange={(event) => setField("stock", event.target.value)} inputMode="numeric" className={inputClass} />
            </label>
            <label className="block text-sm text-ink/70">
              Unit
              <input value={form.unit} onChange={(event) => setField("unit", event.target.value)} placeholder="5 kg" className={inputClass} />
            </label>
            <FilterSelect
              label="Brand"
              value={form.brand}
              onChange={(value) => setField("brand", value)}
              options={[{ value: "", label: "Choose a brand" }, ...brands.map((item) => ({ value: item.id, label: item.name }))]}
            />
            <FilterSelect
              label="Category"
              value={form.category}
              onChange={(value) => setField("category", value)}
              options={[{ value: "", label: "Choose a category" }, ...categories.map((item) => ({ value: item.id, label: item.name }))]}
            />
            <label className="block text-sm text-ink/70">
              SKU
              <input value={form.sku} onChange={(event) => setField("sku", event.target.value)} placeholder="RICE-5KG" className={inputClass} />
            </label>
            {!product ? (
              <div className="flex items-end">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isActive}
                  onClick={() => setField("isActive", !form.isActive)}
                  className="flex h-12 w-full items-center justify-between rounded-full bg-[#f3e6d4] px-4 text-sm"
                >
                  <span>{form.isActive ? "Listed as active" : "Saved as inactive"}</span>
                  <span className={`relative h-6 w-11 rounded-full ${form.isActive ? "bg-wine" : "bg-ink/20"}`}>
                    <span className={`absolute top-0.5 size-5 rounded-full bg-white transition ${form.isActive ? "left-5" : "left-0.5"}`} />
                  </span>
                </button>
              </div>
            ) : (
              <p className="flex items-end pb-3 text-sm text-ink/60">
                {form.isActive ? "This product is active." : "This product is inactive."} Change status outside this form.
              </p>
            )}
            <label className="block text-sm text-ink/70 sm:col-span-2">
              Images
              <textarea
                value={form.images}
                onChange={(event) => setField("images", event.target.value)}
                rows={3}
                placeholder="One http or https URL per line"
                className={inputClass}
              />
            </label>
          </div>
          <div className="mt-4">
            <FormError message={error} />
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={close} className="h-12 rounded-full border border-ink/15 px-5 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={pending} className="h-12 rounded-full bg-wine px-5 text-sm text-white disabled:opacity-60">
              {pending ? "Saving…" : product ? "Update product" : "Save product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
