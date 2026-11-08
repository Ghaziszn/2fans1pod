"use client";

import type { ReactNode } from "react";
import { TeamMark, teamInk } from "@/components/team/TeamMark";
import type { BracketSlot, Team } from "@/lib/cfp/types";

const LATER: Record<string, string[]> = {
  "r1-8-9": ["qf-1", "sf-1", "final"],
  "r1-5-12": ["qf-4", "sf-1", "final"],
  "r1-7-10": ["qf-2", "sf-2", "final"],
  "r1-6-11": ["qf-3", "sf-2", "final"],
  "qf-1": ["sf-1", "final"],
  "qf-4": ["sf-1", "final"],
  "qf-2": ["sf-2", "final"],
  "qf-3": ["sf-2", "final"],
  "sf-1": ["final"],
  "sf-2": ["final"],
};

const ROW = 34;
const MATCH = ROW * 2;
const PAIR_GAP = 32;
const GAME_W = 124;
const LINE = "var(--ink)";

export function laterPlayoffSlots(slotId: string) {
  return LATER[slotId] ?? [];
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
  const byId = new Map(slots.map((slot) => [slot.id, slot]));
  const match = (id: string) => {
    const slot = byId.get(id);
    return slot ? <Match slot={slot} teams={teams} onPick={onPick} /> : <div style={{ width: GAME_W, height: MATCH }} />;
  };
  const finalSlot = byId.get("final");
  const champion = finalSlot?.winnerId ? teams.get(finalSlot.winnerId) : undefined;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-3xl">Play the bracket</h2>
        <p className="text-sm text-muted">Tap a team to send them on. Seeds 1–4 have a bye into the quarterfinals.</p>
      </div>

      <PhoneBracket slots={slots} teams={teams} onPick={onPick} />

      <div className="mt-2 hidden overflow-x-auto pb-16 pt-7 md:block">
        <div className="flex w-max min-w-full items-center justify-center">
          <Half side="left" match={match} />
          <GameElbow toward="right" />
          <div className="relative shrink-0">
            <p className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.16em] text-muted">
              Championship
            </p>
            {match("final")}
            {champion ? <Champion team={champion} /> : null}
          </div>
          <GameElbow toward="left" />
          <Half side="right" match={match} />
        </div>
      </div>
    </section>
  );
}

function Half({ side, match }: { side: "left" | "right"; match: (id: string) => ReactNode }) {
  const top = side === "left" ? ["r1-8-9", "qf-1"] : ["r1-7-10", "qf-2"];
  const bottom = side === "left" ? ["r1-5-12", "qf-4"] : ["r1-6-11", "qf-3"];
  const semi = side === "left" ? "sf-1" : "sf-2";
  const chain = (r1: string, qf: string) =>
    side === "left" ? (
      <div className="flex items-center">
        {match(r1)}
        <GameElbow toward="right" />
        {match(qf)}
      </div>
    ) : (
      <div className="flex items-center">
        {match(qf)}
        <GameElbow toward="left" />
        {match(r1)}
      </div>
    );

  const games = (
    <div className="flex flex-col" style={{ gap: PAIR_GAP }}>
      {chain(top[0], top[1])}
      {chain(bottom[0], bottom[1])}
    </div>
  );

  return side === "left" ? (
    <div className="flex items-center">
      {games}
      <PairElbow toward="right" />
      {match(semi)}
    </div>
  ) : (
    <div className="flex items-center">
      {match(semi)}
      <PairElbow toward="left" />
      {games}
    </div>
  );
}

