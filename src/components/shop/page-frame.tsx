import type { ReactNode } from "react";

export function PageFrame({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 md:py-16">
      {/* <p className="text-xs uppercase tracking-[0.22em] text-wine">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.02] tracking-tight text-ink sm:text-6xl">{title}</h1>
      {lede ? <p className="mt-4 max-w-2xl text-base leading-7 text-ink/70">{lede}</p> : null} */}
      <div className="">{children}</div>
    </div>
  );
}
