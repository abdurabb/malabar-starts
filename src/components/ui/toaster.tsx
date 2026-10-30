"use client";

import { useEffect, useState } from "react";

export function Toaster() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer = 0;

    function onToast(event: Event) {
      setMessage((event as CustomEvent<string>).detail);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMessage(null), 2800);
    }

    window.addEventListener("malabar-toast", onToast);
    return () => {
      window.removeEventListener("malabar-toast", onToast);
      window.clearTimeout(timer);
    };
  }, []);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-ink/10 bg-paper px-4 py-2 text-sm text-ink shadow-[0_12px_40px_-24px_rgba(42,33,28,0.45)]"
    >
      {message}
    </div>
  );
}
