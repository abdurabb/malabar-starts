import type { ReactNode } from "react";

export const fieldClass =
  "mt-2 w-full rounded-2xl border border-ink/15 bg-ivory px-4 py-3 text-ink outline-none placeholder:text-ink/35";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm text-ink/70">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-sm text-wine">{error}</span> : null}
    </label>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-2xl bg-blush px-4 py-3 text-sm text-wine">
      {message}
    </p>
  );
}
