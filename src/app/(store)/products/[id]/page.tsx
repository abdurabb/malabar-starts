import { Suspense } from "react";
import { ProductDetail } from "@/components/shop/product-detail";
import type { Metadata } from "next";

export const instant = false;

export const metadata: Metadata = {
  title: "Product",
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-sm text-ink/60">Opening this product…</p>}>
      <ProductRoute params={params} />
    </Suspense>
  );
}

async function ProductRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
