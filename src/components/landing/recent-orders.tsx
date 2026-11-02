import Link from "next/link";
import { StatusBadge } from "@/components/shop/status-badge";
import { formatOrderWhen, orderNeedsItemReview } from "@/lib/orders";
import { routes } from "@/lib/navigation";
import { formatPrice } from "@/lib/products";
import { statusLabel } from "@/types/status";
import type { OrderRecord } from "@/types/order";

export function RecentOrders({ orders, ready }: { orders: OrderRecord[]; ready: boolean }) {
  return (
    <section id="orders" className="scroll-mt-28 border-t border-ink/10">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:py-14">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.22em] text-wine">Orders</p>
            <h2 className="page-title mt-2 text-ink">
              Your recent orders.
            </h2>
            <p className="page-body text-ink/70">
              Orders you placed recently, with status and total.
            </p>
          </div>
          <Link
            href={routes.orders}
            className="inline-flex w-fit self-end items-center justify-center rounded-full bg-wine px-6 py-3.5 text-sm text-white transition-colors hover:bg-wine-deep md:self-auto"
          >
            View all
          </Link>
        </div>
        {!ready ? <p className="mt-10 text-sm text-ink/60">Loading orders…</p> : null}
        {ready && orders.length === 0 ? <p className="mt-10 text-sm text-ink/60">No orders yet.</p> : null}
        {orders.length > 0 ? (
          <ul className="mt-12 grid gap-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`${routes.orders}/${order.id}`}
                  className="block rounded-[1.25rem] border border-ink/10 bg-paper p-4 transition hover:border-wine"
                >
                  <span className="flex flex-wrap items-start justify-between gap-3">
                    <span>
                      <span className="block text-base font-medium leading-snug">{order.orderNumber}</span>
                      <span className="mt-1 block text-sm text-ink/55">
                        {formatOrderWhen(order.createdAt)}
                        {order.shippingAddress.city ? ` · ${order.shippingAddress.city}` : ""}
                        {` · ${order.itemCount} items`}
                      </span>
                      {orderNeedsItemReview(order) ? (
                        <span className="mt-2 block text-xs uppercase tracking-[0.12em] text-wine">Write review</span>
                      ) : null}
                    </span>
                    <span className="text-right">
                      <StatusBadge status={order.status} />
                      <span className="mt-2 block text-sm">{formatPrice(order.total)}</span>
                      <span className="mt-1 block text-xs uppercase tracking-[0.12em] text-ink/45">
                        {statusLabel(order.paymentStatus)}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
