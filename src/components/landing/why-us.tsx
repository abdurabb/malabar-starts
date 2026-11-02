import { reasons } from "@/lib/landing";

export function WhyUs() {
  return (
    <section id="why" className="scroll-mt-28 border-t border-ink/10 bg-[#fff8f2] text-ink">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 md:py-14">
        <p className="text-xs uppercase tracking-[0.22em] text-saffron">Why us</p>
        <h2 className="page-title mt-2 max-w-3xl">
          Kitchens stay when the counter is steady.
        </h2>
        <p className="page-body text-ink/70">
          Home kitchens, caterers, and hotel stores order from the same Sharjah counter.
        </p>
        <ol className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {reasons.map((reason) => (
            <li key={reason.index} className="border-t border-ink/10 pt-6">
              <span className="text-xs tracking-[0.18em] text-wine">{reason.index}</span>
              <h3 className="page-title mt-2">{reason.title}</h3>
              <p className="page-body text-ink/70">{reason.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
