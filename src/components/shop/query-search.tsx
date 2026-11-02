"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { controlClass } from "@/components/shop/filter-controls";

export function QuerySearch({
  pathname,
  placeholder,
  label,
  total,
  unit,
}: {
  pathname: string;
  placeholder: string;
  label: string;
  total: number | null;
  unit: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const [draft, setDraft] = useState(search);
  const [seenSearch, setSeenSearch] = useState(search);
  if (search !== seenSearch) {
    setSeenSearch(search);
    setDraft((current) => (current.trim() === search ? current : search));
  }

  useEffect(() => {
    const next = draft.trim();
    if (next === search) return;
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set("search", next);
      else params.delete("search");
      params.delete("page");
      const text = params.toString();
      router.replace(text ? `${pathname}?${text}` : pathname);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [draft, pathname, router, search, searchParams]);

  return (
    <div className="mb-6 flex items-center gap-3">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{label}</span>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          maxLength={100}
          className={controlClass}
          aria-label={label}
        />
      </label>
      {total !== null ? <p className="hidden shrink-0 text-sm text-ink/55 sm:block">{total} {unit}</p> : null}
    </div>
  );
}
