import Link from "next/link";
import { CardCarousel } from "@/components/landing/card-carousel";
import { BrandCard } from "@/components/shop/brand-card";
import { routes } from "@/lib/navigation";
import type { Brand } from "@/types/brand";

export function Brands({ brands, ready }: { brands: Brand[]; ready: boolean }) {
  return (
    <section id="brands" className="scroll-mt-28">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:py-14">
        <CardCarousel
          label="Brands"
          heading={
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.22em] text-wine">Brands</p>
              <h2 className="mt-3 font-display text-4xl leading-[1.02] tracking-tight text-ink sm:text-6xl">
                Names we keep on the shelf.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-ink/70">
                Choose a brand and open the products sold under that name.
              </p>
            </div>
          }
          action={
            <Link
              href={routes.brands}
              className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full bg-wine px-6 py-3.5 text-sm text-white transition-colors hover:bg-wine-deep"
            >
              View all
            </Link>
          }
          note={!ready ? "Loading brands…" : brands.length === 0 ? "No active brands yet." : null}
        >
          {brands.map((brand) => (
            <li key={brand.id} className="flex w-[calc((100%-1.5rem)/3)] shrink-0 snap-start sm:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3.75rem)/6)]">
              <BrandCard brand={brand} />
            </li>
          ))}
        </CardCarousel>
      </div>
    </section>
  );
}
