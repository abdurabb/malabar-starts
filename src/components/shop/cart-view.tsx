"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useServerSeed } from "@/hooks/useServerSeed";
import { PageFrame } from "@/components/shop/page-frame";
import { ProductMedia } from "@/components/shop/product-card";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { errorText } from "@/lib/apiError";
import { applyCartCoupon, clearCart, formatCouponValue, getCart, removeCartCoupon, removeCartItem, updateCartItem } from "@/lib/carts";
import { routes } from "@/lib/navigation";
import { formatPrice } from "@/lib/products";
import { toast } from "@/lib/toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { noteCart, setCartCount } from "@/redux/slices/shopSlice";
import type { CartItem, CartRecord } from "@/types/cart";
import type { Pagination } from "@/types/product";

const limit = 8;
const couponPattern = /^[A-Za-z0-9-]{4,20}$/;

function increaseLimit(item: CartItem) {
  if (!item.product.isActive) return "This product is unavailable.";
  if (item.quantity >= 999) return "Quantity cannot pass 999.";
  if (item.quantity >= item.product.stock) return "Quantity cannot pass stock.";
  return "";
}

export function CartView({
  initialCart = null,
  initialPagination = null,
  initialError = "",
}: {
  initialCart?: CartRecord | null;
  initialPagination?: Pagination | null;
  initialError?: string;
}) {
  const dispatch = useAppDispatch();
  const revision = useAppSelector((state) => state.shop.cartRevision);
  const { confirm, dialog } = useConfirm();
  const seeded = !initialError && initialCart !== null;
  const consumeSeed = useServerSeed(seeded);
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState<CartRecord | null>(seeded ? initialCart : null);
  const [pagination, setPagination] = useState<Pagination | null>(seeded ? initialPagination : null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!seeded);
  const [pending, setPending] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    if (consumeSeed()) return;
    let active = true;
    setLoading(true);
    getCart({ page, limit })
      .then((result) => {
        if (!active) return;
        setCart(result.cart);
        setPagination(result.pagination);
        setError("");
        dispatch(setCartCount({ count: result.cart.itemCount, revision }));
        if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
          setPage(result.pagination.totalPages);
        }
      })
      .catch((caught) => {
        if (!active) return;
        setCart(null);
        setPagination(null);
        setError(errorText(caught, "The cart could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, revision, dispatch]);

  const items = cart?.items ?? [];
  const totalPages = pagination?.totalPages ?? 0;
  const busy = pending !== null;

  async function onQuantity(item: CartItem, value: "inc" | "dec") {
    if (busy) return;
    if (value === "inc" && increaseLimit(item)) return;
    setPending(item.id);
    try {
      const result = await updateCartItem(item.id, value);
      dispatch(noteCart(result.cart.itemCount));
      toast(result.message);
    } catch (caught) {
      toast(errorText(caught, "The quantity could not be changed."));
    } finally {
      setPending(null);
    }
  }

  async function onRemove(item: CartItem) {
    if (busy) return;
    setPending(item.id);
    try {
      const result = await removeCartItem(item.id);
      dispatch(noteCart(result.cart.itemCount));
      toast(result.message);
    } catch (caught) {
      toast(errorText(caught, "This item could not be removed."));
    } finally {
      setPending(null);
    }
  }

  async function onClear() {
    if (busy || !cart || cart.itemCount === 0) return;
    const ok = await confirm({
      title: "Clear this cart?",
      message: "Every item will be removed.",
      confirmLabel: "Clear cart",
      tone: "danger",
    });
    if (!ok) return;
    setPending("clear");
    try {
      const result = await clearCart();
      dispatch(noteCart(result.cart.itemCount));
      toast(result.message);
    } catch (caught) {
      toast(errorText(caught, "The cart could not be cleared."));
    } finally {
      setPending(null);
    }
  }

  async function onCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const code = couponCode.trim();
    if (!couponPattern.test(code)) {
      setCouponError("Use 4–20 letters, numbers, or hyphens.");
      return;
    }
    setCouponError("");
    setPending("coupon");
    try {
      const result = await applyCartCoupon(code);
      dispatch(noteCart(result.cart.itemCount));
      setCouponCode("");
      toast(result.message);
    } catch (caught) {
      setCouponError(errorText(caught, "This coupon could not be applied."));
    } finally {
      setPending(null);
    }
  }

  async function onRemoveCoupon() {
    if (busy) return;
    setPending("coupon");
    setCouponError("");
    try {
      const result = await removeCartCoupon();
      dispatch(noteCart(result.cart.itemCount));
      toast(result.message);
    } catch (caught) {
      toast(errorText(caught, "The coupon could not be removed."));
    } finally {
      setPending(null);
    }
  }

  return (
    <PageFrame eyebrow="Cart" title="Cart" lede="Review the cuts in this cart, then place an order.">
      {cart ? <p className="mb-5 text-sm text-ink/55">{cart.itemCount} in the cart</p> : null}
      {error ? <p className="mb-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {loading && !cart ? <p className="text-sm text-ink/60">Loading the cart…</p> : null}
      {!loading && !error && cart && cart.itemCount === 0 ? (
        <div className="rounded-[1.5rem] border border-ink/10 bg-paper p-8">
          <p className="text-base leading-7 text-ink/70">The cart is empty.</p>
          <Link href={routes.products} className="mt-4 inline-flex text-wine">
            Browse products
          </Link>
        </div>
      ) : null}
      {cart && cart.itemCount > 0 ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
          <div>
            {items.length > 0 ? (
              <ul className="divide-y divide-ink/10 border-y border-ink/10">
                {items.map((item) => {
                  const blocked = increaseLimit(item);
                  const linePending = pending === item.id;
                  return (
                    <li key={item.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                      <ProductMedia
                        src={item.product.images[0]}
                        alt=""
                        className="size-24 shrink-0 rounded-2xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-[0.16em] text-wine">
                          {item.product.category?.name ?? "Uncategorized"}
                        </p>
                        <Link href={`${routes.products}/${item.product.id}`} className="mt-1 block text-base font-medium leading-snug hover:text-wine">
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-sm text-ink/55">
                          {item.product.brand?.name ?? "No brand"}
                          {" · "}
                          {item.product.unit ?? "Unit on request"}
                        </p>
                        <p className="mt-2 text-sm">
                          {formatPrice(item.unitPrice)} each
                          {item.discount > 0 ? <span className="text-ink/55"> · Discount {formatPrice(item.discount)}</span> : null}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onQuantity(item, "dec")}
                            aria-label={item.quantity === 1 ? `Remove ${item.product.name}` : `Decrease ${item.product.name}`}
                            className="size-9 rounded-full border border-ink/15 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="min-w-6 text-center">{linePending ? "…" : item.quantity}</span>
                          <button
                            type="button"
                            disabled={busy || Boolean(blocked)}
                            title={blocked || undefined}
                            onClick={() => onQuantity(item, "inc")}
                            aria-label={`Increase ${item.product.name}`}
                            className="size-9 rounded-full border border-ink/15 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm">{formatPrice(item.payableTotal)}</p>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onRemove(item)}
                          className="text-sm text-wine disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : loading ? (
              <p className="text-sm text-ink/60">Loading the cart…</p>
            ) : null}
            {totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={page <= 1 || busy}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-full border border-ink/15 px-4 py-2 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <p className="text-sm text-ink/60">
                  Page {pagination?.page} of {totalPages}
                </p>
                <button
                  type="button"
                  disabled={page >= totalPages || busy}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-full border border-ink/15 px-4 py-2 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
          <aside className="h-fit rounded-[1.5rem] border border-ink/10 bg-paper p-6">
            {cart.coupon ? (
              <div className="flex items-start justify-between gap-3 rounded-2xl bg-ivory px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-wine">Coupon</p>
                  <p className="mt-1 text-sm">
                    {cart.coupon.code} · {formatCouponValue(cart.coupon)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={onRemoveCoupon}
                  className="text-sm text-wine disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={onCoupon}>
                <label className="block text-sm text-ink/70">
                  Coupon
                  <input
                    value={couponCode}
                    onChange={(event) => {
                      setCouponCode(event.target.value);
                      setCouponError("");
                    }}
                    placeholder="Code"
                    maxLength={20}
                    autoCapitalize="characters"
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-ivory px-4 py-3 uppercase"
                  />
                </label>
                {couponError ? <p className="mt-2 text-sm text-wine">{couponError}</p> : null}
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-3 inline-flex rounded-full border border-ink/15 px-4 py-2 text-sm hover:border-wine hover:text-wine disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Apply coupon
                </button>
              </form>
            )}
            <dl className="mt-5 grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink/55">Subtotal</dt>
                <dd>{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink/55">Discount</dt>
                <dd>{formatPrice(cart.discount)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-ink/10 pt-2 text-base font-medium">
                <dt>Total</dt>
                <dd>{formatPrice(cart.total)}</dd>
              </div>
            </dl>
            <Link
              href={routes.checkout}
              aria-disabled={busy}
              className={`mt-5 inline-flex w-full items-center justify-center rounded-full bg-wine px-5 py-3.5 text-sm text-white hover:bg-wine-deep ${
                busy ? "pointer-events-none opacity-60" : ""
              }`}
            >
              Proceed to order
            </Link>
            <button
              type="button"
              disabled={busy}
              onClick={onClear}
              className="mt-3 w-full text-sm text-wine disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear cart
            </button>
          </aside>
        </div>
      ) : null}
      {dialog}
    </PageFrame>
  );
}
