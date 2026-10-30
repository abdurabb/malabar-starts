import { ProductMedia } from "@/components/shop/product-card";
import { StarPicker } from "@/components/shop/star-rating";

export type ReviewProductChoice = {
  id: string;
  name: string;
  image: string | null;
};

export function ReviewComposer({
  rating,
  comment,
  busy,
  error,
  submitLabel,
  onRating,
  onComment,
  onSubmit,
  onCancel,
  products,
  productId,
  onProduct,
}: {
  rating: number;
  comment: string;
  busy: boolean;
  error: string;
  submitLabel: string;
  onRating: (value: number) => void;
  onComment: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  products?: ReviewProductChoice[];
  productId?: string;
  onProduct?: (id: string) => void;
}) {
  const length = comment.trim().length;
  const choices = products ?? [];

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {choices.length > 1 ? (
        <div>
          <p className="text-sm text-ink/70">Product</p>
          <div className="mt-2 grid gap-2">
            {choices.map((product) => {
              const selected = product.id === productId;
              return (
                <button
                  key={product.id}
                  type="button"
                  aria-pressed={selected}
                  disabled={busy}
                  onClick={() => onProduct?.(product.id)}
                  className={`flex items-center gap-3 rounded-2xl border p-2 text-left ${
                    selected ? "border-wine bg-blush" : "border-ink/10 bg-ivory"
                  }`}
                >
                  <ProductMedia src={product.image} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
                  <span className="font-display text-xl tracking-tight">{product.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {choices.length === 1 ? (
        <p className="text-sm text-ink/70">
          Product <span className="text-ink">{choices[0]?.name}</span>
        </p>
      ) : null}
      <div>
        <p className="text-sm text-ink/70">Rating</p>
        <div className="mt-1">
          <StarPicker value={rating} onChange={onRating} disabled={busy} />
        </div>
      </div>
      <label className="block text-sm text-ink/70">
        Comment
        <textarea
          value={comment}
          onChange={(event) => onComment(event.target.value)}
          rows={4}
          maxLength={1000}
          disabled={busy}
          placeholder="Optional. What should the next customer know?"
          className="mt-2 w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3 text-sm text-ink outline-none focus:border-wine disabled:opacity-60"
        />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={`text-xs ${length === 1 ? "text-wine" : "text-ink/45"}`}>{length}/1000</p>
        <div className="flex gap-2">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="h-11 rounded-full border border-ink/15 px-4 text-sm disabled:opacity-40"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="h-11 rounded-full bg-wine px-5 text-sm text-white transition hover:bg-wine-deep disabled:opacity-40"
          >
            {submitLabel}
          </button>
        </div>
      </div>
      {error ? <p className="text-sm text-wine">{error}</p> : null}
    </form>
  );
}
