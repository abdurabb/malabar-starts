"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ConfirmRequest = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
};

type PendingConfirm = ConfirmRequest & {
  resolve: (value: boolean) => void;
};

export function ConfirmDialog({
  request,
  onConfirm,
  onCancel,
}: {
  request: ConfirmRequest;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancelRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!mounted) return null;

  const danger = request.tone === "danger";

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button type="button" aria-label="Cancel" className="absolute inset-0 cursor-pointer bg-ink/40" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-[1.75rem] bg-paper p-6 shadow-2xl sm:p-7"
      >
        <p className="text-xs uppercase tracking-[0.16em] text-wine">{danger ? "Please confirm" : "Confirm"}</p>
        <h2 id={titleId} className="page-title mt-2">
          {request.title}
        </h2>
        <p className="page-body text-ink/70">{request.message}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-12 cursor-pointer rounded-full border border-ink/15 px-5 text-sm"
          >
            {request.cancelLabel ?? "Cancel"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 cursor-pointer rounded-full bg-wine px-5 text-sm text-white transition hover:bg-wine-deep"
          >
            {request.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function useConfirm() {
  const [request, setRequest] = useState<PendingConfirm | null>(null);
  const requestRef = useRef<PendingConfirm | null>(null);

  useEffect(() => {
    return () => {
      requestRef.current?.resolve(false);
    };
  }, []);

  function confirm(options: ConfirmRequest) {
    requestRef.current?.resolve(false);
    return new Promise<boolean>((resolve) => {
      const next = { ...options, resolve };
      requestRef.current = next;
      setRequest(next);
    });
  }

  function finish(value: boolean) {
    const current = requestRef.current;
    if (!current) return;
    requestRef.current = null;
    current.resolve(value);
    setRequest(null);
  }

  const dialog = request ? (
    <ConfirmDialog request={request} onConfirm={() => finish(true)} onCancel={() => finish(false)} />
  ) : null;

  return { confirm, dialog };
}
