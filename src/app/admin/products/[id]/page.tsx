import { Suspense } from "react";
import { ProductAdminDetail } from "@/components/admin/product-admin-detail";
import { ApiError, errorText } from "@/lib/apiError";
import { getProduct } from "@/lib/products";
import type { CatalogProduct } from "@/types/product";
import type { Metadata } from "next";

export const instant = false;

export const metadata: Metadata = {
  title: "Product",
};

export default function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-ink/60">Opening this product…</p>}>
      <AdminProductRoute params={params} />
    </Suspense>
  );
}

async function AdminProductRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product: CatalogProduct | null = null;
  let error = "";
  try {
    product = await getProduct(id);
  } catch (caught) {
    error = caught instanceof ApiError && caught.status === 404 ? "Product not found" : errorText(caught, "This product could not be opened.");
  }
  return <ProductAdminDetail id={id} initialProduct={product} initialError={error} />;
}
