import { Suspense } from "react";
import { ProductAdminDetail } from "@/components/admin/product-admin-detail";
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
  return <ProductAdminDetail id={id} />;
}
