import Link from "next/link";
import { catalogHref, type QueryInput } from "@/lib/query";

export function CatalogPager({
  pathname,
  query,
  page,
  totalPages,
  cursor = false,
}: {
  pathname: string;
  query: QueryInput;
  page: number;
  totalPages: number;
  cursor?: boolean;
}) {
  if (totalPages <= 1) return null;
  const className = `rounded-full border border-ink/15 px-4 py-2 text-sm ${cursor ? "cursor-pointer" : ""}`;
  const prev = page - 1;
  const next = page + 1;

  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      {page <= 1 ? (
        <span className={`${className} opacity-40`}>Previous</span>
      ) : (
        <Link href={catalogHref(pathname, query, { page: prev <= 1 ? null : String(prev) }, true)} className={className}>
          Previous
        </Link>
      )}
      <p className="text-sm text-ink/60">
        Page {page} of {totalPages}
      </p>
      {page >= totalPages ? (
        <span className={`${className} opacity-40`}>Next</span>
      ) : (
        <Link href={catalogHref(pathname, query, { page: String(next) }, true)} className={className}>
          Next
        </Link>
      )}
    </div>
  );
}
