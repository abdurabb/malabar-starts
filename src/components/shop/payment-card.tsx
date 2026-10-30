import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/shop/status-badge";
import { formatOrderWhen } from "@/lib/orders";
import { formatPaymentAmount } from "@/lib/payments";
import type { PaymentRecord } from "@/types/payment";

export function PaymentRows({
  payments,
  hrefFor,
  showCustomer = false,
  showOrder = false,
  actionsFor,
}: {
  payments: PaymentRecord[];
  hrefFor: (payment: PaymentRecord) => string;
  showCustomer?: boolean;
  showOrder?: boolean;
  actionsFor?: (payment: PaymentRecord) => ReactNode;
}) {
  return (
    <>
      <div className="mt-5 hidden md:block">
        <div className="overflow-x-auto rounded-[1.25rem] border border-ink/10 bg-paper">
          <table className={`w-full border-collapse text-sm ${showCustomer ? "min-w-[760px]" : "min-w-[640px]"}`}>
            <thead>
              <tr className="border-b border-ink/10 text-left text-[0.68rem] uppercase tracking-[0.14em] text-ink/45">
                <th className="px-4 py-3 font-medium">Order</th>
                {showCustomer ? <th className="px-4 py-3 font-medium">Customer</th> : null}
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const href = hrefFor(payment);
                const actions = actionsFor?.(payment);
                return (
                  <tr key={payment.id} className="border-b border-ink/8 last:border-0">
                    <td className="px-4 py-3 align-top">
                      <Link href={href} className="font-medium hover:text-wine">
                        {payment.orderNumber ?? "Order"}
                      </Link>
                      {showCustomer || showOrder ? (
                        <Link href={`/admin/orders/${payment.orderId}`} className="mt-1 block text-xs text-wine">
                          Open order
                        </Link>
                      ) : null}
                      {payment.failureReason ? (
                        <p className="mt-1 max-w-xs text-xs leading-5 text-wine">{payment.failureReason}</p>
                      ) : null}
                    </td>
                    {showCustomer ? (
                      <td className="px-4 py-3 align-top">
                        <Link href={`/admin/customers/${payment.userId}`} className="text-wine">
                          Open customer
                        </Link>
                      </td>
                    ) : null}
                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      {formatPaymentAmount(payment.amount, payment.currency)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <StatusBadge status={payment.status} kind="payment" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-ink/70">
                      {formatOrderWhen(payment.createdAt)}
                      {payment.paidAt ? (
                        <span className="mt-1 block text-xs text-leaf">Paid {formatOrderWhen(payment.paidAt)}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap justify-end gap-2">
                        {actions}
                        <Link
                          href={href}
                          className="inline-flex h-10 items-center rounded-full border border-ink/15 px-4 text-sm hover:border-wine hover:text-wine"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ul className="mt-5 grid gap-2 md:hidden">
        {payments.map((payment) => {
          const href = hrefFor(payment);
          const actions = actionsFor?.(payment);
          return (
            <li key={payment.id} className="rounded-2xl border border-ink/10 bg-paper p-3">
              <Link href={href} className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate font-display text-xl tracking-tight">
                    {payment.orderNumber ?? "Order"}
                  </span>
                  <span className="mt-1 block text-xs text-ink/55">{formatOrderWhen(payment.createdAt)}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm">{formatPaymentAmount(payment.amount, payment.currency)}</span>
                  <span className="mt-1 inline-flex">
                    <StatusBadge status={payment.status} kind="payment" />
                  </span>
                </span>
              </Link>
              {payment.paidAt ? (
                <p className="mt-2 text-xs text-leaf">Paid {formatOrderWhen(payment.paidAt)}</p>
              ) : null}
              {payment.failureReason ? <p className="mt-2 text-xs leading-5 text-wine">{payment.failureReason}</p> : null}
              {showCustomer || showOrder ? (
                <p className="mt-2 flex flex-wrap gap-x-4 text-sm">
                  <Link href={`/admin/orders/${payment.orderId}`} className="text-wine">
                    Open order
                  </Link>
                  {showCustomer ? (
                    <Link href={`/admin/customers/${payment.userId}`} className="text-wine">
                      Open customer
                    </Link>
                  ) : null}
                </p>
              ) : null}
              {actions ? <div className="mt-3 flex flex-wrap gap-2">{actions}</div> : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function PaymentPager({
  page,
  totalPages,
  currentPage,
  onPage,
}: {
  page: number;
  totalPages: number;
  currentPage?: number;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="h-11 cursor-pointer rounded-full border border-ink/15 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      <p className="text-sm text-ink/60">
        Page {currentPage ?? page} of {totalPages}
      </p>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="h-11 cursor-pointer rounded-full border border-ink/15 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
