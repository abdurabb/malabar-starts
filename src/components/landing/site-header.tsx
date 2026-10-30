"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";
import type { HomeData } from "@/lib/home";
import { navLinks } from "@/lib/landing";
import { listOrders } from "@/lib/orders";
import { routes } from "@/lib/navigation";
import { listBrandOptions, listCategoryOptions } from "@/lib/products";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearSession } from "@/redux/slices/authSlice";
import { clearShop } from "@/redux/slices/shopSlice";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { statusLabel } from "@/types/status";
import type { OrderRecord } from "@/types/order";
import { Logo } from "./logo";

const storyLinks = navLinks.filter((link) => link.label !== "Categories" && link.label !== "Brands");
const shopPreview = 5;

export function SiteHeader({ home }: { home?: HomeData | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { status, session } = useAuth();
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector((state) => state.shop.cartCount);
  const wishCount = useAppSelector((state) => state.shop.wishlist.length);
  const role = session?.user.role;
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);
  const { confirm, dialog } = useConfirm();
  const menuCategories = home?.categories ?? categories;
  const menuBrands = home?.brands ?? brands;
  const menuOrders = home?.orders ?? recentOrders;

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (home !== undefined) return;
    listCategoryOptions()
      .then((items) => setCategories(items.map((item) => ({ id: item.id, name: item.name }))))
      .catch(() => setCategories([]));
    listBrandOptions()
      .then((items) => setBrands(items.map((item) => ({ id: item.id, name: item.name }))))
      .catch(() => setBrands([]));
  }, [home]);

  useEffect(() => {
    if (home !== undefined) return;
    if (status !== "authenticated" || role !== "user") return;
    let active = true;
    listOrders({ limit: shopPreview, sort: "newest" })
      .then((result) => {
        if (active) setRecentOrders(result.orders);
      })
      .catch(() => {
        if (active) setRecentOrders([]);
      });
    return () => {
      active = false;
    };
  }, [home, status, role]);

  async function signOut() {
    const ok = await confirm({
      title: "Log out?",
      message: "You will need to sign in again on this device.",
      confirmLabel: "Log out",
    });
    if (!ok) return;
    logout();
    dispatch(clearSession());
    dispatch(clearShop());
  }

  return (
    <header className="sticky top-0 z-50">
      <p className="border-b border-wine/15 bg-[#f3e6d4] px-5 py-2 text-center text-[0.72rem] leading-5 text-wine sm:tracking-[0.12em]">
        <span className="block sm:inline">Sharjah, United Arab Emirates</span>
        <span className="hidden sm:inline"> · </span>
        <span className="block sm:inline">Fresh chicken, frozen poultry, and beef</span>
      </p>
      <div className="border-b border-ink/10 bg-ivory/88 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="max-sm:[&_.min-w-0]:sr-only">
            <Logo />
          </div>
          <nav className="hidden items-center gap-5 text-sm text-ink/75 lg:flex" aria-label="Primary">
            <HoverMenu label="Shop" href={routes.products} wide>
              <div className="grid sm:grid-cols-3 sm:divide-x sm:divide-ink/10">
                <MenuLinks
                  title="Categories"
                  items={menuCategories.slice(0, shopPreview).map((item) => ({ href: `${routes.products}?category=${item.id}`, label: item.name }))}
                  empty="No categories yet."
                  allHref={routes.categories}
                  allLabel="All categories"
                />
                <MenuLinks
                  title="Brands"
                  items={menuBrands.slice(0, shopPreview).map((item) => ({ href: `${routes.products}?brand=${item.id}`, label: item.name }))}
                  empty="No brands yet."
                  allHref={routes.brands}
                  allLabel="All brands"
                />
                <MenuLinks
                  title="Orders"
                  items={
                    role === "user"
                      ? menuOrders.slice(0, shopPreview).map((order) => ({
                          href: `${routes.orders}/${order.id}`,
                          label: order.orderNumber,
                          note: statusLabel(order.status),
                        }))
                      : []
                  }
                  empty={role === "user" ? "No orders yet." : role === "admin" ? undefined : "Sign in to see your orders."}
                  allHref={role === "admin" ? "/admin/orders" : role === "user" ? routes.orders : `${routes.login}?next=${encodeURIComponent(routes.orders)}`}
                  allLabel={role === "admin" ? "Order desk" : role === "user" ? "All orders" : "Sign in"}
                />
              </div>
            </HoverMenu>
            {storyLinks.map((link) => (
              <Link key={link.href} href={link.href} className="py-2 text-sm font-medium tracking-tight text-ink/80 transition-colors hover:text-wine">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href={routes.products}
              className="rounded-full border border-ink/15 px-3 py-2 text-sm text-ink transition-colors hover:border-wine hover:text-wine sm:px-4 sm:py-2.5"
            >
              Products
            </Link>
            <HeaderAccount
              ready={ready}
              status={status}
              role={role}
              name={session?.user.name}
              cartCount={cartCount}
              wishCount={wishCount}
              onLogout={signOut}
            />
          </div>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-ink/15 text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <MenuIcon open={open} />
          </button>
        </div>
        {open ? (
          <nav id="mobile-nav" className="border-t border-ink/10 bg-ivory px-5 py-4 md:hidden" aria-label="Mobile">
            <ul className="flex flex-col">
              <li>
                <Link href={routes.categories} className="block border-b border-ink/8 py-3 font-display text-2xl text-ink">
                  Categories
                </Link>
              </li>
              <li>
                <Link href={routes.brands} className="block border-b border-ink/8 py-3 font-display text-2xl text-ink">
                  Brands
                </Link>
              </li>
              {storyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="block border-b border-ink/8 py-3 font-display text-2xl text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={routes.products} className="block border-b border-ink/8 py-3 font-display text-2xl text-ink">
                  Products
                </Link>
              </li>
              {status === "authenticated" && role === "user" ? (
                <>
                  <li>
                    <Link href={routes.orders} className="block border-b border-ink/8 py-3 font-display text-2xl">
                      Orders
                    </Link>
                  </li>
                  <li>
                    <Link href={routes.cart} className="block border-b border-ink/8 py-3 font-display text-2xl">
                      Cart{cartCount ? ` (${cartCount})` : ""}
                    </Link>
                  </li>
                  <li>
                    <Link href={routes.wishlist} className="block border-b border-ink/8 py-3 font-display text-2xl">
                      Wishlist{wishCount ? ` (${wishCount})` : ""}
                    </Link>
                  </li>
                  <li>
                    <Link href={routes.profile} className="block border-b border-ink/8 py-3 font-display text-2xl">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link href={routes.payments} className="block border-b border-ink/8 py-3 font-display text-2xl">
                      Payment history
                    </Link>
                  </li>
                  <li>
                    <Link href={routes.addresses} className="block border-b border-ink/8 py-3 font-display text-2xl">
                      Addresses
                    </Link>
                  </li>
                </>
              ) : null}
              {status === "authenticated" && role === "admin" ? (
                <li>
                  <Link href={routes.admin} className="block border-b border-ink/8 py-3 font-display text-2xl">
                    Dashboard
                  </Link>
                </li>
              ) : null}
            </ul>
            {status === "anonymous" ? (
              <Link
                href={routes.login}
                className="mt-4 flex items-center justify-center rounded-full bg-wine px-4 py-3 text-sm text-white"
              >
                Login
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
      {dialog}
    </header>
  );
}

function HeaderAccount({
  ready,
  status,
  role,
  name,
  cartCount,
  wishCount,
  onLogout,
}: {
  ready: boolean;
  status: "loading" | "authenticated" | "anonymous";
  role?: "admin" | "user";
  name?: string;
  cartCount: number;
  wishCount: number;
  onLogout: () => void;
}) {
  if (!ready || status === "loading") {
    return <span className="inline-block h-11 w-24" aria-hidden="true" />;
  }

  if (status === "anonymous") {
    return (
      <Link
        href={routes.login}
        className="rounded-full bg-wine px-4 py-2.5 text-sm text-white transition-colors hover:bg-wine-deep"
      >
        Login
      </Link>
    );
  }

  if (role === "admin") {
    return (
      <>
        <Link
          href={routes.admin}
          className="rounded-full bg-wine px-4 py-2.5 text-sm text-white transition-colors hover:bg-wine-deep"
        >
          Dashboard
        </Link>
        <AccountMenu name={name} onLogout={onLogout} items={[]} />
      </>
    );
  }

  return (
    <>
      <IconLink href={routes.wishlist} label="Wishlist" count={wishCount}>
        <HeartIcon />
      </IconLink>
      <IconLink href={routes.cart} label="Cart" count={cartCount}>
        <CartIcon />
      </IconLink>
      <AccountMenu
        name={name}
        onLogout={onLogout}
        items={[
          { href: routes.profile, label: "Profile" },
          { href: routes.addresses, label: "Addresses" },
          { href: routes.payments, label: "Payment history" },
        ]}
      />
    </>
  );
}

function AccountMenu({
  name,
  items,
  onLogout,
}: {
  name?: string;
  items: { href: string; label: string }[];
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex size-11 items-center justify-center rounded-full border text-ink transition-colors hover:border-wine hover:text-wine ${
          open ? "border-wine text-wine" : "border-ink/15"
        }`}
      >
        <ProfileIcon />
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-ink/10 bg-paper p-2 shadow-[0_18px_50px_rgba(42,33,28,0.16)]">
          {name ? <p className="px-3 py-2 text-xs uppercase tracking-[0.14em] text-wine">{name}</p> : null}
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className="block rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-blush hover:text-wine"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="mt-1 block w-full rounded-xl px-3 py-2.5 text-left text-sm text-wine hover:bg-blush"
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function HoverMenu({ label, href, wide = false, children }: { label: string; href: string; wide?: boolean; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link
        href={href}
        aria-expanded={open}
        className={`inline-flex items-center gap-1 py-2 text-sm font-medium tracking-tight transition-colors ${
          open ? "text-wine" : "text-ink/80 hover:text-wine"
        }`}
      >
        {label}
        <svg
          viewBox="0 0 24 24"
          className={`size-3.5 transition ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </Link>
      {open ? (
        <div className="absolute left-0 top-full z-50 pt-2">
          <div
            className={`overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-[0_18px_50px_rgba(42,33,28,0.16)] ${
              wide ? "w-[min(46rem,calc(100vw-2.5rem))]" : "w-64"
            }`}
          >
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuLinks({
  title,
  items,
  empty,
  allHref,
  allLabel,
}: {
  title?: string;
  items: { href: string; label: string; note?: string }[];
  empty?: string;
  allHref?: string;
  allLabel?: string;
}) {
  return (
    <div className="flex h-full min-w-0 flex-col">
      {title ? <p className="px-5 pt-4 text-[0.68rem] uppercase tracking-[0.16em] text-wine">{title}</p> : null}
      <div className="p-2">
        {items.length === 0 && empty ? <p className="px-3 py-2 text-sm text-ink/50">{empty}</p> : null}
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-blush hover:text-wine">
            <span className="truncate">{item.label}</span>
            {item.note ? <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-ink/40">{item.note}</span> : null}
          </Link>
        ))}
      </div>
      {allHref && allLabel ? (
        <Link href={allHref} className="mt-auto block border-t border-ink/10 px-5 py-3 text-sm text-wine">
          {allLabel}
        </Link>
      ) : null}
    </div>
  );
}

function IconLink({
  href,
  label,
  count = 0,
  children,
}: {
  href: string;
  label: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={count ? `${label}, ${count}` : label}
      className="relative inline-flex size-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-wine hover:text-wine"
    >
      {children}
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-wine px-1 text-[0.65rem] leading-5 text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h12" />}
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 7h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 7Z" />
      <path d="M8 7V5.8A4 4 0 0 1 16 5.8V7" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 19s-6.2-3.8-8.2-7.4C2.2 8.8 3.6 6 6.4 6c1.7 0 2.8.9 3.6 2  .8-1.1 1.9-2 3.6-2 2.8 0 4.2 2.8 2.6 5.6C18.2 15.2 12 19 12 19Z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="3" />
      <path d="M5.5 19c1.2-2.6 3.4-4 6.5-4s5.3 1.4 6.5 4" />
    </svg>
  );
}
