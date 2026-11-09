"use client";

import { Info } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

const MARGIN = 16;

export function InfoTip({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<{ left: number; top: number } | null>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const tipId = useId();

  useLayoutEffect(() => {
    if (!open) {
      setBox(null);
      return;
    }
    const place = () => {
      const tip = tipRef.current;
      const root = rootRef.current;
      if (!tip || !root) return;
      const button = root.getBoundingClientRect();
      const width = tip.offsetWidth;
      const height = tip.offsetHeight;
      let left = button.left;
      if (left + width > window.innerWidth - MARGIN) left = window.innerWidth - MARGIN - width;
      if (left < MARGIN) left = MARGIN;
      let top = button.bottom + 4;
      if (top + height > window.innerHeight - MARGIN && button.top - height - 4 >= MARGIN) {
        top = button.top - height - 4;
      }
      setBox({ left, top });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, text]);

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span className="relative inline-flex" ref={rootRef}>
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted"
        aria-expanded={open}
        aria-controls={tipId}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
      >
        <Info size={16} />
      </button>
      {open ? (
        <span
          ref={tipRef}
          id={tipId}
          role="note"
          className="fixed z-50 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-line bg-surface p-3 text-sm leading-5 text-ink shadow-sm"
          style={{ left: box?.left ?? 0, top: box?.top ?? 0, visibility: box ? "visible" : "hidden" }}
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
