import { api } from "@/lib/api";
import type { DashboardData, DashboardRange } from "@/types/dashboard";

export function getDashboard(range: DashboardRange) {
  return api<DashboardData>(`/api/v1/home/dashboard?range=${range}`);
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("en-AE").format(Number.isFinite(value) ? value : 0);
}

export function formatMoney(value: number, currency: string) {
  const amount = Number.isFinite(value) ? value : 0;
  const code = currency.trim().toUpperCase();
  try {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

export function formatDashboardDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatChartLabel(value: string, bucket: "day" | "month") {
  const iso = bucket === "month" ? `${value}-01T00:00:00.000Z` : `${value}T00:00:00.000Z`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-AE", {
    month: "short",
    timeZone: "UTC",
    ...(bucket === "month" ? { year: "numeric" } : { day: "numeric" }),
  }).format(date);
}

export function formatChange(change: number | null) {
  if (change === null) return "New";
  if (change === 0) return "0%";
  const text = Number.isInteger(change) ? String(change) : change.toFixed(1);
  return `${change > 0 ? "+" : ""}${text}%`;
}
