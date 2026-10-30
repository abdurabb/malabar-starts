"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductActions } from "@/components/shop/product-actions";
import { StarRating } from "@/components/shop/star-rating";
import { formatPrice } from "@/lib/products";
import { routes } from "@/lib/navigation";
import type { CatalogProduct } from "@/types/product";

function ratingLabel(rating: number) {
  const rounded = Math.round(rating * 100) / 100;
  if (Number.isInteger(rounded)) return rounded.toFixed(1);
  return String(rounded);
}

export function ProductRatingLine({ rating }: { rating: number }) {
  if (!(rating > 0)) {
    return <p className="mt-1 text-[11px] text-ink/45 sm:text-xs">No reviews</p>;
  }
  return (
    <p className="mt-1 flex items-center gap-1.5">
      <StarRating rating={rating} size="sm" />
      <span className="text-[11px] text-ink/55 sm:text-xs">{ratingLabel(rating)}</span>
    </p>
  );
}

export function ProductMedia({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className={`bg-[#f8ebe3] ${className ?? ""}`} aria-hidden="true" />;
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

export function ProductCard({ product, wishlistItemId }: { product: CatalogProduct; wishlistItemId?: string }) {
  return (
    <article className="flex h-full min-w-0 flex-col rounded-xl border border-ink/10 bg-paper p-2 sm:rounded-2xl sm:p-3">
      <Link href={`${routes.products}/${product.id}`} className="block min-w-0">
        <ProductMedia
          src={product.images[0]}
          alt=""
          className="aspect-square w-full rounded-lg object-cover sm:aspect-[5/4] sm:rounded-xl"
        />
        <p className="mt-2 truncate text-[0.6rem] uppercase tracking-[0.12em] text-wine sm:mt-3 sm:text-[0.65rem]">
          {product.category?.name ?? "Uncategorized"}
        </p>
        <h2 className="mt-1 line-clamp-2 font-display text-sm leading-tight tracking-tight hover:text-wine sm:text-xl">
          {product.name}
        </h2>
        <ProductRatingLine rating={product.rating} />
      </Link>
      <p className="mt-0.5 truncate text-[11px] text-ink/55 sm:text-xs">{product.brand?.name ?? "No brand"}</p>
      {product.description ? (
        <p className="mt-1.5 hidden text-xs leading-5 text-ink/65 sm:line-clamp-2 sm:block">{product.description}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 sm:mt-2.5">
        <p className="flex min-w-0 flex-wrap items-baseline gap-1">
          <span className="font-display text-sm leading-none sm:text-lg">{formatPrice(product.price)}</span>
          {product.mrp != null && product.mrp > product.price ? (
            <span className="text-[10px] text-ink/40 line-through sm:text-xs">{formatPrice(product.mrp)}</span>
          ) : null}
        </p>
        <span
          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-[0.65rem] ${
            product.stock > 0 ? "bg-mint text-leaf" : "bg-blush text-wine"
          }`}
        >
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </span>
      </div>
      <p className="mt-1 truncate text-[11px] text-ink/50 sm:text-xs">{product.unit ?? "Unit on request"}</p>
      <div className="mt-auto pt-2 sm:pt-3">
        <ProductActions product={product} wishlistItemId={wishlistItemId} compact />
      </div>
    </article>
  );
}
