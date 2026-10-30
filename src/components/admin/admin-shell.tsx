"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { RoleGuard } from "@/guards/RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";
import { routes } from "@/lib/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearSession } from "@/redux/slices/authSlice";
import { closeSidebar, toggleSidebar } from "@/redux/slices/sidebarSlice";
import { Logo } from "@/components/landing/logo";
import { useConfirm } from "@/components/ui/confirm-dialog";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/customers", label: "Users" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/coupons", label: "Coupons" },
];

function deskTitle(pathname: string) {
  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/admin/products/")) return "Product";
  if (pathname.startsWith("/admin/customers/")) return "User";
  if (pathname.startsWith("/admin/orders/")) return "Order";
  if (pathname.startsWith("/admin/payments/")) return "Payment";
  return "Admin";
}

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/payments": "Payments",
  "/admin/reviews": "Reviews",
  "/admin/customers": "Users",
  "/admin/categories": "Categories",
  "/admin/brands": "Brands",
  "/admin/coupons": "Coupons",
};

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allow="admin">
      <AdminFrame>{children}</AdminFrame>
    </RoleGuard>
  );
}

function AdminFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.sidebar.open);
  const { session } = useAuth();
  const { confirm, dialog } = useConfirm();

  useEffect(() => {
    dispatch(closeSidebar());
  }, [pathname, dispatch]);

  async function signOut() {
    const ok = await confirm({
      title: "Log out?",
      message: "You will need to sign in again to open the admin desk.",
      confirmLabel: "Log out",
    });
    if (!ok) return;
    logout();
    dispatch(clearSession());
    router.replace(routes.home);
  }

  return (
    <div className="flex min-h-full flex-1 bg-ivory">
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/20 lg:hidden"
          aria-label="Close menu"
          onClick={() => dispatch(closeSidebar())}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-ink/10 bg-[#fffdf8] transition lg:sticky lg:top-0 lg:self-start lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 shrink-0 items-center border-b border-ink/10 px-5">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label="Admin">
          <p className="px-4 pb-2 pt-1 text-xs uppercase tracking-[0.16em] text-wine">Admin desk</p>
          {links.map((link) => {
            const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-2xl px-4 py-3 text-sm ${
                  active ? "bg-blush text-wine" : "text-ink/75 hover:bg-[#f8ebe3]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between gap-4 border-b border-ink/10 bg-ivory/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full border border-ink/15 lg:hidden"
              aria-label="Open admin menu"
              onClick={() => dispatch(toggleSidebar())}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 7h16M4 12h16M4 17h12" />
              </svg>
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-wine">Management</p>
              <h1 className="font-display text-2xl tracking-tight">{deskTitle(pathname)}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-ink/70 sm:inline">{session?.user.name}</span>
            <Link href={routes.home} className="hidden text-ink/70 hover:text-wine sm:inline">
              View site
            </Link>
            <button type="button" onClick={signOut} className="rounded-full border border-ink/15 px-4 py-2">
              Log out
            </button>
          </div>
        </header>
        <div className="flex-1 px-4 py-8 sm:px-6">{children}</div>
      </div>
      {dialog}
    </div>
  );
}
