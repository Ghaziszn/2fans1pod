"use client";

import { useEffect, useState } from "react";
import { MatchupView } from "@/components/matchup/MatchupView";

export default function NotFound() {
  const [path, setPath] = useState<string | null>(null);
  useEffect(() => setPath(window.location.pathname), []);
  if (path == null) return null;
  if (path.startsWith("/matchup/")) {
    return <MatchupView />;
  }
  return (
    <>
      <h1 className="text-5xl">Page not found</h1>
      <p className="mt-3 text-muted">That address is not on this site.</p>
    </>
  );
}
