import Link from "next/link";
import { ProductMedia } from "@/components/shop/product-card";
import { routes } from "@/lib/navigation";
import type { Brand } from "@/types/brand";

export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`${routes.products}?brand=${encodeURIComponent(brand.id)}`}
      className="flex h-full min-w-0 cursor-pointer flex-col rounded-xl border border-ink/10 bg-paper p-2 transition-colors hover:border-wine"
    >
      <ProductMedia src={brand.logo} alt="" className="aspect-square w-full rounded-lg object-cover" />
      <h3 className="mt-2 line-clamp-2 font-display text-sm leading-tight tracking-tight">{brand.name}</h3>
      {brand.description ? (
        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-ink/55">{brand.description}</p>
      ) : null}
    </Link>
  );
}
