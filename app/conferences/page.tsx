import type { Metadata } from "next";
import Link from "next/link";
import { loadSeason } from "@/lib/load";

export const metadata: Metadata = {
  title: "Conferences",
  description: "FBS conference standings for the 2026 season.",
};

export default function ConferencesPage() {
  const data = loadSeason();
  return (
    <>
      <h1 className="text-5xl">Conferences</h1>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {data.conferences.map((conference) => (
          <li key={conference.id}>
            <Link className="flex min-h-11 items-center justify-between rounded-md border border-line bg-surface px-4" href={`/conferences/${conference.id}`}>
              <span>{conference.name}</span>
              <span className="text-sm text-muted">{conference.teams.length} teams</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
