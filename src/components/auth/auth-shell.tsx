import type { ReactNode } from "react";
import { Logo } from "@/components/landing/logo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-ink/10 bg-paper lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden flex-col justify-between bg-[#f8ebe3] p-10 lg:flex">
          <Logo />
          <div>
            <p className="page-title text-ink">
              The Sharjah counter, <span className="italic text-wine">online.</span>
            </p>
            <p className="page-body text-ink/70">
              Fresh chicken, frozen poultry, beef, and food stuff. Customers return to the
              landing page. The desk opens for admin.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.18em] text-wine">Sharjah, UAE</p>
        </aside>
        <div className="px-6 py-8 sm:px-10 sm:py-12">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="page-title text-ink">{title}</h1>
          <p className="page-body text-ink/70">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
