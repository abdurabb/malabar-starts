import type { Metadata } from "next";

export const siteName = "Malabar Starts Food Stuff";

export const siteDescription =
  "Fresh chicken, frozen poultry, beef, mutton, and food stuff supplied from Sharjah, United Arab Emirates.";

export const privateRobots: Metadata["robots"] = {
  index: false,
  follow: false,
};

export function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (vercel) return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  return "http://localhost:3000";
}

export function absoluteAsset(src: string | null | undefined) {
  if (!src) return null;
  if (src.startsWith("https://") || src.startsWith("http://")) return src;
  if (src.startsWith("//")) return `https:${src}`;
  const api = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
  return `${api}${src.startsWith("/") ? src : `/${src}`}`;
}

export function metaDescription(value: string | null | undefined, fallback: string) {
  const text = value?.replace(/\s+/g, " ").trim();
  const description = text || fallback;
  if (description.length <= 160) return description;
  return `${description.slice(0, 157).trimEnd()}...`;
}
