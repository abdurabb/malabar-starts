import { Suspense } from "react";
import { ScreenStatus } from "@/components/auth/screen-status";
import { CategoriesView } from "@/components/shop/categories-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
};

export default function CategoriesPage() {
  return (
    <Suspense fallback={<ScreenStatus label="Opening categories…" />}>
      <CategoriesView />
    </Suspense>
  );
}
