export type QueryInput = Record<string, string | string[] | undefined>;

export function param(query: QueryInput, key: string) {
  const value = query[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function pageFrom(query: QueryInput) {
  const page = Number(param(query, "page") || "1");
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

export function catalogHref(
  pathname: string,
  query: QueryInput,
  patch: Record<string, string | null>,
  keepPage = false,
) {
  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(query)) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) params.set(key, value);
  }
  for (const [key, value] of Object.entries(patch)) {
    if (!value) params.delete(key);
    else params.set(key, value);
  }
  if (!keepPage) params.delete("page");
  const text = params.toString();
  return text ? `${pathname}?${text}` : pathname;
}
