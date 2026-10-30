"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderReviewAdmin } from "@/components/admin/order-review-admin";
import { CancelOrderDialog } from "@/components/shop/cancel-order-dialog";
import { NoteEditor } from "@/components/shop/order-editors";
import { OrderPanel } from "@/components/shop/order-panel";
import { StatusBadge } from "@/components/shop/status-badge";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ApiError, errorText } from "@/lib/apiError";
import { formatOrderWhen, getOrder, updateOrder, updateOrderStatus } from "@/lib/orders";
import { toast } from "@/lib/toast";
import {
  adminNextStatuses,
  canEditOrder,
  canReviewOrder,
  cancelOrderStatus,
  isCancelStatus,
  statusActionLabel,
  statusLabel,
} from "@/types/status";
import type { OrderRecord } from "@/types/order";
import type { OrderStatus } from "@/types/status";

export function OrderAdminDetail({ id }: { id: string }) {
  const { confirm, dialog } = useConfirm();
  const [order, setOrder] = useState<OrderRecord | null>(null);
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

  // Address changes are paused for admin.
  // useEffect(() => {
  //   if (!editable || !order?.user?.id) return;
  //   listUserAddresses(order.user.id, { limit: 50, sort: "newest" }).then(...)
  // }, [editable, order?.user?.id]);

  async function onAdvance(status: OrderStatus) {
    if (!order) return;
    if (isCancelStatus(status)) {
      setCancelOpen(true);
      return;
    }
    const ok = await confirm({
      title: `${statusActionLabel(status)}?`,
      message: `${order.orderNumber} will be marked ${statusLabel(status).toLowerCase()}.`,
      confirmLabel: statusActionLabel(status),
    });
    if (!ok) return;
    setBusy(true);
    try {
      const result = await updateOrderStatus(order.id, { status });
      setOrder(result.order);
      toast(result.message);
    } catch (caught) {
      toast(errorText(caught, "The status could not be updated."));
    } finally {
      setBusy(false);
    }
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

  if (loading) {
    return (
      <>
        <p className="text-sm text-ink/60">Opening this order…</p>
        {dialog}
      </>
    );
  }

  if (!order) {
    return (
      <div>
        <Link href="/admin/orders" className="text-sm text-wine">
          All orders
        </Link>
        <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error || "Order not found."}</p>
        {dialog}
      </div>
    );
  }

  const next = adminNextStatuses(order.status);

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-wine">
        All orders
      </Link>
      <div className="mt-4 mb-6 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-4xl tracking-tight">{order.orderNumber}</h2>
        <StatusBadge status={order.status} />
      </div>
      <p className="mb-2 text-sm text-ink/55">{formatOrderWhen(order.createdAt)}</p>
      <p className="mb-6">
        <Link href={`/admin/payments?orderId=${encodeURIComponent(order.id)}`} className="text-sm text-wine">
          Payments for this order
        </Link>
      </p>
      <OrderPanel
        order={order}
        productBase="/admin/products"
        showCustomer
        showNote={!editable}
        actions={
          next.length > 0 ? (
            <>
              {next.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={busy}
                  onClick={() => onAdvance(status)}
                  className={`inline-flex h-12 items-center justify-center rounded-full px-5 text-sm disabled:opacity-40 ${
                    isCancelStatus(status) ? "border border-wine text-wine" : "bg-wine text-white hover:bg-wine-deep"
                  }`}
                >
                  {statusActionLabel(status)}
                </button>
              ))}
            </>
          ) : null
        }
        extras={
          <>
            {canReviewOrder(order.status) ? <OrderReviewAdmin order={order} /> : null}
            {editable ? (
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
            ) : null}
            {/* Address changes are paused for admin. */}
          </>
        }
      />
      {cancelOpen ? (
        <CancelOrderDialog
          orderNumber={order.orderNumber}
          busy={busy}
          onClose={() => {
            if (!busy) setCancelOpen(false);
          }}
          onConfirm={onCancel}
        />
      ) : null}
      {dialog}
    </div>
  );
}
