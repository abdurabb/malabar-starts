import { Suspense } from "react";
import { ScreenStatus } from "@/components/auth/screen-status";
import { ProductsView } from "@/components/shop/products-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<ScreenStatus label="Opening products…" />}>
      <ProductsView />
    </Suspense>
  );
}
