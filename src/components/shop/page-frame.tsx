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
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 md:py-12">
      {title ? (
        <header className="mb-6">
          {eyebrow ? <p className="text-xs uppercase tracking-[0.22em] text-wine">{eyebrow}</p> : null}
          <h1 className={`page-title text-ink ${eyebrow ? "mt-2" : ""}`}>{title}</h1>
          {lede ? <p className="page-body text-ink/70">{lede}</p> : null}
        </header>
      ) : null}
      <div>{children}</div>
    </div>
  );
}
