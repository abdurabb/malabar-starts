import { counterItems } from "@/lib/landing";

export function Counter() {
  return (
    <section id="counter" className="scroll-mt-28 border-t border-ink/10 bg-paper">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:py-14">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-wine">Today&apos;s counter</p>
          <h2 className="page-title mt-2 text-ink">
            A board, not a fixed price list.
          </h2>
          <p className="page-body text-ink/70">
            Meat rates move with the market. Ask the desk for the rate for today,
            the cut, and how much the kitchen needs.
          </p>
        </div>
        <ul className="mt-8 border-t border-ink/10">
          {counterItems.map((item) => (
            <li
              key={item.name}
              className="grid grid-cols-1 items-baseline gap-1 border-b border-ink/10 py-5 sm:grid-cols-[7.5rem_1fr_auto] sm:gap-6"
            >
              <span className="text-[0.68rem] uppercase tracking-[0.18em] text-wine">
                {item.tag}
              </span>
              <span className="font-display text-base font-medium tracking-tight text-ink sm:text-lg">
                {item.name}
              </span>
              <span className="text-sm text-ink/55 sm:text-right">{item.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
