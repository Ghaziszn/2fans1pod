"use client";

import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchEntries } from "@/lib/load";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const fuse = useMemo(
    () =>
      new Fuse(searchEntries, {
        keys: ["name", "aliases", "detail"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [],
  );
  const results = query.trim() ? fuse.search(query).slice(0, 8).map((row) => row.item) : searchEntries.filter((entry) => entry.type === "page").slice(0, 5);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="mx-auto mt-[10vh] max-w-xl overflow-hidden rounded-lg border border-line bg-surface shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((value) => Math.min(value + 1, results.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((value) => Math.max(value - 1, 0));
            } else if (event.key === "Enter" && results[active]) {
              go(results[active].href);
            } else if (event.key === "Escape") {
              onClose();
            }
          }}
          placeholder="Teams, conferences, or pages"
          className="w-full border-b border-line bg-transparent px-4 py-4 text-base outline-none"
        />
        <ul className="max-h-80 overflow-auto py-2">
          {results.map((result, index) => (
            <li key={result.href + result.name}>
              <button
                type="button"
                className={`flex min-h-11 w-full items-center justify-between px-4 text-left ${index === active ? "bg-paper" : ""}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(result.href)}
              >
                <span>{result.name}</span>
                <span className="text-sm text-muted">{result.detail}</span>
              </button>
            </li>
          ))}
          {results.length === 0 ? <li className="px-4 py-6 text-sm text-muted">No matches.</li> : null}
        </ul>
      </div>
    </div>
  );
}
