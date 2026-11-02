import { Suspense } from "react";
import type { Metadata } from "next";
import { ScreenStatus } from "@/components/auth/screen-status";
import { CheckoutView } from "@/components/shop/checkout-view";
import { listAddresses } from "@/lib/addresses";
import { getCart } from "@/lib/carts";
import { loadPage } from "@/lib/load";

export const instant = false;

export const metadata: Metadata = {
  title: "Place order",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<ScreenStatus label="Opening checkout…" />}>
      <CheckoutPageData />
    </Suspense>
  );
}

async function CheckoutPageData() {
  const [cart, addresses] = await Promise.all([
    loadPage(() => getCart({ page: 1, limit: 8 }), null, "Checkout could not be loaded."),
    loadPage(() => listAddresses({ limit: 50, sort: "newest" }), null, "Saved addresses could not be loaded."),
  ]);
  return (
    <CheckoutView
      initialCart={cart.data?.cart ?? null}
      initialPagination={cart.data?.pagination ?? null}
      initialCartError={cart.error}
      initialAddresses={addresses.data?.addresses ?? []}
      initialAddressError={addresses.error}
    />
  );
}
