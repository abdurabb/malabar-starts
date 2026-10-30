import Link from "next/link";
import { CardCarousel } from "@/components/landing/card-carousel";
import { CategoryCard } from "@/components/shop/category-card";
import { routes } from "@/lib/navigation";
import type { Category } from "@/types/category";

export function Categories({ categories, ready }: { categories: Category[]; ready: boolean }) {
  return (
    <section id="categories" className="scroll-mt-28">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:py-14">
        <CardCarousel
          label="Categories"
          heading={
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.22em] text-wine">Categories</p>
              <h2 className="mt-3 font-display text-4xl leading-[1.02] tracking-tight text-ink sm:text-6xl">
                What we keep on the counter.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-ink/70">
                Choose a category and open the products kept there. Fresh when the day needs it. Frozen when the week does.
              </p>
            </div>
          }
          action={
            <Link
              href={routes.categories}
              className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full bg-wine px-6 py-3.5 text-sm text-white transition-colors hover:bg-wine-deep"
            >
              View all
            </Link>
          }
          note={!ready ? "Loading categories…" : categories.length === 0 ? "No active categories yet." : null}
        >
          {categories.map((category) => (
            <li key={category.id} className="flex w-[calc((100%-1.5rem)/3)] shrink-0 snap-start sm:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3.75rem)/6)]">
              <CategoryCard category={category} />
            </li>
          ))}
        </CardCarousel>
      </div>
    </section>
  );
}
