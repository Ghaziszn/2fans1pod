"use client";

import { Info } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export function InfoTip({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
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
          id={tipId}
          role="note"
          className="absolute left-0 top-11 z-30 w-64 rounded-md border border-line bg-surface p-3 text-sm leading-5 text-ink shadow-sm"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
