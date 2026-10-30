"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export const controlClass =
  "h-12 w-full appearance-none rounded-full border border-ink/10 bg-ivory px-4 text-sm text-ink outline-none transition hover:border-wine/35 focus:border-wine";

export function FilterLabel({ children }: { children: ReactNode }) {
  return <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.16em] text-ink/45">{children}</span>;
}

export type FilterOption = {
  value: string;
  label: string;
};

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [box, setBox] = useState({ top: 0, left: 0, width: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    function place() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.max(rect.width, 240);
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
      const estimated = Math.min(280, options.length * 48 + 16);
      const below = window.innerHeight - rect.bottom;
      const top = below < estimated + 16 && rect.top > below ? Math.max(12, rect.top - estimated - 8) : rect.bottom + 8;
      setBox({ top, left, width });
    }
    place();
    function onPointer(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, options.length]);

  function choose(next: string) {
    onChange(next);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
    setOpen(true);
  }

  const menu =
    open && typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-label={label}
            style={{ top: box.top, left: box.left, width: box.width }}
            className="fixed z-[80] max-h-72 overflow-auto rounded-[1.35rem] border border-ink/10 bg-[#fffdf8] p-2 shadow-[0_18px_50px_rgba(42,33,28,0.16)]"
          >
            {options.map((option, index) => {
              const active = option.value === value;
              const highlighted = index === activeIndex;
              return (
                <li key={`${option.value}-${option.label}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(option.value)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                      active || highlighted ? "bg-blush text-ink" : "text-ink hover:bg-ivory"
                    }`}
                  >
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-full ${
                        active ? "bg-wine text-white" : "border border-ink/15 bg-paper"
                      }`}
                    >
                      {active ? (
                        <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M5 12.5 9.2 17 19 7" />
                        </svg>
                      ) : null}
                    </span>
                    <span className={active ? "font-medium text-wine" : ""}>{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative min-w-0">
      <FilterLabel>{label}</FilterLabel>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!open) toggle();
            else setActiveIndex((index) => Math.min(options.length - 1, index + 1));
          }
          if (event.key === "ArrowUp" && open) {
            event.preventDefault();
            setActiveIndex((index) => Math.max(0, index - 1));
          }
          if (event.key === "Enter" && open) {
            event.preventDefault();
            const option = options[activeIndex];
            if (option) choose(option.value);
          }
          if (event.key === "Escape") setOpen(false);
        }}
        className={`${controlClass} flex cursor-pointer items-center justify-between gap-3 pr-4 text-left`}
      >
        <span className="truncate">{selected?.label ?? "Choose"}</span>
        <svg
          viewBox="0 0 24 24"
          className={`size-4 shrink-0 text-wine transition ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {menu}
    </div>
  );
}

export function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <FilterLabel>{label}</FilterLabel>
      <div className="flex h-12 items-center gap-1 rounded-full bg-[#f3e6d4] p-1" role="group" aria-label={label}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`h-10 min-w-0 flex-1 whitespace-nowrap rounded-full px-2 text-xs transition sm:px-3 sm:text-sm ${
                selected ? "bg-wine text-white shadow-sm" : "text-ink/70 hover:bg-paper/70"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
