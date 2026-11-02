"use client";

import { useId, useState } from "react";
import { formatChartLabel, formatCount, formatMoney } from "@/lib/dashboard";
import type { DashboardData } from "@/types/dashboard";

function tickIndexes(count: number) {
  if (count <= 1) return [0];
  const ticks = Math.min(6, count);
  const indexes: number[] = [];
  for (let index = 0; index < ticks; index += 1) {
    indexes.push(Math.round((index * (count - 1)) / (ticks - 1)));
  }
  return [...new Set(indexes)];
}

function lastMovement(points: DashboardData["chart"]["points"]) {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (points[index].revenue > 0 || points[index].orders > 0) return index;
  }
  return Math.max(points.length - 1, 0);
}

export function DashboardChart({ chart, currency }: { chart: DashboardData["chart"]; currency: string }) {
  const points = chart.points;
  const [active, setActive] = useState<number | null>(null);
  const gradientId = useId().replace(/:/g, "");

  if (points.length === 0) {
    return <p className="text-sm text-ink/55">No days in this range.</p>;
  }

  const width = 720;
  const height = 228;
  const pad = { top: 16, right: 8, bottom: 28, left: 8 };
  const max = Math.max(...points.map((point) => Math.max(point.revenue, point.orderValue)), 1);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const step = points.length > 1 ? innerW / (points.length - 1) : innerW;
  const coords = points.map((point, index) => ({
    ...point,
    x: pad.left + (points.length > 1 ? index * step : innerW / 2),
    y: pad.top + innerH - (point.revenue / max) * innerH,
  }));
  const baseline = pad.top + innerH;
  const linePath = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${baseline} L ${coords[0].x.toFixed(2)} ${baseline} Z`;
  const selected = active ?? lastMovement(points);
  const current = coords[selected] ?? coords[0];
  const hit = points.length > 1 ? step : innerW;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-ink/60">
          <span className="font-display text-2xl tracking-tight text-ink">{formatMoney(current.revenue, currency)}</span>
          <span className="ml-3">{formatChartLabel(current.date, chart.bucket)}</span>
        </p>
        <p className="text-sm text-ink/55">
          {formatCount(current.orders)} orders · {formatCount(current.items)} items
          {current.cancelled > 0 ? ` · ${formatCount(current.cancelled)} cancelled` : ""}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-2 h-56 w-full"
        role="img"
        aria-label={`Revenue by ${chart.bucket}`}
        onMouseLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8d3040" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#8d3040" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {coords.map((point, index) => (
          <rect
            key={point.date}
            x={point.x - hit / 2}
            y={pad.top}
            width={hit}
            height={innerH}
            fill={index === selected ? "rgba(141,48,64,0.07)" : "transparent"}
            onMouseEnter={() => setActive(index)}
            onClick={() => setActive(index)}
          />
        ))}
        <path d={areaPath} fill={`url(#${gradientId})`} pointerEvents="none" />
        <path d={linePath} fill="none" stroke="#8d3040" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" pointerEvents="none" />
        <circle cx={current.x} cy={current.y} r="4.5" fill="#fffdf8" stroke="#8d3040" strokeWidth="2.4" pointerEvents="none" />
        {tickIndexes(points.length).map((index) => {
          const point = coords[index];
          if (!point) return null;
          return (
            <text key={point.date} x={point.x} y={height - 6} textAnchor="middle" fill="#2a211c" fillOpacity="0.45" fontSize="11">
              {formatChartLabel(point.date, chart.bucket)}
            </text>
          );
        })}
      </svg>
      <ol className="sr-only">
        {points.map((point) => (
          <li key={point.date}>
            {formatChartLabel(point.date, chart.bucket)}: {formatMoney(point.revenue, currency)}, {formatCount(point.orders)} orders
          </li>
        ))}
      </ol>
    </div>
  );
}
