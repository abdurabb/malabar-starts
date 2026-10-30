export function About() {
  return (
    <section id="about" className="scroll-mt-28">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-10 sm:px-8 md:py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-wine">The house</p>
          <h2 className="mt-3 font-display text-4xl leading-[1.02] tracking-tight text-ink sm:text-6xl">
            A Malabar name on a Sharjah counter.
          </h2>
          <div className="mt-8 space-y-5 text-base leading-8 text-ink/75">
            <p>
              Malabar Starts Food Stuff is a food supply house in Sharjah. The name
              carries the Malabar coast — pepper, home cooking, and a table that
              begins with good meat — into kitchens across the Emirates.
            </p>
            <p>
              We trade in fresh chicken, frozen poultry, beef, mutton, and the
              everyday food stuff that sits beside them. Nothing on the board is a
              fixed poster price. The desk confirms stock and the rate for today
              before the order moves.
            </p>
          </div>
        </div>
        <aside className="rounded-[1.75rem] border border-leaf/15 bg-mint px-7 py-8 text-ink sm:px-9 sm:py-10">
          <p className="text-xs uppercase tracking-[0.2em] text-leaf">Where</p>
          <p className="mt-5 font-display text-5xl leading-[0.95] tracking-tight">
            Sharjah
          </p>
          <p className="mt-2 font-display text-2xl italic text-leaf">
            United Arab Emirates
          </p>
          <p className="mt-6 max-w-sm text-sm leading-6 text-ink/70">
            The counter serves Sharjah first, then kitchens elsewhere in the
            Emirates once the cut and the quantity are agreed.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-leaf/15 pt-6 text-sm">
            <div>
              <dt className="text-ink/55">Fresh line</dt>
              <dd className="mt-1 font-display text-xl">Chicken & cuts</dd>
            </div>
            <div>
              <dt className="text-ink/55">Frozen line</dt>
              <dd className="mt-1 font-display text-xl">Poultry & more</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
