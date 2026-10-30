"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { DashboardChart } from "@/components/admin/dashboard-chart";
import { ProductMedia } from "@/components/shop/product-card";
import { StarRating } from "@/components/shop/star-rating";
import { StatusBadge } from "@/components/shop/status-badge";
import { errorText } from "@/lib/apiError";
import { formatChange, formatCount, formatDashboardDay, formatMoney, getDashboard } from "@/lib/dashboard";
import { formatOrderWhen, paymentMethodLabel } from "@/lib/orders";
import { orderStatusClass, paymentStatusClass, statusLabel } from "@/types/status";
import type { DashboardData, DashboardMetric, DashboardRange } from "@/types/dashboard";

const rangeChoices: { value: DashboardRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "12m", label: "12 months" },
];

const summaryCards: {
  key: keyof DashboardData["summary"];
  label: string;
  hint: string;
  money: boolean;
}[] = [
  { key: "revenue", label: "Revenue", hint: "Paid orders", money: true },
  { key: "orderValue", label: "Order value", hint: "Excludes cancelled", money: true },
  { key: "outstanding", label: "Outstanding", hint: "Unpaid balance", money: true },
  { key: "orders", label: "Orders", hint: "Not cancelled", money: false },
  { key: "averageOrderValue", label: "Average order", hint: "Order value ÷ orders", money: true },
  { key: "itemsSold", label: "Items sold", hint: "Units on active orders", money: false },
  { key: "discount", label: "Discounts", hint: "On active orders", money: true },
  { key: "newCustomers", label: "New customers", hint: "Accounts opened", money: false },
  { key: "newReviews", label: "New reviews", hint: "Written in this range", money: false },
];

