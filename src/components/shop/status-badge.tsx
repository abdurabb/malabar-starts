import { orderStatusChoices, orderStatusClass, paymentStatusChoices, paymentStatusClass, statusLabel } from "@/types/status";

export function StatusBadge({ status, kind = "order" }: { status: string; kind?: "order" | "payment" }) {
  const choices = kind === "payment" ? paymentStatusChoices() : orderStatusChoices();
  const known = choices.find((item) => item.value === status);
  const tone = kind === "payment" ? paymentStatusClass(status) : orderStatusClass(status);
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${tone}`}>
      {known?.label ?? statusLabel(status)}
    </span>
  );
}
