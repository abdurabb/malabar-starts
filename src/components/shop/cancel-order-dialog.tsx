"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { cancelReasonError } from "@/lib/orders";

export function CancelOrderDialog({
  orderNumber,
  busy,
  onClose,
  onConfirm,
}: {
  orderNumber: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCloseRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [busy]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const issue = cancelReasonError(reason);
    if (issue) {
      setError(issue);
      return;
    }
    onConfirm(reason.trim());
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Keep order"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={() => {
          if (!busy) onClose();
        }}
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={submit}
        className="relative w-full max-w-md rounded-[1.75rem] bg-paper p-6 shadow-2xl sm:p-7"
      >
        <p className="text-xs uppercase tracking-[0.16em] text-wine">Cancel order</p>
        <h2 id={titleId} className="page-title mt-2">
          Cancel {orderNumber}?
        </h2>
        <p className="page-body text-ink/70">Tell us why. This note stays on the order.</p>
        <label className="mt-4 block text-sm text-ink/70">
          Reason
          <textarea
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError("");
            }}
            rows={4}
            maxLength={300}
            autoFocus
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3 text-sm outline-none focus:border-wine"
          />
        </label>
        <p className={`mt-2 text-xs ${reason.trim().length > 0 && reason.trim().length < 2 ? "text-wine" : "text-ink/45"}`}>
          {reason.trim().length}/300
        </p>
        {error ? <p className="mt-2 text-sm text-wine">{error}</p> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-12 rounded-full border border-ink/15 px-5 text-sm disabled:opacity-40"
          >
            Keep order
          </button>
          <button
            type="submit"
            disabled={busy}
            className="h-12 rounded-full bg-wine px-5 text-sm text-white transition hover:bg-wine-deep disabled:opacity-40"
          >
            {busy ? "Cancelling…" : "Cancel order"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
