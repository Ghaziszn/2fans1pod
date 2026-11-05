"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { InfoTip } from "@/components/info/InfoTip";

const STORAGE_KEY = "2fans1pod-gt";

const GarbageTimeContext = createContext({ include: false, ready: false, setInclude: (_value: boolean) => {} });

export function GarbageTimeProvider({ children }: { children: ReactNode }) {
  const [include, setIncludeState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("gt");
    if (param === "1") setIncludeState(true);
    else if (param === "0") setIncludeState(false);
    else {
      try {
        setIncludeState(window.localStorage.getItem(STORAGE_KEY) === "1");
      } catch {
        setIncludeState(false);
      }
    }
    setReady(true);
  }, []);

  const setInclude = (value: boolean) => {
    setIncludeState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      // A private browser can block storage. The URL still carries the choice.
    }
    const url = new URL(window.location.href);
    if (value) url.searchParams.set("gt", "1");
    else url.searchParams.delete("gt");
    window.history.replaceState(null, "", url);
  };

  return <GarbageTimeContext.Provider value={{ include, ready, setInclude }}>{children}</GarbageTimeContext.Provider>;
}

export function useGarbageTime() {
  return useContext(GarbageTimeContext);
}

export function GarbageTimeToggle() {
  const { include, setInclude } = useGarbageTime();
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="min-h-11 rounded-full border border-line px-4 text-sm"
        aria-pressed={include}
        onClick={() => setInclude(!include)}
      >
        Garbage time {include ? "included" : "excluded"}
      </button>
      <InfoTip
        label="What garbage time means"
        text="Garbage time is the part of a game after the result is decided. Those plays are less competitive, so the default leaves them out. Turn this on to count every play. A shared link keeps the choice with ?gt=1. Box-score totals such as yards per game always include every play, because that feed does not split them."
      />
    </div>
  );
}
