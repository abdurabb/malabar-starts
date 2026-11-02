"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useServerSeed } from "@/hooks/useServerSeed";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { ReviewsAdmin } from "@/components/admin/reviews-admin";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ProductMedia } from "@/components/shop/product-card";
import { ApiError, errorText } from "@/lib/apiError";
import { deleteProduct, formatPrice, getProduct, setProductStatus } from "@/lib/products";
import { toast } from "@/lib/toast";
import type { CatalogProduct } from "@/types/product";

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function ProductAdminDetail({
  id,
  initialProduct = null,
  initialError = "",
}: {
  id: string;
  initialProduct?: CatalogProduct | null;
  initialError?: string;
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const seeded = initialProduct !== null && !initialError;
  const consumeSeed = useServerSeed(seeded);
  const [product, setProduct] = useState<CatalogProduct | null>(seeded ? initialProduct : null);
  const [image, setImage] = useState(0);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(seeded);
  const [editing, setEditing] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (consumeSeed()) return;
    setProduct(null);
    setReady(false);
    setImage(0);
  }, [id]);

  useEffect(() => {
    if (consumeSeed()) return;
    let active = true;
    setError("");
    getProduct(id)
      .then((item) => {
        if (!active) return;
        setProduct(item);
        setImage(0);
      })
      .catch((caught) => {
        if (!active) return;
        setProduct(null);
        setError(caught instanceof ApiError && caught.status === 404 ? "Product not found" : errorText(caught, "This product could not be opened."));
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [id, version]);

  async function onStatus() {
    if (!product) return;
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
      setProduct(result.product);
      toast(result.message ?? (result.product.isActive ? "Product activated" : "Product deactivated"));
    } catch (caught) {
      toast(errorText(caught, "The status could not be changed."));
    }
  }

  async function onDelete() {
    if (!product) return;
    const ok = await confirm({
      title: "Delete this product?",
      message: `${product.name} will be removed from the catalog. This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const result = await deleteProduct(product.id);
      toast(result.message);
      router.replace("/admin/products");
    } catch (caught) {
      toast(errorText(caught, "The product could not be deleted."));
    }
  }

  if (!ready) {
    return (
      <>
        <p className="text-sm text-ink/60">Opening this product…</p>
        {dialog}
      </>
    );
  }

  if (!product) {
    return (
      <div>
        <h2 className="page-title">{error || "Product not found"}</h2>
        <Link href="/admin/products" className="mt-4 inline-flex text-sm text-wine">
          Back to products
        </Link>
        {dialog}
      </div>
    );
  }

  const current = product.images[image] ?? product.images[0];
  const facts = [
    ["Brand", product.brand?.name ?? "No brand"],
    ["Category", product.category?.name ?? "No category"],
    ["SKU", product.sku ?? "—"],
    ["Unit", product.unit ?? "—"],
    ["Stock", product.stock > 0 ? `${product.stock} in stock` : "Out of stock"],
    ["Added", formatWhen(product.createdAt)],
    ["Updated", formatWhen(product.updatedAt)],
  ];

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-wine">
        Back to products
      </Link>
      <div className="mt-4 grid items-start gap-5 lg:grid-cols-[minmax(0,16rem)_1fr]">
        <div>
          <ProductMedia src={current} alt={product.name} className="aspect-square w-full rounded-2xl object-cover" />
          {product.images.length > 1 ? (
            <div className="mt-2 flex gap-2">
              {product.images.map((src, index) => (
                <button key={src} type="button" onClick={() => setImage(index)} className="w-14">
                  <ProductMedia
                    src={src}
                    alt=""
                    className={`aspect-square w-full rounded-lg object-cover ${index === image ? "ring-2 ring-wine" : ""}`}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="rounded-2xl border border-ink/10 bg-paper p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-wine">{product.category?.name ?? "Uncategorized"}</p>
              <h2 className="page-title mt-1">{product.name}</h2>
              <p className="mt-1 text-sm text-ink/55">{product.brand?.name ?? "No brand"}</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
                product.isActive ? "bg-mint text-leaf" : "bg-blush text-wine"
              }`}
            >
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          {product.description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/75">{product.description}</p> : null}
          <p className="mt-4 flex flex-wrap items-baseline gap-2">
            <span className="font-display text-2xl">{formatPrice(product.price)}</span>
            {product.mrp != null && product.mrp > product.price ? (
              <span className="text-sm text-ink/40 line-through">{formatPrice(product.mrp)}</span>
            ) : null}
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-ink/45">{label}</dt>
                <dd className="mt-1 text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-full bg-wine px-4 py-2 text-sm text-white hover:bg-wine-deep"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onStatus}
              className="rounded-full border border-ink/15 px-4 py-2 text-sm hover:border-wine hover:text-wine"
            >
              {product.isActive ? "Deactivate" : "Activate"}
            </button>
            <button type="button" onClick={onDelete} className="rounded-full px-4 py-2 text-sm text-wine">
              Delete
            </button>
          </div>
        </div>
      </div>
      <ReviewsAdmin productId={product.id} embedded />
      {editing ? (
        <ProductFormDialog
          product={product}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            setVersion((currentVersion) => currentVersion + 1);
          }}
        />
      ) : null}
      {dialog}
    </div>
  );
}
