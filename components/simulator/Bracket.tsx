"use client";

import Link from "next/link";
import type { BracketSlot, Team } from "@/lib/cfp/types";

function TeamLine({ team, seed }: { team: Team | undefined; seed: number | null }) {
  if (!team) return <span className="text-muted">Bye</span>;
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="nums w-5 text-xs text-muted">{seed ?? ""}</span>
      <span className="h-4 w-1 rounded-sm" style={{ background: team.color }} />
      <span className="truncate">{team.school}</span>
    </span>
  );
}

export function Bracket({
  slots,
  teams,
  onPick,
}: {
  slots: BracketSlot[];
  teams: Map<string, Team>;
  onPick: (slotId: string, teamId: string) => void;
}) {
  const rounds = ["First round", "Quarterfinal", "Semifinal", "Championship"] as const;
  return (
    <section className="mt-8">
      <h2 className="text-3xl">Bracket</h2>
      <p className="mt-2 text-sm text-muted">Seeds 1–4 have a bye. Tap a team to advance them. The better seed wins until you pick.</p>
      <div className="mt-4 grid gap-6 min-[1100px]:grid-cols-4">
        {rounds.map((round) => (
          <div key={round}>
            <h3 className="mb-2 text-sm uppercase tracking-wide text-muted">{round}</h3>
            <div className="grid gap-3">
              {slots
                .filter((slot) => slot.round === round)
                .map((slot) => {
                  const teamA = slot.teamA ? teams.get(slot.teamA) : undefined;
                  const teamB = slot.teamB ? teams.get(slot.teamB) : undefined;
                  const pair = teamA && teamB ? `/matchup/${teamA.id}-vs-${teamB.id}` : null;
                  return (
                    <article key={slot.id} className="rounded-md border border-line bg-surface p-3">
                      {[
                        [slot.teamA, teamA, slot.seedA],
                        [slot.teamB, teamB, slot.seedB],
                      ].map(([id, team, seed]) =>
                        id ? (
                          <button
                            key={String(id)}
                            type="button"
                            className={`flex min-h-11 w-full items-center rounded px-1 text-left ${slot.winnerId === id ? "bg-paper font-medium" : "text-muted"}`}
                            onClick={() => onPick(slot.id, String(id))}
                          >
                            <TeamLine team={team as Team | undefined} seed={seed as number | null} />
                          </button>
                        ) : null,
                      )}
                      <p className="mt-1 text-xs text-muted">{slot.venueNote}</p>
                      {pair ? (
                        <Link href={pair} className="mt-1 inline-flex min-h-11 items-center text-sm underline">
                          Open matchup
                        </Link>
                      ) : null}
                    </article>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