export function DashboardView() {
  const [range, setRange] = useState<DashboardRange>("30d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDashboard(range)
      .then((result) => {
        if (!active) return;
        setData(result);
        setError("");
      })
      .catch((caught) => {
        if (!active) return;
        setError(errorText(caught, "The dashboard could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [range]);

  return (
    <div className="space-y-5" aria-busy={loading}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-wine">{data?.range.label ?? "Last 30 days"}</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">
            {data
              ? `${formatDashboardDay(data.range.from)} – ${formatDashboardDay(data.range.to)}. Compared with ${data.range.comparison.toLowerCase()}.`
              : "Paid revenue, open orders, and what needs a hand on the desk."}
          </p>
        </div>
        <div className="flex flex-wrap rounded-full border border-ink/10 bg-paper p-1" role="group" aria-label="Dashboard range">
          {rangeChoices.map((choice) => (
            <button
              key={choice.value}
              type="button"
              aria-pressed={range === choice.value}
              onClick={() => setRange(choice.value)}
              className={`rounded-full px-3 py-1.5 text-sm ${range === choice.value ? "bg-wine text-white" : "text-ink/70 hover:text-wine"}`}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>
      {loading && data ? <p className="text-sm text-ink/50">Updating…</p> : null}
      {error ? <p className="rounded-2xl bg-blush px-4 py-3 text-sm text-wine">{error}</p> : null}
      {!data && loading ? <p className="text-sm text-ink/60">Loading the desk…</p> : null}
      {data ? <DashboardBody data={data} /> : null}
    </div>
  );
}

function DashboardBody({ data }: { data: DashboardData }) {
  const money = (value: number) => formatMoney(value, data.currency);
  const attention = attentionItems(data);

  return (
    <>
      {attention.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {attention.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="inline-flex items-center gap-2 rounded-full bg-blush px-3 py-1.5 text-sm text-wine hover:bg-wine hover:text-white">
                <span className="font-display text-lg leading-none">{formatCount(item.count)}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="inline-flex rounded-full bg-mint px-4 py-2 text-sm text-leaf">Nothing on the desk needs attention.</p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <li key={card.key}>
            <MetricCard
              label={card.label}
              hint={card.hint}
              metric={data.summary[card.key]}
              display={card.money ? money(data.summary[card.key].value) : formatCount(data.summary[card.key].value)}
              previous={card.money ? money(data.summary[card.key].previous) : formatCount(data.summary[card.key].previous)}
            />
          </li>
        ))}
      </ul>

      <Panel title="Revenue" action={<span className="text-xs uppercase tracking-[0.14em] text-ink/40">{data.range.bucket === "month" ? "By month" : "By day"}</span>}>
        <DashboardChart chart={data.chart} currency={data.currency} />
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <Panel title="Orders" action={<TextLink href="/admin/orders">All orders</TextLink>}>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Fact label="Placed" value={formatCount(data.orders.placed)} />
            <Fact label="Paid" value={formatCount(data.orders.paid)} />
            <Fact label="Unpaid" value={formatCount(data.orders.unpaid)} />
            <Fact label="Cancelled" value={formatCount(data.orders.cancelled)} />
            <Fact label="Coupons" value={formatCount(data.orders.couponsUsed)} />
          </dl>
          <h3 className="mt-6 text-xs uppercase tracking-[0.16em] text-wine">Queue</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {data.queue.map((step) => (
              <li key={step.status} className="rounded-2xl border border-ink/10 px-3 py-3">
                <StatusBadge status={step.status} />
                <p className="mt-1.5 font-display text-2xl tracking-tight">{formatCount(step.count)}</p>
              </li>
            ))}
          </ul>
          {data.latestOrders.length === 0 ? <p className="mt-6 text-sm text-ink/55">No orders yet.</p> : null}
          <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {data.latestOrders.map((order) => (
              <li key={order.id}>
                <Link href={`/admin/orders/${order.id}`} className="grid gap-3 py-4 transition-colors hover:text-wine sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-xl tracking-tight">{order.orderNumber}</span>
                      <StatusBadge status={order.status} />
                      <StatusBadge status={order.paymentStatus} kind="payment" />
                    </span>
                    <span className="mt-1 block truncate text-sm text-ink/60">
                      {order.preview ?? "No items"}
                      {order.city ? ` · ${order.city}` : ""}
                      {` · ${formatCount(order.itemCount)} items`}
                      {` · ${methodLabel(order.paymentMethod)}`}
                    </span>
                    <span className="mt-1 block text-sm text-ink/50">
                      {order.customer ? (
                        <span>{order.customer.name}</span>
                      ) : (
                        "Account removed"
                      )}
                      {` · ${formatOrderWhen(order.createdAt)}`}
                    </span>
                  </span>
                  <span className="font-display text-2xl tracking-tight sm:text-right">{money(order.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-5">
          <Panel title="By status">
            <Meters
              rows={data.orders.byStatus.map((row) => ({
                key: row.status,
                label: statusLabel(row.status),
                value: row.count,
                detail: `${formatCount(row.count)} · ${money(row.total)}`,
                tone: barTone(orderStatusClass(row.status)),
              }))}
            />
          </Panel>
          <Panel title="Payments" action={<TextLink href="/admin/payments">All payments</TextLink>}>
            <h3 className="text-xs uppercase tracking-[0.16em] text-ink/40">Method</h3>
            <div className="mt-3">
              <Meters
                rows={data.orders.byPaymentMethod.map((row) => ({
                  key: row.method,
                  label: methodLabel(row.method),
                  value: row.count,
                  detail: `${formatCount(row.count)} · ${money(row.total)}`,
                  tone: "bg-wine",
                }))}
              />
            </div>
            <h3 className="mt-6 text-xs uppercase tracking-[0.16em] text-ink/40">Records</h3>
            <div className="mt-3">
              <Meters
                rows={data.payments.map((row) => ({
                  key: row.status,
                  label: statusLabel(row.status),
                  value: row.count,
                  detail: `${formatCount(row.count)} · ${money(row.amount)}`,
                  tone: barTone(paymentStatusClass(row.status)),
                }))}
              />
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Top products" action={<TextLink href="/admin/products">Products</TextLink>}>
          {data.topProducts.length === 0 ? <Empty>No product sales in this range.</Empty> : null}
          <ul className="space-y-3">
            {data.topProducts.map((product) => (
              <li key={product.id}>
                <Link href={`/admin/products/${product.id}`} className="flex gap-3 rounded-2xl transition-colors hover:text-wine">
                  <ProductMedia src={product.image} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate font-display text-xl tracking-tight">{product.name}</span>
                    <span className="mt-1 block text-sm text-ink/55">
                      {formatCount(product.quantity)} sold · {formatCount(product.orders)} orders · {money(product.sales)}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink/45">
                      {product.sku ? `${product.sku} · ` : ""}
                      {product.stock === null ? "Product removed" : `${formatCount(product.stock)} in stock`}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Top categories" action={<TextLink href="/admin/categories">Categories</TextLink>}>
          <RankList rows={data.topCategories} empty="No category sales in this range." money={money} />
        </Panel>
        <Panel title="Top brands" action={<TextLink href="/admin/brands">Brands</TextLink>}>
          <RankList rows={data.topBrands} empty="No brand sales in this range." money={money} />
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Cities">
          {data.topCities.length === 0 ? <Empty>No deliveries in this range.</Empty> : null}
          <ul className="space-y-3">
            {data.topCities.map((city) => (
              <li key={`${city.city}-${city.state ?? ""}`} className="flex items-baseline justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate font-display text-xl tracking-tight">{city.city}</span>
                  <span className="block text-sm text-ink/50">{city.state || "—"} · {formatCount(city.orders)} orders</span>
                </span>
                <span className="shrink-0 text-sm">{money(city.total)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Wishlisted">
          {data.topWishlisted.length === 0 ? <Empty>No saved products yet.</Empty> : null}
          <ul className="space-y-3">
            {data.topWishlisted.map((product) => (
              <li key={product.id}>
                <DemandRow href={`/admin/products/${product.id}`} image={product.image} name={product.name} detail={`${formatCount(product.wishlists)} saved · ${formatCount(product.stock)} in stock`} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="In carts">
          {data.topInCarts.length === 0 ? <Empty>No carts are holding items.</Empty> : null}
          <ul className="space-y-3">
            {data.topInCarts.map((product) => (
              <li key={product.id}>
                <DemandRow
                  href={`/admin/products/${product.id}`}
                  image={product.image}
                  name={product.name}
                  detail={`${formatCount(product.quantity)} units · ${formatCount(product.carts)} carts`}
                />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Panel title="Reviews" action={<TextLink href="/admin/reviews">All reviews</TextLink>}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-4xl tracking-tight">{data.reviews.averageRating === null ? "—" : data.reviews.averageRating.toFixed(1)}</p>
              {data.reviews.averageRating !== null ? <StarRating rating={data.reviews.averageRating} /> : null}
            </div>
            <p className="text-sm text-ink/55">
              {formatCount(data.reviews.published)} published · {formatCount(data.reviews.unpublished)} hidden
              {data.reviews.periodAverage !== null ? ` · ${data.reviews.periodAverage.toFixed(1)} this range` : ""}
            </p>
          </div>
          <div className="mt-5">
            <Meters
              rows={[...data.reviews.byRating].reverse().map((row) => ({
                key: String(row.rating),
                label: `${row.rating} ${row.rating === 1 ? "star" : "stars"}`,
                value: row.count,
                detail: formatCount(row.count),
                tone: "bg-saffron",
              }))}
            />
          </div>
        </Panel>
        <Panel title="Catalog">
          <ul className="grid gap-3 sm:grid-cols-2">
            <CatalogLink href="/admin/products" label="Products" value={formatCount(data.catalog.products.total)} note={`${formatCount(data.catalog.products.active)} active · ${formatCount(data.catalog.products.outOfStock)} out · ${formatCount(data.catalog.products.lowStock)} at ${formatCount(data.catalog.products.lowStockAt)} or below`} />
            <CatalogLink href="/admin/categories" label="Categories" value={formatCount(data.catalog.categories.total)} note={`${formatCount(data.catalog.categories.active)} active`} />
            <CatalogLink href="/admin/brands" label="Brands" value={formatCount(data.catalog.brands.total)} note={`${formatCount(data.catalog.brands.active)} active`} />
            <CatalogLink href="/admin/customers" label="Customers" value={formatCount(data.catalog.customers.total)} note={`${formatCount(data.catalog.customers.blocked)} blocked · ${formatCount(data.catalog.customers.unverified)} unverified`} />
            <CatalogLink href="/admin/coupons" label="Active coupons" value={formatCount(data.catalog.coupons.active)} note={`${formatCount(data.catalog.coupons.expiringSoon)} expiring soon · ${formatCount(data.catalog.coupons.expired)} expired`} />
            <li className="rounded-2xl border border-ink/10 px-3.5 py-2.5">
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-wine">Carts</p>
              <p className="mt-1 font-display text-2xl tracking-tight">{formatCount(data.catalog.cartsWithItems)}</p>
              <p className="mt-1 text-xs text-ink/55">Holding items · {formatCount(data.catalog.wishlistItems)} on wishlists</p>
            </li>
          </ul>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Stock" action={<TextLink href="/admin/products">Products</TextLink>}>
          {data.stockAlerts.length === 0 ? <Empty>No active products at or below {formatCount(data.catalog.products.lowStockAt)} in stock.</Empty> : null}
          <ul className="space-y-3">
            {data.stockAlerts.map((product) => (
              <li key={product.id}>
                <DemandRow
                  href={`/admin/products/${product.id}`}
                  image={product.image}
                  name={product.name}
                  detail={`${product.sku ? `${product.sku} · ` : ""}${formatCount(product.stock)} left · ${money(product.price)}`}
                />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Latest reviews" action={<TextLink href="/admin/reviews">Reviews</TextLink>}>
          {data.recentReviews.length === 0 ? <Empty>No reviews yet.</Empty> : null}
          <ul className="space-y-4">
            {data.recentReviews.map((review) => (
              <li key={review.id} className="border-b border-ink/10 pb-4 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${review.isPublish ? "bg-mint text-leaf" : "bg-sand text-ink"}`}>
                    {review.isPublish ? "Published" : "Hidden"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/75">{review.comment || "No comment."}</p>
                <p className="mt-1 text-xs text-ink/50">
                  {review.user?.name ?? "Account removed"}
                  {review.product ? (
                    <>
                      {" · "}
                      <Link href={`/admin/products/${review.product.id}`} className="hover:text-wine">{review.product.name}</Link>
                    </>
                  ) : null}
                  {review.order ? (
                    <>
                      {" · "}
                      <Link href={`/admin/orders/${review.order.id}`} className="hover:text-wine">{review.order.orderNumber || "Order"}</Link>
                    </>
                  ) : null}
                  {` · ${formatOrderWhen(review.createdAt)}`}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="New customers" action={<TextLink href="/admin/customers">Customers</TextLink>}>
          {data.recentCustomers.length === 0 ? <Empty>No customers yet.</Empty> : null}
          <ul className="space-y-3">
            {data.recentCustomers.map((customer) => (
              <li key={customer.id}>
                <Link href={`/admin/customers/${customer.id}`} className="block rounded-2xl transition-colors hover:text-wine">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-xl tracking-tight">{customer.name}</span>
                    {customer.isBlocked ? <span className="rounded-full bg-blush px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-wine">Blocked</span> : null}
                    {!customer.isEmailVerified ? <span className="rounded-full bg-wheat px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink">Unverified</span> : null}
                  </span>
                  <span className="mt-1 block truncate text-sm text-ink/55">{customer.email} · {customer.mobile}</span>
                  <span className="mt-0.5 block text-xs text-ink/45">{formatOrderWhen(customer.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

function attentionItems(data: DashboardData) {
  const items = [
    { label: "Pending orders", count: data.attention.pendingOrders, href: "/admin/orders" },
    { label: "Unpaid orders", count: data.attention.unpaidOrders, href: "/admin/orders" },
    { label: "Out of stock", count: data.attention.outOfStock, href: "/admin/products" },
    { label: "Low stock", count: data.attention.lowStock, href: "/admin/products" },
    { label: "Coupons expiring", count: data.attention.expiringCoupons, href: "/admin/coupons" },
    { label: "Expired coupons", count: data.attention.expiredCoupons, href: "/admin/coupons" },
    { label: "Failed payments", count: data.attention.failedPayments, href: "/admin/payments?status=failed" },
    { label: "Carts with items", count: data.attention.abandonedCarts, href: "/admin/customers" },
  ];
  return items.filter((item) => item.count > 0);
}

function MetricCard({
  label,
  hint,
  metric,
  display,
  previous,
}: {
  label: string;
  hint: string;
  metric: DashboardMetric;
  display: string;
  previous: string;
}) {
  const tone = changeTone(metric.change);
  return (
    <article className="rounded-2xl border border-ink/10 bg-paper px-4 py-3.5">
      <p className="text-[0.65rem] uppercase tracking-[0.14em] text-wine">{label}</p>
      <p className="mt-1.5 font-display text-3xl tracking-tight tabular-nums">{display}</p>
      <p className="mt-1.5 text-xs text-ink/55">
        <span className={tone}>{formatChange(metric.change)}</span>
        <span> · {previous} before</span>
      </p>
      <p className="mt-1 text-xs text-ink/40">{hint}</p>
    </article>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[1.25rem] border border-ink/10 bg-paper p-4 sm:p-5">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-xl tracking-tight">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm text-wine hover:text-wine-deep">
      {children}
    </Link>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-ink/40">{label}</dt>
      <dd className="mt-1 font-display text-2xl tracking-tight tabular-nums">{value}</dd>
    </div>
  );
}

function Meters({ rows }: { rows: { key: string; label: string; value: number; detail: string; tone: string }[] }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.key}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span>{row.label}</span>
            <span className="shrink-0 text-ink/50">{row.detail}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ivory">
            <div className={`h-full rounded-full ${row.tone}`} style={{ width: `${row.value > 0 ? Math.max(6, (row.value / max) * 100) : 0}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RankList({
  rows,
  empty,
  money,
}: {
  rows: DashboardData["topCategories"];
  empty: string;
  money: (value: number) => string;
}) {
  if (rows.length === 0) return <Empty>{empty}</Empty>;
  return (
    <ol className="space-y-3">
      {rows.map((row, index) => (
        <li key={row.id || row.slug || row.name} className="flex items-baseline justify-between gap-3">
          <span className="min-w-0">
            <span className="block truncate font-display text-xl tracking-tight">
              <span className="mr-2 text-sm text-ink/35">{index + 1}</span>
              {row.name || "Untitled"}
            </span>
            <span className="block text-sm text-ink/50">{formatCount(row.quantity)} sold · {formatCount(row.orders)} orders</span>
          </span>
          <span className="shrink-0 text-sm">{money(row.sales)}</span>
        </li>
      ))}
    </ol>
  );
}

function DemandRow({ href, image, name, detail }: { href: string; image: string | null; name: string; detail: string }) {
  return (
    <Link href={href} className="flex gap-3 transition-colors hover:text-wine">
      <ProductMedia src={image} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
      <span className="min-w-0">
        <span className="block truncate font-display text-lg tracking-tight">{name}</span>
        <span className="mt-0.5 block text-sm text-ink/55">{detail}</span>
      </span>
    </Link>
  );
}

function CatalogLink({ href, label, value, note }: { href: string; label: string; value: string; note: string }) {
  return (
    <li>
      <Link href={href} className="block rounded-2xl border border-ink/10 px-3.5 py-2.5 transition-colors hover:border-wine">
        <p className="text-[0.65rem] uppercase tracking-[0.14em] text-wine">{label}</p>
        <p className="mt-1 font-display text-2xl tracking-tight tabular-nums">{value}</p>
        <p className="mt-1 text-xs leading-5 text-ink/55">{note}</p>
      </Link>
    </li>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-ink/55">{children}</p>;
}

function changeTone(change: number | null) {
  if (change === null || change > 0) return "text-leaf";
  if (change < 0) return "text-wine";
  return "text-ink/45";
}

function methodLabel(method: string | null) {
  if (method === "unselected") return "Not chosen";
  return paymentMethodLabel(method);
}

function barTone(statusClass: string) {
  const tone = statusClass.split(" ").find((part) => part.startsWith("bg-"));
  return tone ?? "bg-wine";
}
