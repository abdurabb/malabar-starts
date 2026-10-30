"use client";

import { Children, useLayoutEffect, useRef, useState, type ReactNode } from "react";

export function CardCarousel({
  label,
  heading,
  action,
  note,
  children,
}: {
  label: string;
  heading: ReactNode;
  action: ReactNode;
  note?: ReactNode;
  children?: ReactNode;
}) {
  const scroller = useRef<HTMLUListElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useLayoutEffect(() => {
    const node = scroller.current;
    if (!node) return;

    function measure() {
      if (!node) return;
      const max = node.scrollWidth - node.clientWidth;
      setOverflow(max > 2);
      setCanPrev(node.scrollLeft > 2);
      setCanNext(node.scrollLeft < max - 2);
    }

    measure();
    node.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => {
      node.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [children]);

  function move(direction: -1 | 1) {
    const node = scroller.current;
    if (!node) return;
    const slides = Array.from(node.querySelectorAll<HTMLElement>(":scope > li"));
    const first = slides[0];
    if (!first) return;
    const width = first.getBoundingClientRect().width;
    const stride = slides[1] ? slides[1].offsetLeft - first.offsetLeft : width;
    const visible = Math.max(1, Math.round(node.clientWidth / stride));
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    const max = node.scrollWidth - node.clientWidth;
    const left = Math.min(max, Math.max(0, node.scrollLeft + direction * stride * visible));
    node.scrollTo({ left, behavior });
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        {heading}
        <div className="flex w-full items-center justify-end gap-2 md:w-auto">
          {overflow ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label={`Previous ${label}`}
                disabled={!canPrev}
                onClick={() => move(-1)}
                className="inline-flex size-9 items-center justify-center rounded-full border border-ink/15 bg-paper text-ink transition-colors hover:border-wine hover:text-wine disabled:opacity-35"
              >
                <Chevron direction="left" />
              </button>
              <button
                type="button"
                aria-label={`Next ${label}`}
                disabled={!canNext}
                onClick={() => move(1)}
                className="inline-flex size-9 items-center justify-center rounded-full border border-ink/15 bg-paper text-ink transition-colors hover:border-wine hover:text-wine disabled:opacity-35"
              >
                <Chevron direction="right" />
              </button>
            </div>
          ) : null}
          {action}
        </div>
      </div>
      {note ? <div className="mt-10 text-sm text-ink/60">{note}</div> : null}
      {Children.count(children) > 0 ? (
        <ul
          ref={scroller}
          aria-label={label}
          className="relative mt-12 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </ul>
      ) : null}
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={direction === "left" ? "M14 6 8 12l6 6" : "M10 6l6 6-6 6"} />
    </svg>
  );
}
