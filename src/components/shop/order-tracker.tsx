import { formatOrderWhen } from "@/lib/orders";
import { isCancelStatus, orderFlow, statusLabel } from "@/types/status";
import type { OrderRecord } from "@/types/order";

type StepState = "past" | "current" | "upcoming";

export function OrderTracker({ order }: { order: OrderRecord }) {
  const steps = orderFlow();
  const dates = new Map<string, string>();
  for (const entry of order.statusHistory) dates.set(entry.status, entry.date);
  const cancelled = isCancelStatus(order.status);
  const currentIndex = steps.findIndex((step) => step === order.status);
  const reachedIndex = cancelled
    ? steps.reduce((last, step, index) => (dates.has(step) ? index : last), -1)
    : currentIndex;

  function stateFor(index: number): StepState {
    if (cancelled) return index <= reachedIndex ? "past" : "upcoming";
    if (index < currentIndex) return "past";
    if (index === currentIndex) return "current";
    return "upcoming";
  }

  return (
    <div className="mt-8">
      <h2 className="page-title">Tracking</h2>
      <ol className="mt-5">
        {steps.map((step, index) => {
          const state = stateFor(index);
          const next = index < steps.length - 1 ? stateFor(index + 1) : null;
          const date = dates.get(step);
          const lineDark = state !== "upcoming" && next !== "upcoming" && next !== null;
          return (
            <li key={step} className="grid grid-cols-[1.35rem_minmax(0,1fr)] gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1 size-3.5 shrink-0 rounded-full ${
                    state === "past"
                      ? "bg-ink"
                      : state === "current"
                        ? "bg-wine ring-4 ring-blush motion-safe:animate-pulse"
                        : "border border-ink/15 bg-paper"
                  }`}
                />
                {next !== null ? <span className={`my-1 w-px min-h-8 flex-1 ${lineDark ? "bg-ink" : "bg-ink/10"}`} /> : null}
              </div>
              <div className={next !== null ? "pb-5" : ""}>
                <p
                  className={`text-sm ${
                    state === "upcoming" ? "text-ink/30" : state === "current" ? "font-medium text-ink" : "text-ink/80"
                  }`}
                >
                  {statusLabel(step)}
                  {state === "current" ? <span className="ml-2 text-xs font-normal uppercase tracking-[0.14em] text-wine">Now</span> : null}
                </p>
                {date && state !== "upcoming" ? <p className="mt-1 text-xs text-ink/50">{formatOrderWhen(date)}</p> : null}
              </div>
            </li>
          );
        })}
        {cancelled ? (
          <li className="grid grid-cols-[1.35rem_minmax(0,1fr)] gap-4">
            <div className="flex flex-col items-center">
              <span className="mt-1 h-6 w-px bg-ink" />
              <span className="size-3.5 shrink-0 rounded-full bg-wine" />
            </div>
            <div className="pt-5">
              <p className="text-sm font-medium text-ink">{statusLabel(order.status)}</p>
              <p className="mt-1 text-xs text-ink/50">
                {formatOrderWhen(order.cancelledAt ?? dates.get(order.status))}
                {order.cancelReason ? ` · ${order.cancelReason}` : ""}
              </p>
            </div>
          </li>
        ) : null}
      </ol>
    </div>
  );
}