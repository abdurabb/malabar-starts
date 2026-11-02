import { Suspense } from "react";
import type { Metadata } from "next";
import { ScreenStatus } from "@/components/auth/screen-status";
import { CartView } from "@/components/shop/cart-view";
import { getCart } from "@/lib/carts";
import { loadPage } from "@/lib/load";

export const instant = false;

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <Suspense fallback={<ScreenStatus label="Opening the cart…" />}>
      <CartPageData />
    </Suspense>
  );
}

async function CartPageData() {
  const loaded = await loadPage(() => getCart({ page: 1, limit: 8 }), null, "The cart could not be loaded.");
  return (
    <CartView
      initialCart={loaded.data?.cart ?? null}
      initialPagination={loaded.data?.pagination ?? null}
      initialError={loaded.error}
    />
  );
}
