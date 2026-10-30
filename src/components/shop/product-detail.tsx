"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductActions } from "@/components/shop/product-actions";
import { ProductMedia } from "@/components/shop/product-card";
import { ProductReviews } from "@/components/shop/product-reviews";
import { ApiError, errorText } from "@/lib/apiError";
import { formatPrice, getProduct } from "@/lib/products";
import { routes } from "@/lib/navigation";
import type { CatalogProduct } from "@/types/product";

export function ProductDetail({ id }: { id: string }) {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [image, setImage] = useState(0);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    setReady(false);
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
  }, [id]);

  if (!ready) {
    return <p className="px-5 py-16 text-sm text-ink/60">Opening this product…</p>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-display text-4xl">{error || "This product is not on the counter."}</h1>
        <Link href={routes.products} className="mt-6 inline-flex text-wine">
          Back to products
        </Link>
      </div>
    );
  }

  const current = product.images[image] ?? product.images[0];

  return (
    <>
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <ProductMedia
          src={current}
          alt={product.name}
          className="aspect-[4/3] w-full rounded-[2rem] object-cover"
        />
        {product.images.length > 1 ? (
          <div className="mt-3 flex gap-2">
            {product.images.map((src, index) => (
              <button key={src} type="button" onClick={() => setImage(index)} className="w-20">
                <ProductMedia
                  src={src}
                  alt=""
                  className={`aspect-square w-full rounded-xl object-cover ${index === image ? "ring-2 ring-wine" : ""}`}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="rounded-[2rem] border border-ink/10 bg-paper p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-wine">{product.category?.name ?? "Uncategorized"}</p>
        <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl">{product.name}</h1>
        <p className="mt-3 text-sm text-ink/55">{product.brand?.name ?? "No brand"}</p>
        {product.description ? <p className="mt-6 max-w-md text-lg leading-8 text-ink/75">{product.description}</p> : null}
        <p className="mt-6 flex flex-wrap items-baseline gap-3">
          <span className="font-display text-4xl">{formatPrice(product.price)}</span>
          {product.mrp != null && product.mrp > product.price ? (
            <span className="text-ink/45 line-through">{formatPrice(product.mrp)}</span>
          ) : null}
        </p>
        <dl className="mt-6 grid gap-3 text-sm">
          <div>
            <dt className="text-ink/50">Unit</dt>
            <dd>{product.unit ?? "On request"}</dd>
          </div>
          <div>
            <dt className="text-ink/50">Stock</dt>
            <dd>{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</dd>
          </div>
          {product.sku ? (
            <div>
              <dt className="text-ink/50">SKU</dt>
              <dd>{product.sku}</dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-8">
          <ProductActions product={product} />
        </div>
        <Link href={routes.products} className="mt-6 inline-flex text-sm text-wine">
          All products
        </Link>
      </div>
    </div>
    <ProductReviews productId={product.id} />
    </>
  );
}
