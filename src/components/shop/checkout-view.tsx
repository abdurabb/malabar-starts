"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useServerSeed } from "@/hooks/useServerSeed";
import { FormError } from "@/components/auth/fields";
import { DeliveryPicker } from "@/components/shop/delivery-picker";
import { PageFrame } from "@/components/shop/page-frame";
import { ProductMedia } from "@/components/shop/product-card";
import { StatusBadge } from "@/components/shop/status-badge";
import { useAuth } from "@/hooks/useAuth";
import { emptyAddressForm, listAddresses } from "@/lib/addresses";
import { errorText } from "@/lib/apiError";
import { formatCouponValue, getCart } from "@/lib/carts";
import { routes } from "@/lib/navigation";
import { deliveryInput, isPaymentRedirect, noteError, placeOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { toast } from "@/lib/toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { noteCart } from "@/redux/slices/shopSlice";
import type { Address, AddressFormState } from "@/types/address";
import type { CartRecord } from "@/types/cart";
import type { DeliveryMode } from "@/types/order";
import type { Pagination } from "@/types/product";

const limit = 8;

type Placed = {
  message: string;
  orderId: string;
  orderNumber: string;
  paymentStatus?: string;
};

export function CheckoutView({
  initialCart = null,
  initialPagination = null,
  initialCartError = "",
  initialAddresses,
  initialAddressError = "",
}: {
  initialCart?: CartRecord | null;
  initialPagination?: Pagination | null;
  initialCartError?: string;
  initialAddresses?: Address[];
  initialAddressError?: string;
}) {
  const { session } = useAuth();
  const dispatch = useAppDispatch();
  const revision = useAppSelector((state) => state.shop.cartRevision);
  const profileSeeded = useRef(false);
  const placedOrder = useRef(false);
  const addressTouched = useRef(false);
  const cartSeeded = !initialCartError && initialCart !== null;
  const addressSeeded = initialAddresses !== undefined && !initialAddressError;
  const consumeCartSeed = useServerSeed(cartSeeded);
  const consumeAddressSeed = useServerSeed(addressSeeded);
  const preferred = initialAddresses?.find((item) => item.isDefault) ?? initialAddresses?.[0];
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState<CartRecord | null>(cartSeeded ? initialCart : null);
  const [pagination, setPagination] = useState<Pagination | null>(cartSeeded ? initialPagination : null);
  const [cartError, setCartError] = useState("");
  const [cartLoading, setCartLoading] = useState(!cartSeeded);
  const [addresses, setAddresses] = useState<Address[]>(addressSeeded ? initialAddresses ?? [] : []);
  const [addressesReady, setAddressesReady] = useState(addressSeeded);
  const [mode, setMode] = useState<DeliveryMode>(addressSeeded && preferred ? "saved" : "temporary");
  const [addressId, setAddressId] = useState(addressSeeded && preferred ? preferred.id : "");
  const [draft, setDraft] = useState<AddressFormState>(emptyAddressForm);
  const [saveAddress, setSaveAddress] = useState(!(addressSeeded && preferred));
  const [makeDefault, setMakeDefault] = useState(false);
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);

  useEffect(() => {
    if (profileSeeded.current || !session) return;
    profileSeeded.current = true;
    setDraft((current) => ({
      ...current,
      fullName: session.user.name,
      mobile: session.user.mobile,
      country: current.country || "United Arab Emirates",
    }));
  }, [session]);

  useEffect(() => {
    if (placedOrder.current) return;
    if (consumeCartSeed()) return;
    let active = true;
    setCartLoading(true);
    getCart({ page, limit })
      .then((result) => {
        if (!active) return;
        setCart(result.cart);
        setPagination(result.pagination);
        setCartError("");
        if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
          setPage(result.pagination.totalPages);
        }
      })
      .catch((caught) => {
        if (!active) return;
        setCart(null);
        setPagination(null);
        setCartError(errorText(caught, "Checkout could not be loaded."));
      })
      .finally(() => {
        if (active) setCartLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, revision]);

  useEffect(() => {
    if (consumeAddressSeed()) return;
    let active = true;
    listAddresses({ limit: 50, sort: "newest" })
      .then((result) => {
        if (!active) return;
        setAddresses(result.addresses);
        if (addressTouched.current) return;
        const preferred = result.addresses.find((item) => item.isDefault) ?? result.addresses[0];
        if (preferred) {
          setAddressId(preferred.id);
          setMode("saved");
          setSaveAddress(false);
        } else {
          setMode("temporary");
          setSaveAddress(true);
        }
      })
      .catch((caught) => {
        if (!active) return;
        setAddresses([]);
        setMode("temporary");
        setSaveAddress(true);
        toast(errorText(caught, "Saved addresses could not be loaded. You can still enter a one-time address."));
      })
      .finally(() => {
        if (active) setAddressesReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  async function onPlace() {
    if (pending || !cart || cart.itemCount === 0) return;
    const noteIssue = noteError(note);
    if (noteIssue) {
      setFormError(noteIssue);
      return;
    }
    const built = deliveryInput({
      mode: addresses.length === 0 ? "temporary" : mode,
      addressId,
      draft,
      saveAddress,
      makeDefault: saveAddress && (addresses.length === 0 || makeDefault),
    });
    if ("error" in built) {
      setFormError(built.error);
      return;
    }
    const trimmedNote = note.trim();
    setFormError("");
    setPending(true);
    try {
      const result = await placeOrder({
        ...built.body,
        ...(trimmedNote ? { note: trimmedNote } : {}),
      });
      placedOrder.current = true;
      dispatch(noteCart(0));
      toast(result.message);
      if (isPaymentRedirect(result.payment?.paymentUrl)) {
        window.location.assign(result.payment.paymentUrl);
        return;
      }
      setPlaced({
        message: result.message,
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
        paymentStatus: result.payment?.status,
      });
    } catch (caught) {
      setFormError(errorText(caught, "The order could not be placed."));
      setPending(false);
    }
  }

  const items = cart?.items ?? [];
  const totalPages = pagination?.totalPages ?? 0;
  const noteLength = note.trim().length;
  const ready = Boolean(cart && cart.itemCount > 0 && addressesReady && (mode === "temporary" || addressId) && !pending);

  if (placed) {
    return (
      <PageFrame
        eyebrow="Order placed"
        title={placed.orderNumber}
        lede={`${placed.message} You can review it from your orders.`}
      >
        <div className="mx-auto max-w-xl rounded-[1.5rem] border border-ink/10 bg-paper p-8">
          {placed.paymentStatus ? (
            <div className="mt-4">
              <StatusBadge status={placed.paymentStatus} kind="payment" />
            </div>
          ) : null}
          <Link
            href={`${routes.orders}/${placed.orderId}`}
            className="mt-6 inline-flex rounded-full bg-wine px-5 py-3 text-sm text-white hover:bg-wine-deep"
          >
            View order
          </Link>
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      eyebrow="Checkout"
      title="Place your order"
      lede="Use a saved address, or enter one just for this order. Payment opens after the order is created."
    >
      <div className="mb-5 flex justify-end">
        <Link href={routes.cart} className="text-sm text-wine">
          Back to cart
        </Link>
      </div>
      {cartError ? <p className="mb-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{cartError}</p> : null}
      {cartLoading && !cart ? <p className="text-sm text-ink/60">Loading checkout…</p> : null}
      {!cartLoading && !cartError && cart && cart.itemCount === 0 ? (
        <div className="rounded-[1.5rem] border border-ink/10 bg-paper p-8">
          <p className="text-base leading-7 text-ink/70">The cart is empty.</p>
          <Link href={routes.products} className="mt-4 inline-flex text-wine">
            Browse products
          </Link>
        </div>
      ) : null}
      {cart && cart.itemCount > 0 ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <section>
            <h2 className="page-title">Delivery</h2>
            <div className="mt-4">
              {addressesReady ? (
                <DeliveryPicker
                  addresses={addresses}
                  mode={addresses.length === 0 ? "temporary" : mode}
                  onModeChange={(next) => {
                    addressTouched.current = true;
                    setMode(next);
                    setFormError("");
                    if (next === "temporary") {
                      setSaveAddress(addresses.length === 0);
                      setMakeDefault(false);
                    }
                  }}
                  addressId={addressId}
                  onAddressId={(id) => {
                    addressTouched.current = true;
                    setAddressId(id);
                    setFormError("");
                  }}
                  draft={draft}
                  onDraft={(next) => {
                    setDraft(next);
                    setFormError("");
                  }}
                  saveAddress={saveAddress}
                  onSaveAddress={setSaveAddress}
                  makeDefault={makeDefault}
                  onMakeDefault={setMakeDefault}
                  manageHref={routes.addresses}
                />
              ) : (
                <p className="text-sm text-ink/60">Loading addresses…</p>
              )}
            </div>
            <label className="mt-6 block text-sm text-ink/70">
              Note
              <textarea
                value={note}
                onChange={(event) => {
                  setNote(event.target.value);
                  setFormError("");
                }}
                rows={3}
                maxLength={500}
                placeholder="Optional. Leave a note for this order."
                className="mt-2 w-full rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none focus:border-wine"
              />
            </label>
            {noteLength > 0 ? (
              <p className={`mt-2 text-xs ${noteLength < 2 ? "text-wine" : "text-ink/45"}`}>{noteLength}/500</p>
            ) : null}
          </section>
          <aside className="h-fit rounded-[1.5rem] border border-ink/10 bg-paper p-6 lg:sticky lg:top-28">
            <div className="flex items-end justify-between gap-3">
              <h2 className="page-title">Your order</h2>
              <p className="text-sm text-ink/55">{cart.itemCount} items</p>
            </div>
            <ul className="mt-4 max-h-80 space-y-3 overflow-auto pr-1">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <ProductMedia src={item.product.images[0]} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link href={`${routes.products}/${item.product.id}`} className="block truncate text-sm hover:text-wine">
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-ink/55">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm">{formatPrice(item.payableTotal)}</p>
                </li>
              ))}
            </ul>
            {totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={page <= 1 || pending}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-full border border-ink/15 px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <p className="text-xs text-ink/55">
                  Page {pagination?.page} of {totalPages}
                </p>
                <button
                  type="button"
                  disabled={page >= totalPages || pending}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-full border border-ink/15 px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            ) : null}
            {cart.coupon ? (
              <p className="mt-4 text-sm text-ink/70">
                Coupon {cart.coupon.code} · {formatCouponValue(cart.coupon)}
              </p>
            ) : (
              <p className="mt-4 text-sm text-ink/55">No coupon applied.</p>
            )}
            <dl className="mt-4 grid gap-2 text-sm">
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
            {totalPages > 1 ? <p className="mt-3 text-xs leading-5 text-ink/50">Totals cover every item in the cart.</p> : null}
            <div className="mt-4">
              <FormError message={formError} />
            </div>
            <button
              type="button"
              disabled={!ready}
              onClick={onPlace}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-wine px-5 py-3.5 text-sm text-white hover:bg-wine-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? "Placing order…" : "Place order"}
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-ink/50">
              You’ll continue to payment. Items in this order leave the cart.
            </p>
          </aside>
        </div>
      ) : null}
    </PageFrame>
  );
}