function GameElbow({ toward }: { toward: "left" | "right" }) {
  const top = ROW / 2 - 1;
  return (
    <div className="relative shrink-0" style={{ width: 22, height: MATCH }}>
      <div
        className="absolute"
        style={{
          top,
          height: ROW + 2,
          width: 12,
          borderTop: `2px solid ${LINE}`,
          borderBottom: `2px solid ${LINE}`,
          ...(toward === "right"
            ? { left: 0, borderRight: `2px solid ${LINE}` }
            : { right: 0, borderLeft: `2px solid ${LINE}` }),
        }}
      />
      <div
        className="absolute h-0.5"
        style={{
          top: MATCH / 2 - 1,
          width: 10,
          background: LINE,
          ...(toward === "right" ? { left: 12 } : { right: 12 }),
        }}
      />
    </div>
  );
}

function PairElbow({ toward }: { toward: "left" | "right" }) {
  const top = MATCH / 2 - 1;
  const span = MATCH + PAIR_GAP;
  return (
    <div className="relative shrink-0 self-stretch" style={{ width: 26 }}>
      <div
        className="absolute"
        style={{
          top,
          height: span + 2,
          width: 14,
          borderTop: `2px solid ${LINE}`,
          borderBottom: `2px solid ${LINE}`,
          ...(toward === "right"
            ? { left: 0, borderRight: `2px solid ${LINE}` }
            : { right: 0, borderLeft: `2px solid ${LINE}` }),
        }}
      />
      <div
        className="absolute h-0.5"
        style={{
          top: top + (span + 2) / 2 - 1,
          width: 12,
          background: LINE,
          ...(toward === "right" ? { left: 14 } : { right: 14 }),
        }}
      />
    </div>
  );
}

const ROUNDS = ["First round", "Quarterfinal", "Semifinal", "Championship"] as const;

function PhoneBracket({
  slots,
  teams,
  onPick,
}: {
  slots: BracketSlot[];
  teams: Map<string, Team>;
  onPick: (slotId: string, teamId: string) => void;
}) {
  const byes = slots
    .filter((slot) => slot.round === "Quarterfinal")
    .map((slot) => {
      const aIsBye = (slot.seedA ?? 99) <= 4;
      return { id: aIsBye ? slot.teamA : slot.teamB, seed: aIsBye ? slot.seedA : slot.seedB };
    })
    .filter((bye): bye is { id: string; seed: number | null } => Boolean(bye.id))
    .sort((a, b) => (a.seed ?? 99) - (b.seed ?? 99));
  const champion = slots.find((slot) => slot.id === "final");
  const champTeam = champion?.winnerId ? teams.get(champion.winnerId) : undefined;

  return (
    <div className="mt-4 grid gap-6 md:hidden">
      <section>
        <h3 className="text-sm uppercase tracking-wide text-muted">Byes</h3>
        <ul className="mt-2 grid gap-2">
          {byes.map((bye) => (
            <li key={bye.id} className="flex min-h-11 items-center rounded-md border border-line bg-surface px-3">
              <TeamMark team={teams.get(bye.id)} seed={bye.seed} />
              <span className="ml-auto text-xs uppercase tracking-wide text-muted">Bye</span>
            </li>
          ))}
        </ul>
      </section>
      {ROUNDS.map((round) => (
        <section key={round}>
          <h3 className="text-sm uppercase tracking-wide text-muted">{round}</h3>
          <ul className="mt-2 grid gap-3">
            {slots
              .filter((slot) => slot.round === round)
              .slice()
              .sort((a, b) => Math.min(a.seedA ?? 99, a.seedB ?? 99) - Math.min(b.seedA ?? 99, b.seedB ?? 99))
              .map((slot) => (
                <li key={slot.id}>
                  <PhoneGame slot={slot} teams={teams} onPick={onPick} />
                </li>
              ))}
          </ul>
        </section>
      ))}
      {champTeam ? (
        <p className="text-lg">
          Champion: <span className="font-medium">{champTeam.school}</span>
        </p>
      ) : null}
    </div>
  );
}

