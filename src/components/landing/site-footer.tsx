import Link from "next/link";
import { navLinks } from "@/lib/landing";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-paper text-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-12 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-6 text-ink/65">
            Fresh chicken, frozen poultry, beef, mutton, and food stuff from
            Sharjah, United Arab Emirates.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink/70">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-wine">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-ink/10">
        <p className="mx-auto w-full max-w-6xl px-5 py-5 text-xs tracking-[0.08em] text-ink/45 sm:px-8">
          Malabar Starts Food Stuff · Sharjah
        </p>
      </div>
    </footer>
  );
}
