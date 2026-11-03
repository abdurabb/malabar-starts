"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { errorText } from "@/lib/apiError";
import { addCartItem } from "@/lib/carts";
import { routes } from "@/lib/navigation";
import { toast } from "@/lib/toast";
import { addWishlistItem, removeWishlistItem } from "@/lib/wishlists";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addWishlist, noteCart, removeWishlist } from "@/redux/slices/shopSlice";
import type { CatalogProduct } from "@/types/product";

function RoundLoader({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className ?? "size-4"}`} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="2.4" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function ProductActions({
  product,
  compact = false,
  wishlistItemId,
}: {
  product: CatalogProduct;
  compact?: boolean;
  wishlistItemId?: string;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, session } = useAuth();
  const entry = useAppSelector((state) => state.shop.wishlist.find((item) => item.productId === product.id));
  const itemId = entry?.id ?? wishlistItemId;
  const available = product.isActive && product.stock > 0;
  const wished = Boolean(itemId);
  const [saving, setSaving] = useState(false);
  const [cartSaving, setCartSaving] = useState(false);

  function requireCustomer() {
    if (status !== "authenticated" || !session) {
      router.push(`${routes.login}?next=${encodeURIComponent(`${routes.products}/${product.id}`)}`);
      return false;
    }
    if (session.user.role !== "user") {
      toast("Use a customer account for the cart and wishlist.");
      return false;
    }
    return true;
  }

  async function onCart() {
    if (!requireCustomer() || cartSaving || !available) return;
    setCartSaving(true);
    try {
      const result = await addCartItem(product.id);
      dispatch(noteCart(result.cart.itemCount));
      toast(result.message);
    } catch (caught) {
      toast(errorText(caught, "This product could not be added to the cart."));
    } finally {
      setCartSaving(false);
    }
  }

  async function onWishlist() {
    if (!requireCustomer() || saving) return;
    setSaving(true);
    try {
      if (itemId) {
        const result = await removeWishlistItem(itemId);
        dispatch(removeWishlist(product.id));
        toast(result.message);
      } else {
        const result = await addWishlistItem(product.id);
        dispatch(addWishlist({ id: result.item.id, productId: result.item.product.id }));
        toast(result.message);
      }
    } catch (caught) {
      toast(
        errorText(
          caught,
          itemId
            ? "This product could not be removed from the wishlist."
            : "This product could not be added to the wishlist.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={compact ? "flex items-center gap-1.5" : "flex flex-wrap gap-2"}>
      <button
        type="button"
        disabled={!available || cartSaving}
        aria-busy={cartSaving}
        onClick={onCart}
        className={`relative rounded-full bg-wine text-white hover:bg-wine-deep disabled:cursor-not-allowed ${
          cartSaving ? "" : "disabled:opacity-50"
        } ${compact ? "h-8 min-w-0 flex-1 truncate px-2 text-[11px]" : "px-4 py-2.5 text-sm"}`}
      >
        <span className={cartSaving ? "invisible" : undefined}>
          {!product.isActive ? "Unavailable" : product.stock > 0 ? "Add to cart" : "Out of stock"}
        </span>
        {cartSaving ? (
          <span className="absolute inset-0 grid place-items-center">
            <RoundLoader className={compact ? "size-3.5" : "size-4"} />
          </span>
        ) : null}
      </button>
      <button
        type="button"
        aria-label={
          saving
            ? wished
              ? "Updating wishlist"
              : "Saving to wishlist"
            : wished
              ? "Remove from wishlist"
              : "Save to wishlist"
        }
        aria-busy={saving}
        disabled={saving}
        onClick={onWishlist}
        className={`relative rounded-full border text-ink hover:border-wine hover:text-wine ${
          compact ? "grid size-8 shrink-0 place-items-center" : "px-4 py-2.5 text-sm"
        } ${wished ? "border-wine text-wine" : "border-ink/15"}`}
      >
        {compact ? (
          saving ? (
            <RoundLoader className="size-3.5" />
          ) : (
            <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
              <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
            </svg>
          )
        ) : (
          <>
            <span className={saving ? "invisible" : undefined}>{wished ? "Wishlisted" : "Wishlist"}</span>
            {saving ? (
              <span className="absolute inset-0 grid place-items-center">
                <RoundLoader className="size-4" />
              </span>
            ) : null}
          </>
        )}
      </button>
    </div>
  );
}