function PhoneGame({
  slot,
  teams,
  onPick,
}: {
  slot: BracketSlot;
  teams: Map<string, Team>;
  onPick: (slotId: string, teamId: string) => void;
}) {
  const sides = [
    { id: slot.teamA, seed: slot.seedA },
    { id: slot.teamB, seed: slot.seedB },
  ].filter((side): side is { id: string; seed: number | null } => Boolean(side.id));

  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface">
      {sides.map((side) => {
        const team = teams.get(side.id);
        const selected = slot.winnerId === side.id;
        const ink = team ? teamInk(team.color) : "#16181d";
        return (
          <button
            key={side.id}
            type="button"
            aria-pressed={selected}
            aria-label={`${team?.school ?? side.id}, seed ${side.seed ?? ""}`}
            className="flex min-h-11 w-full items-center gap-2 px-3 text-left"
            style={{
              background: selected && team ? team.color : "transparent",
              color: selected ? ink : "var(--ink)",
            }}
            onClick={() => onPick(slot.id, side.id)}
          >
            <span className="nums w-5 shrink-0 text-xs">{side.seed ?? "–"}</span>
            {team?.logo ? <img src={team.logo} alt="" className="h-6 w-6 shrink-0 bg-white object-contain" /> : null}
            <span className="min-w-0 flex-1 truncate font-medium">{team?.school ?? side.id}</span>
          </button>
        );
      })}
      <p className="border-t border-line px-3 py-2 text-xs text-muted">{slot.venueNote}</p>
    </div>
  );
}

function Match({
  slot,
  teams,
  onPick,
}: {
  slot: BracketSlot;
  teams: Map<string, Team>;
  onPick: (slotId: string, teamId: string) => void;
}) {
  const sides = [
    { id: slot.teamA, team: slot.teamA ? teams.get(slot.teamA) : undefined, seed: slot.seedA },
    { id: slot.teamB, team: slot.teamB ? teams.get(slot.teamB) : undefined, seed: slot.seedB },
  ].filter((side) => side.id);

  return (
    <div className="shrink-0 overflow-hidden bg-surface" style={{ width: GAME_W, height: MATCH, outline: `1px solid ${LINE}` }}>
      {sides.map((side, index) => {
        const selected = slot.winnerId === side.id;
        const ink = side.team ? teamInk(side.team.color) : "#16181d";
        return (
          <button
            key={side.id}
            type="button"
            aria-pressed={selected}
            aria-label={`${side.team?.school ?? side.id}, seed ${side.seed ?? ""}`}
            className="flex w-full items-center gap-1.5 px-1.5 text-left"
            style={{
              height: sides.length === 1 ? MATCH : ROW,
              background: selected && side.team ? side.team.color : "transparent",
              color: selected ? ink : "var(--ink)",
              opacity: selected ? 1 : 0.45,
              boxShadow: index > 0 ? `inset 0 1px 0 ${LINE}` : undefined,
            }}
            onClick={() => onPick(slot.id, side.id as string)}
          >
            <span className="nums w-3.5 shrink-0 text-center text-[10px] font-semibold">{side.seed ?? "–"}</span>
            {side.team?.logo ? <img src={side.team.logo} alt="" className="h-4 w-4 shrink-0 bg-white object-contain" /> : null}
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium leading-none">{side.team?.school ?? side.id}</span>
          </button>
        );
      })}
    </div>
  );
}

function Champion({ team }: { team: Team }) {
  const ink = teamInk(team.color);
  return (
    <div className="absolute left-1/2 top-[calc(100%+10px)] flex w-max -translate-x-1/2 flex-col items-center gap-1">
      <div className="flex w-max items-center gap-1.5 whitespace-nowrap px-2" style={{ background: team.color, color: ink, height: 28 }}>
        {team.logo ? <img src={team.logo} alt="" className="h-4 w-4 shrink-0 bg-white object-contain" /> : null}
        <span className="text-xs font-semibold">{team.school}</span>
      </div>
      <span className="text-[10px] uppercase tracking-[0.16em] text-muted">Champion</span>
    </div>
  );
}
