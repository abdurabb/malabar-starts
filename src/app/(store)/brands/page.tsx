import { Suspense } from "react";
import { ScreenStatus } from "@/components/auth/screen-status";
import { BrandsView } from "@/components/shop/brands-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brands",
};

export default function BrandsPage() {
  return (
    <Suspense fallback={<ScreenStatus label="Opening brands…" />}>
      <BrandsView />
    </Suspense>
  );
}
