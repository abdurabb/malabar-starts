import Link from "next/link";
import type { ReactNode } from "react";
import { OrderTracker } from "@/components/shop/order-tracker";
import { ProductMedia } from "@/components/shop/product-card";
import { formatAddressLines } from "@/lib/addresses";
import { formatCouponValue } from "@/lib/carts";
import { addressSourceLabel, paymentMethodLabel } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { routes } from "@/lib/navigation";
import { statusLabel } from "@/types/status";
import type { OrderItem, OrderRecord } from "@/types/order";

export function OrderPanel({
  order,
  productBase = routes.products,
  showCustomer = false,
  showNote = true,
  actions,
  extras,
  itemFooter,
}: {
  order: OrderRecord;
  productBase?: string;
  showCustomer?: boolean;
  showNote?: boolean;
  actions?: ReactNode;
  extras?: ReactNode;
  itemFooter?: (item: OrderItem) => ReactNode;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
      <div>
        <h2 className="font-display text-3xl tracking-tight">Items</h2>
        <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
          {order.items.map((item) => (
            <li key={item.id} className="py-4">
              <div className="flex gap-4">
                <ProductMedia src={item.image} alt="" className="size-20 shrink-0 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <Link href={`${productBase}/${item.product}`} className="block font-display text-2xl tracking-tight hover:text-wine">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-ink/55">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                    {item.unit ? ` · ${item.unit}` : ""}
                    {item.sku ? ` · ${item.sku}` : ""}
                  </p>
                </div>
                <p className="text-sm">{formatPrice(item.lineTotal)}</p>
              </div>
              {itemFooter ? <div className="mt-3 sm:pl-24">{itemFooter(item)}</div> : null}
            </li>
          ))}
        </ul>
        <OrderTracker order={order} />
        {showNote && order.note ? (
          <div className="mt-8">
            <h2 className="font-display text-3xl tracking-tight">Note</h2>
            <p className="mt-3 text-sm leading-6 text-ink/70">{order.note}</p>
          </div>
        ) : null}
        {extras}
      </div>
      <aside className="h-fit rounded-[1.5rem] border border-ink/10 bg-paper p-6">
        {showCustomer ? (
          <div className="mb-5 border-b border-ink/10 pb-5">
            <p className="text-xs uppercase tracking-[0.14em] text-ink/45">Customer</p>
            {order.user ? (
              <>
                <Link href={`/admin/customers/${order.user.id}`} className="mt-2 block font-display text-2xl tracking-tight hover:text-wine">
                  {order.user.name}
                </Link>
                <p className="mt-1 text-sm text-ink/55">{order.user.email}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-ink/60">Account removed</p>
            )}
          </div>
        ) : null}
        <p className="text-xs uppercase tracking-[0.14em] text-wine">{addressSourceLabel(order.shippingAddress.source)}</p>
        <p className="mt-2 font-display text-2xl tracking-tight">{order.shippingAddress.fullName}</p>
        {order.shippingAddress.label ? <p className="mt-1 text-sm text-ink/55">{order.shippingAddress.label}</p> : null}
        <div className="mt-3 text-sm leading-6 text-ink/70">
          {formatAddressLines(order.shippingAddress).map((line, index) => (
            <p key={`${index}-${line}`}>{line}</p>
          ))}
          <p>{order.shippingAddress.mobile}</p>
        </div>
        <dl className="mt-5 grid gap-2 border-t border-ink/10 pt-5 text-sm">
          {order.coupon ? (
            <div className="flex justify-between gap-4">
              <dt className="text-ink/55">Coupon {order.coupon.code}</dt>
              <dd>{formatCouponValue(order.coupon)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-ink/55">Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/55">Discount</dt>
            <dd>{formatPrice(order.discount)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-ink/10 pt-2 text-base font-medium">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
          <div className="flex justify-between gap-4 pt-2">
            <dt className="text-ink/55">Payment</dt>
            <dd>{statusLabel(order.paymentStatus)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/55">Method</dt>
            <dd>{paymentMethodLabel(order.paymentMethod)}</dd>
          </div>
        </dl>
        {actions ? <div className="mt-5 grid gap-2">{actions}</div> : null}
      </aside>
    </div>
  );
}
