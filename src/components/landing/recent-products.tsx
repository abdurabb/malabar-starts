import Link from "next/link";
import { CardCarousel } from "@/components/landing/card-carousel";
import { ProductCard } from "@/components/shop/product-card";
import { routes } from "@/lib/navigation";
import type { CatalogProduct } from "@/types/product";

export function RecentProducts({ products, ready }: { products: CatalogProduct[]; ready: boolean }) {
  return (
    <section id="recent" className="scroll-mt-28 border-t border-ink/10">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:py-14">
        <CardCarousel
          label="Recent products"
          heading={
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.22em] text-wine">Recent products</p>
              <h2 className="page-title mt-2 text-ink">
                Just added to the counter.
              </h2>
              <p className="page-body text-ink/70">
                The latest products placed on the Sharjah counter.
              </p>
            </div>
          }
          action={
            <Link
              href={routes.products}
              className="inline-flex w-fit items-center justify-center rounded-full bg-wine px-6 py-3.5 text-sm text-white transition-colors hover:bg-wine-deep"
            >
              View all
            </Link>
          }
          note={!ready ? "Loading recent products…" : products.length === 0 ? "No active products yet." : null}
        >
          {products.map((product) => (
            <li
              key={product.id}
              className="w-[calc((100%-0.75rem)/2)] shrink-0 snap-start lg:w-[calc((100%-1.5rem)/3)] xl:w-[calc((100%-2.25rem)/4)]"
            >
              <ProductCard product={product} />
            </li>
          ))}
        </CardCarousel>
      </div>
    </section>
  );
}
