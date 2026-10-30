"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CancelOrderDialog } from "@/components/shop/cancel-order-dialog";
import { NoteEditor, OrderDeliveryEditor } from "@/components/shop/order-editors";
import { OrderItemReview } from "@/components/shop/order-review";
import { OrderPanel } from "@/components/shop/order-panel";
import { NewPaymentLinkButton } from "@/components/shop/payment-actions";
import { PageFrame } from "@/components/shop/page-frame";
import { StatusBadge } from "@/components/shop/status-badge";
import { ApiError, errorText } from "@/lib/apiError";
import { listAddresses } from "@/lib/addresses";
import { formatOrderWhen, getOrder, updateOrder, updateOrderStatus } from "@/lib/orders";
import { routes } from "@/lib/navigation";
import { toast } from "@/lib/toast";
import { canEditOrder, canReviewOrder, cancelOrderStatus, customerCanCancel } from "@/types/status";
import type { Address } from "@/types/address";
import type { OrderItemReview as ItemReview, OrderRecord } from "@/types/order";

export function OrderDetailView({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getOrder(id)
      .then((item) => {
        if (!active) return;
        setOrder(item);
        setError("");
      })
      .catch((caught) => {
        if (!active) return;
        setOrder(null);
        setError(caught instanceof ApiError && caught.status === 404 ? "Order not found." : errorText(caught, "This order could not be opened."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const editable = order ? canEditOrder(order.status) : false;

  useEffect(() => {
    if (!editable) return;
    let active = true;
    listAddresses({ limit: 50, sort: "newest" })
      .then((result) => {
        if (active) setAddresses(result.addresses);
      })
      .catch(() => {
        if (active) setAddresses([]);
      });
    return () => {
      active = false;
    };
  }, [editable, id]);

  function saveItemReview(itemId: string, review: ItemReview) {
    setOrder((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map((item) => (item.id === itemId ? { ...item, review } : item)),
      };
    });
  }

  async function onCancel(reason: string) {
    const status = cancelOrderStatus();
    if (!order || !status) return;
    setBusy(true);
    try {
      const result = await updateOrderStatus(order.id, { status, cancelReason: reason });
      setOrder(result.order);
      setCancelOpen(false);
      toast(result.message);
    } catch (caught) {
      toast(errorText(caught, "The order could not be cancelled."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageFrame eyebrow="Order" title={order?.orderNumber ?? "Order"}>
      <Link href={routes.orders} className="text-sm text-wine">
        All orders
      </Link>
      {loading ? <p className="mt-6 text-sm text-ink/60">Opening this order…</p> : null}
      {error ? <p className="mt-6 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {order ? (
        <div className="mt-4">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl tracking-tight">{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mb-6 text-sm text-ink/55">{formatOrderWhen(order.createdAt)}</p>
          <OrderPanel
            order={order}
            showNote={!editable}
            itemFooter={
              canReviewOrder(order.status)
                ? (item) => (
                    <OrderItemReview
                      orderId={order.id}
                      item={item}
                      onSaved={(review) => saveItemReview(item.id, review)}
                    />
                  )
                : undefined
            }
            actions={
              <>
                {order.paymentStatus !== "paid" && order.paymentMethod !== "cod" && canEditOrder(order.status) ? (
                  <NewPaymentLinkButton orderId={order.id} label="Pay now" size="md" />
                ) : null}
                <Link
                  href={`${routes.payments}?orderId=${encodeURIComponent(order.id)}`}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-ink/15 px-5 text-sm hover:border-wine hover:text-wine"
                >
                  Payment history
                </Link>
                {customerCanCancel(order.status) ? (
                  <button
                    type="button"
                    onClick={() => setCancelOpen(true)}
                    disabled={busy}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-wine px-5 text-sm text-wine disabled:opacity-40"
                  >
                    Cancel order
                  </button>
                ) : null}
              </>
            }
            extras={
              editable ? (
                <>
                  <NoteEditor
                    note={order.note}
                    busy={busy}
                    onSave={async (note) => {
                      setBusy(true);
                      try {
                        const result = await updateOrder(order.id, { note });
                        setOrder(result.order);
                        toast(result.message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                  <OrderDeliveryEditor
                    shipping={order.shippingAddress}
                    addresses={addresses}
                    busy={busy}
                    manageHref={routes.addresses}
                    onSave={async (body) => {
                      setBusy(true);
                      try {
                        const result = await updateOrder(order.id, body);
                        setOrder(result.order);
                        toast(result.message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                </>
              ) : null
            }
          />
        </div>
      ) : null}
      {cancelOpen && order ? (
        <CancelOrderDialog
          orderNumber={order.orderNumber}
          busy={busy}
          onClose={() => {
            if (!busy) setCancelOpen(false);
          }}
          onConfirm={onCancel}
        />
      ) : null}
    </PageFrame>
  );
}
