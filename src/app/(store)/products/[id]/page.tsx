import { Suspense } from "react";
import { ProductDetail } from "@/components/shop/product-detail";
import { getProduct } from "@/lib/products";
import { absoluteAsset, metaDescription, siteName } from "@/lib/site";
import type { Metadata } from "next";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getProduct(id);
    const description = metaDescription(product.description, `${product.name} from ${siteName} in Sharjah.`);
    const image = absoluteAsset(product.images[0]);
    const path = `/products/${product.id}`;
    return {
      title: product.name,
      description,
      alternates: { canonical: path },
      robots: product.isActive ? undefined : { index: false, follow: true },
      openGraph: {
        title: product.name,
        description,
        url: path,
        images: image ? [{ url: image, alt: product.name }] : undefined,
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title: product.name,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return {
      title: "Product",
      robots: { index: false, follow: false },
    };
  }
}

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
