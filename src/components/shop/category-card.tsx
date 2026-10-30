import Link from "next/link";
import { ProductMedia } from "@/components/shop/product-card";
import { routes } from "@/lib/navigation";
import type { Category } from "@/types/category";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`${routes.products}?category=${encodeURIComponent(category.id)}`}
      className="flex h-full min-w-0 cursor-pointer flex-col rounded-xl border border-ink/10 bg-paper p-2 transition-colors hover:border-wine"
    >
      <ProductMedia src={category.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
      <h3 className="mt-2 line-clamp-2 font-display text-sm leading-tight tracking-tight">{category.name}</h3>
      {category.parent ? (
        <p className="mt-1 truncate text-[10px] uppercase tracking-[0.12em] text-wine">{category.parent.name}</p>
      ) : category.description ? (
        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-ink/55">{category.description}</p>
      ) : null}
    </Link>
  );
}
