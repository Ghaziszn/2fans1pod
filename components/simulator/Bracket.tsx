"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { teamInk } from "@/components/team/TeamMark";
import type { BracketSlot, Team } from "@/lib/cfp/types";
import { matchupSlug } from "@/lib/load";

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

const PHONE_ROUNDS = [
  { id: "First round", short: "First", help: "Tap who wins. The higher seed is filled in until you change it." },
  { id: "Quarterfinal", short: "Quarters", help: "Seeds 1 through 4 are already here. The other team won a first-round game." },
  { id: "Semifinal", short: "Semis", help: "Two games. The winners play for the title." },
  { id: "Championship", short: "Title", help: "One game. The winner is the champion." },
] as const;

function gamesInRound(slots: BracketSlot[], round: BracketSlot["round"]) {
  const games = slots
    .filter((slot) => slot.round === round)
    .slice()
    .sort((a, b) => Math.min(a.seedA ?? 99, a.seedB ?? 99) - Math.min(b.seedA ?? 99, b.seedB ?? 99));
  // The first first-round game feeds the 4 seed, so show that quarterfinal first.
  if (round === "Quarterfinal") games.reverse();
  return games;
}

function PhoneBracket({
  slots,
  teams,
  onPick,
}: {
  slots: BracketSlot[];
  teams: Map<string, Team>;
  onPick: (slotId: string, teamId: string) => void;
}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(64);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const measure = () => setHeaderHeight(Math.ceil(header.getBoundingClientRect().height));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  const round = PHONE_ROUNDS[roundIndex];
  const games = gamesInRound(slots, round.id);
  const champTeam = slots.find((slot) => slot.id === "final")?.winnerId;
  const champion = champTeam ? teams.get(champTeam) : undefined;
  const byes = slots
    .filter((slot) => slot.round === "Quarterfinal")
    .map((slot) => {
      const aIsBye = (slot.seedA ?? 99) <= 4;
      const id = aIsBye ? slot.teamA : slot.teamB;
      const seed = aIsBye ? slot.seedA : slot.seedB;
      return id ? `${seed} ${teams.get(id)?.school ?? id}` : "";
    })
    .filter(Boolean)
    .sort();

  const go = (index: number) => {
    setRoundIndex(index);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => listRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" }));
  };

  return (
    <div className="md:hidden">
      <div className="sticky z-30 -mx-[clamp(16px,4vw,40px)] border-b border-line bg-paper px-[clamp(16px,4vw,40px)] py-2" style={{ top: headerHeight }}>
        <div className="grid grid-cols-4 gap-1" role="tablist" aria-label="Playoff rounds">
          {PHONE_ROUNDS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === roundIndex}
              className={`min-h-11 rounded-md px-1 text-sm font-medium ${index === roundIndex ? "bg-accent text-accent-ink" : "text-muted"}`}
              onClick={() => go(index)}
            >
              {item.short}
            </button>
          ))}
        </div>
      </div>
      <div ref={listRef} className="pt-4" style={{ scrollMarginTop: headerHeight + 72 }}>
        <p className="text-sm text-muted">{round.help}</p>
        {round.id === "Quarterfinal" ? <p className="mt-2 text-sm text-muted">Byes: {byes.join(", ")}.</p> : null}
        <ul className="mt-3 grid gap-4">
          {games.map((slot) => (
            <li key={slot.id}>
              <PhoneGame slot={slot} slots={slots} teams={teams} onPick={onPick} />
            </li>
          ))}
        </ul>
        {round.id === "Championship" && champion ? <ChampionCard team={champion} /> : null}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" className="min-h-11 rounded-full border border-line px-3 text-sm font-medium disabled:opacity-40" disabled={roundIndex === 0} onClick={() => go(roundIndex - 1)}>
            {roundIndex === 0 ? "First" : PHONE_ROUNDS[roundIndex - 1].short}
          </button>
          <button type="button" className="min-h-11 rounded-full bg-accent px-3 text-sm font-medium text-accent-ink disabled:opacity-40" disabled={roundIndex === PHONE_ROUNDS.length - 1} onClick={() => go(roundIndex + 1)}>
            {roundIndex === PHONE_ROUNDS.length - 1 ? "Title" : `Next: ${PHONE_ROUNDS[roundIndex + 1].short}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function sideNote(selected: boolean, round: BracketSlot["round"], seed: number | null) {
  if (selected) return round === "Championship" ? "Champion" : "Moves on";
  if (round === "Quarterfinal" && (seed ?? 99) <= 4) return "Bye";
  if (round === "Quarterfinal") return "Advanced";
  return "";
}

function nextOpponent(slot: BracketSlot, slots: BracketSlot[]) {
  const nextId = LATER[slot.id]?.[0];
  const next = nextId ? slots.find((item) => item.id === nextId) : undefined;
  if (!next || !slot.winnerId) return null;
  if (next.teamA === slot.winnerId) return next.teamB;
  if (next.teamB === slot.winnerId) return next.teamA;
  return null;
}

function PhoneGame({
  slot,
  slots,
  teams,
  onPick,
}: {
  slot: BracketSlot;
  slots: BracketSlot[];
  teams: Map<string, Team>;
  onPick: (slotId: string, teamId: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const sides = [
    { id: slot.teamA, seed: slot.seedA },
    { id: slot.teamB, seed: slot.seedB },
  ].filter((side): side is { id: string; seed: number | null } => Boolean(side.id));
  const winner = slot.winnerId ? teams.get(slot.winnerId) : undefined;
  const foeId = nextOpponent(slot, slots);
  const foe = foeId ? teams.get(foeId) : undefined;
  const resultLine =
    slot.round === "Championship"
      ? winner
        ? `${winner.school} is the champion`
        : "Tap a team"
      : winner
        ? foe
          ? `${winner.school} plays ${foe.school}`
          : `${winner.school} moves on`
        : "Tap a team";

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      {sides.map((side) => {
        const team = teams.get(side.id);
        const selected = slot.winnerId === side.id;
        const ink = team ? teamInk(team.color) : "#16181d";
        return (
          <motion.button
            key={side.id}
            type="button"
            aria-pressed={selected}
            aria-label={`${team?.school ?? side.id}, seed ${side.seed ?? ""}`}
            className="flex min-h-16 w-full items-center gap-3 border-b border-line px-3 text-left"
            initial={reduceMotion ? false : { x: 16, opacity: 0 }}
            animate={{ x: 0, opacity: selected ? 1 : 0.55 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
            style={{
              background: selected && team ? team.color : "transparent",
              color: selected ? ink : "var(--ink)",
            }}
            onClick={() => onPick(slot.id, side.id)}
          >
            <span className="nums w-6 shrink-0 text-center text-base font-semibold">{side.seed ?? "–"}</span>
            {team?.logo ? <img src={team.logo} alt="" className="h-10 w-10 shrink-0 rounded-sm bg-white object-contain p-0.5" /> : null}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-lg font-medium leading-tight">{team?.school ?? side.id}</span>
              <span className="block text-xs uppercase tracking-wide">{sideNote(selected, slot.round, side.seed)}</span>
            </span>
          </motion.button>
        );
      })}
      <p className="px-3 pt-3 text-sm">{resultLine}</p>
      <p className="px-3 text-xs text-muted">{slot.venueNote}</p>
      {slot.teamA && slot.teamB ? (
        <Link href={`/matchup/${matchupSlug(slot.teamA, slot.teamB)}/`} className="flex min-h-11 items-center px-3 text-sm underline">
          Compare these teams
        </Link>
      ) : null}
    </div>
  );
}

function ChampionCard({ team }: { team: Team }) {
  const ink = teamInk(team.color);
  return (
    <div className="mt-4 rounded-lg px-4 py-5 text-center" style={{ background: team.color, color: ink }}>
      {team.logo ? <img src={team.logo} alt="" className="mx-auto h-16 w-16 rounded-md bg-white object-contain p-1" /> : null}
      <p className="mt-2 text-3xl">{team.school}</p>
      <p className="text-sm uppercase tracking-wide">Champion</p>
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
  const reduceMotion = useReducedMotion();
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
          <motion.button
            key={side.id}
            type="button"
            aria-pressed={selected}
            aria-label={`${side.team?.school ?? side.id}, seed ${side.seed ?? ""}`}
            className="flex w-full items-center gap-1.5 px-1.5 text-left"
            initial={reduceMotion ? false : { x: 12, opacity: 0 }}
            animate={{ x: 0, opacity: selected ? 1 : 0.45 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
            style={{
              height: sides.length === 1 ? MATCH : ROW,
              background: selected && side.team ? side.team.color : "transparent",
              color: selected ? ink : "var(--ink)",
              boxShadow: index > 0 ? `inset 0 1px 0 ${LINE}` : undefined,
            }}
            onClick={() => onPick(slot.id, side.id as string)}
          >
            <span className="nums w-3.5 shrink-0 text-center text-[10px] font-semibold">{side.seed ?? "–"}</span>
            {side.team?.logo ? <img src={side.team.logo} alt="" className="h-4 w-4 shrink-0 bg-white object-contain" /> : null}
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium leading-none">{side.team?.school ?? side.id}</span>
          </motion.button>
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
