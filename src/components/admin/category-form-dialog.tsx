"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { FormError } from "@/components/auth/fields";
import { errorText } from "@/lib/apiError";
import { createCategory, updateCategory } from "@/lib/categories";
import { toast } from "@/lib/toast";
import type { Category } from "@/types/category";

const inputClass =
  "mt-2 w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-wine";

type FormState = {
  name: string;
  description: string;
  image: string;
  parent: string;
  isActive: boolean;
  sortOrder: string;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  image: "",
  parent: "",
  isActive: true,
  sortOrder: "0",
};

function toForm(category: Category): FormState {
  return {
    name: category.name,
    description: category.description ?? "",
    image: category.image ?? "",
    parent: category.parent?.id ?? "",
    isActive: category.isActive,
    sortOrder: String(category.sortOrder),
  };
}

function validateForm(form: FormState) {
  const name = form.name.trim();
  if (name.length < 2) return name ? "Name must be at least 2 characters" : "Name is required";
  if (name.length > 80) return "Name cannot exceed 80 characters";
  if (!/[\p{L}\p{N}]/u.test(name)) return "Name must contain a letter or number";
  if (form.description.trim().length > 1000) return "Description cannot exceed 1000 characters";
  const image = form.image.trim();
  if (image && (!/^https?:\/\//.test(image) || image.length > 2000)) {
    return "Image must be an http or https URL";
  }
  // const order = form.sortOrder.trim();
  // if (!/^\d+$/.test(order)) return "Sort order must be a whole number";
  // const sortOrder = Number(order);
  // if (sortOrder > 9999) return "Sort order cannot exceed 9999";
  return "";
}

export function CategoryFormDialog({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: (created: boolean) => void;
}) {
  const [form, setForm] = useState<FormState>(() => (category ? toForm(category) : emptyForm));
  // const [parents, setParents] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // useEffect(() => {
  //   listCategories({ limit: 100, status: "all" })
  //     .then((result) => setParents(result.categories))
  //     .catch(() => setParents([]));
  // }, []);

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
    const name = form.name.trim();
    const description = form.description.trim();
    const image = form.image.trim();
    // const sortOrder = Number(form.sortOrder.trim());
    // const parent = form.parent || null;
    setPending(true);
    setError("");
    try {
      if (category) {
        const result = await updateCategory(category.id, {
          name,
          description: description || null,
          image: image || null,
          // parent,
          isActive: form.isActive,
          // sortOrder,
        });
        toast(result.message ?? "Category updated");
        onSaved(false);
      } else {
        const result = await createCategory({
          name,
          ...(description ? { description } : {}),
          ...(image ? { image } : {}),
          // parent,
          isActive: form.isActive,
          // sortOrder,
        });
        toast(result.message ?? "Category created");
        onSaved(true);
      }
    } catch (caught) {
      setError(errorText(caught, "The category could not be saved."));
    } finally {
      setPending(false);
    }
  }

  // const parentOptions = [
  //   { value: "", label: "Root category" },
  //   ...parents
  //     .filter((item) => item.id !== category?.id)
  //     .map((item) => ({ value: item.id, label: item.parent ? `${item.parent.name} / ${item.name}` : item.name })),
  // ];
  // if (category?.parent && !parentOptions.some((option) => option.value === category.parent?.id)) {
  //   parentOptions.push({ value: category.parent.id, label: category.parent.name });
  // }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button type="button" aria-label="Close category form" className="absolute inset-0 cursor-pointer bg-ink/40" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] bg-paper p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-wine">{category ? "Update" : "New category"}</p>
            <h2 id="category-form-title" className="page-title mt-1">
              {category ? category.name : "Add a category"}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-ink/15"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-ink/70 sm:col-span-2">
              Name
              <input value={form.name} onChange={(event) => setField("name", event.target.value)} maxLength={80} className={inputClass} autoFocus />
            </label>
            <label className="block text-sm text-ink/70 sm:col-span-2">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                maxLength={1000}
                rows={3}
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink/70 sm:col-span-2">
              Image URL
              <input
                value={form.image}
                onChange={(event) => setField("image", event.target.value)}
                placeholder="https://"
                className={inputClass}
              />
            </label>
            {/* Parent and sort order are hidden until subcategories are in use.
            <FilterSelect label="Parent" value={form.parent} onChange={(value) => setField("parent", value)} options={parentOptions} />
            <label className="block text-sm text-ink/70">
              Sort order
              <input
                value={form.sortOrder}
                onChange={(event) => setField("sortOrder", event.target.value)}
                inputMode="numeric"
                className={inputClass}
              />
            </label>
            */}
            <div className="flex items-end sm:col-span-2">
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => setField("isActive", !form.isActive)}
                className="flex h-12 w-full cursor-pointer items-center justify-between rounded-full bg-[#f3e6d4] px-4 text-sm"
              >
                <span>{form.isActive ? "Listed as active" : "Saved as inactive"}</span>
                <span className={`relative h-6 w-11 rounded-full ${form.isActive ? "bg-wine" : "bg-ink/20"}`}>
                  <span className={`absolute top-0.5 size-5 rounded-full bg-white transition ${form.isActive ? "left-5" : "left-0.5"}`} />
                </span>
              </button>
            </div>
          </div>
          <div className="mt-4">
            <FormError message={error} />
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={close} className="h-12 cursor-pointer rounded-full border border-ink/15 px-5 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={pending} className="h-12 cursor-pointer rounded-full bg-wine px-5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60">
              {pending ? "Saving…" : category ? "Update category" : "Save category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
