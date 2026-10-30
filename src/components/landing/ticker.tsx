import { tickerItems } from "@/lib/landing";

export function Ticker() {
  const loop = [...tickerItems, ...tickerItems];

  return (
    <div className="overflow-hidden border-y border-wine/15 bg-[#f8e7dc] text-wine" aria-hidden="true">
      <div className="ticker-track flex w-max py-3">
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center">
            <span className="px-4 font-display text-lg italic tracking-tight sm:text-xl">{item}</span>
            <span className="size-1.5 rounded-full bg-saffron" />
          </span>
        ))}
      </div>
    </div>
  );
}
