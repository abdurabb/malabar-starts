import Link from "next/link";

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const name = tone === "light" ? "text-ivory" : "text-ink";
  const sub = tone === "light" ? "text-ivory/65" : "text-ink/55";

  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Malabar Starts Food Stuff, home">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-wine text-white shadow-[inset_0_0_0_1px_rgba(255,250,243,0.18)]">
        <svg viewBox="0 0 40 40" className="size-7" aria-hidden="true">
          <circle cx="20" cy="20" r="14.5" fill="none" stroke="currentColor" strokeWidth="1" />
          <text
            x="20"
            y="24"
            textAnchor="middle"
            fill="currentColor"
            fontSize="11"
            fontFamily="Georgia, serif"
          >
            MS
          </text>
        </svg>
      </span>
      <span className="min-w-0">
        <span className={`block font-display text-[1.05rem] leading-none tracking-tight ${name}`}>
          Malabar Starts
        </span>
        <span className={`mt-1 block text-[0.65rem] uppercase tracking-[0.22em] ${sub}`}>
          Food Stuff
        </span>
      </span>
    </Link>
  );
}
