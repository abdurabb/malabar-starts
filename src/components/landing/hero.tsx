import { counterItems } from "@/lib/landing";

const highlights = counterItems.slice(0, 4);

export function Hero() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-24 top-10 size-72 rounded-full bg-saffron/25 blur-3xl" />
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-wine">
            Food supply · Sharjah
          </p>
          <h1 className="page-title mt-2 max-w-full pr-2 text-ink">
            <span className="block">Fresh chicken.</span>
            <span className="block italic text-wine">Frozen poultry.</span>
            <span className="block">Beef from Sharjah.</span>
          </h1>
          <p className="page-body text-ink/75">
            Malabar Starts Food Stuff keeps hotels, caterers, and home kitchens
            supplied. Whole birds, portions, beef, mutton, and the food stuff
            beside them — with the rate for today confirmed before you order.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#counter"
              className="inline-flex items-center justify-center rounded-full bg-wine px-6 py-3.5 text-sm text-white transition-colors hover:bg-wine-deep"
            >
              See the counter
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-paper px-6 py-3.5 text-sm text-ink transition-colors hover:border-wine hover:text-wine"
            >
              Contact us
            </a>
          </div>
          <dl className="mt-12 grid grid-cols-1 gap-6 border-t border-ink/10 pt-6 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-ink/50">House</dt>
              <dd className="mt-1 font-display text-xl text-ink">Sharjah, UAE</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-ink/50">Lines</dt>
              <dd className="mt-1 font-display text-xl text-ink">Fresh & frozen</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-ink/50">Kitchens</dt>
              <dd className="mt-1 font-display text-xl text-ink">Homes to hotels</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[2rem] border border-wine/15 bg-[#fff6ee] px-6 py-8 text-ink sm:px-8 sm:py-10">
            <p className="text-xs uppercase tracking-[0.2em] text-wine">Sharjah counter</p>
            <p className="page-title mt-3 max-w-xs">
              Held cold.
              <span className="block italic text-wine">Cut to order.</span>
            </p>
            <p className="page-body text-ink/70">
              Chicken for the day, cartons for the week, and beef when the pot needs it.
            </p>
            <svg
              viewBox="0 0 220 140"
              className="pointer-events-none absolute -right-6 bottom-0 w-44 text-wine/20 sm:w-52"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <path d="M30 90c20-40 70-58 110-40 18 8 28 28 24 48-8 36-58 48-96 36C38 124 18 108 30 90Z" />
              <path d="M132 52c18-16 40-14 52 2" />
              <circle cx="78" cy="84" r="3" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <ul className="relative z-10 -mt-8 ml-4 divide-y divide-ink/10 rounded-[1.5rem] border border-ink/10 bg-paper shadow-[0_20px_50px_-28px_rgba(28,20,16,0.45)] sm:ml-8">
            {highlights.map((item) => (
              <li key={item.name} className="flex items-baseline justify-between gap-4 px-5 py-3.5 sm:px-6">
                <span>
                  <span className="block text-[0.65rem] uppercase tracking-[0.16em] text-wine">
                    {item.tag}
                  </span>
                  <span className="font-display text-lg text-ink">{item.name}</span>
                </span>
                <span className="shrink-0 text-sm text-ink/55">{item.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
