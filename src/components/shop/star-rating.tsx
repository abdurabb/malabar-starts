function StarIcon({ filled, className }: { filled: boolean; className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3.2 14.5 8.8 20.6 9.5 16.1 13.7 17.4 19.7 12 16.7 6.6 19.7 7.9 13.7 3.4 9.5 9.5 8.8 12 3.2Z" />
    </svg>
  );
}

export function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const whole = Math.max(0, Math.min(5, Math.round(rating)));
  const icon = size === "sm" ? "size-3 sm:size-3.5" : "size-5";
  const label = Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
  return (
    <span className="inline-flex items-center gap-px text-wine sm:gap-0.5" aria-label={`${label} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= whole ? "text-wine" : "text-ink/20"}>
          <StarIcon filled={star <= whole} className={icon} />
        </span>
      ))}
    </span>
  );
}

export function StarPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="Rating" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const selected = star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            disabled={disabled}
            onClick={() => onChange(star)}
            className={`rounded-full p-1 transition ${selected ? "text-wine" : "text-ink/25 hover:text-wine"} disabled:opacity-40`}
          >
            <StarIcon filled={selected} className="size-5" />
          </button>
        );
      })}
    </div>
  );
}
