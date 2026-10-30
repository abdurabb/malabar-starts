import { reasons } from "@/lib/landing";

export function WhyUs() {
  return (
    <section id="why" className="scroll-mt-28 border-t border-ink/10 bg-[#fff8f2] text-ink">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:py-14">
        <p className="text-xs uppercase tracking-[0.22em] text-saffron">Why us</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl leading-[1.02] tracking-tight sm:text-6xl">
          Kitchens stay when the counter is steady.
        </h2>
        <ol className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2">
          {reasons.map((reason) => (
            <li key={reason.index} className="border-t border-ink/10 pt-6">
              <span className="text-xs tracking-[0.18em] text-wine">{reason.index}</span>
              <h3 className="mt-3 font-display text-3xl tracking-tight">{reason.title}</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-ink/70">{reason.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
