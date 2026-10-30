import type { ReactNode } from "react";

export function AdminNote({ children }: { children: ReactNode }) {
  return <p className="mb-6 max-w-2xl text-sm leading-6 text-ink/65">{children}</p>;
}
