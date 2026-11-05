"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { InfoTip } from "@/components/info/InfoTip";
import { AdvancedMatchup } from "@/components/stats/AdvancedStats";
import { teamInk } from "@/components/team/TeamMark";
import type { StatCell, Team, TeamSeason } from "@/lib/cfp/types";
import { loadProfile, loadSeason, parseMatchupSlug, resolvedRivalries, siteConfig, statCatalog } from "@/lib/load";

type CatalogEntry = {
  label: string;
  help: string;
  offense: boolean;
  defense: boolean;
  digits: number;
  suffix?: string;
  garbageTimeAware?: boolean;
};

const catalog = statCatalog as Record<string, CatalogEntry>;
const profiles = loadProfile();
const ballKeys = ["points", "totalYards", "passYards", "rushYards", "yardsPerRush", "thirdDown", "fourthDown", "redZone"];

function formatValue(key: string, value: number | null) {
  if (value == null || Number.isNaN(value)) return "—";
  const entry = catalog[key];
  const digits = entry?.digits ?? 1;
  return `${value.toFixed(digits)}${entry?.suffix ?? ""}`;
}

function edge(left: number | null, right: number | null): "left" | "right" | "tie" | null {
  if (left == null || right == null) return null;
  if (left < right) return "left";
  if (right < left) return "right";
  return "tie";
}

function cell(stats: TeamSeason | undefined, side: "offense" | "defense", key: string): StatCell {
  return stats?.[side]?.[key] ?? { value: null, rank: null };
}

export function MatchupView({ initialSlug = "" }: { initialSlug?: string }) {
  const data = useMemo(() => loadSeason(), []);
  const reduceMotion = useReducedMotion();
  const [slug, setSlug] = useState(initialSlug);
  const [leftId, setLeftId] = useState(data.teams[0]?.id ?? "");
  const [rightId, setRightId] = useState(data.teams[1]?.id ?? "");

  useEffect(() => {
    if (initialSlug) return;
    const path = window.location.pathname.replace(/\/$/, "");
    const marker = "/matchup/";
    const index = path.indexOf(marker);
    if (index === -1) return;
    const next = decodeURIComponent(path.slice(index + marker.length));
    if (next) setSlug(next);
  }, [initialSlug]);

  const pair = slug ? parseMatchupSlug(data, slug) : null;
  const heading = useMemo(() => {
    if (!pair) return "Matchup calculator";
    const rivalry = resolvedRivalries(data).find((item) => item.home.id === pair.left.id && item.away.id === pair.right.id);
    return rivalry?.name ?? `${pair.left.school} vs ${pair.right.school}`;
  }, [data, pair]);

  useEffect(() => {
    const title = `${heading} · ${siteConfig.name}`;
    document.title = title;
    const id = window.setTimeout(() => {
      document.title = title;
    }, 50);
    return () => window.clearTimeout(id);
  }, [heading]);

  if (!pair) {
    return (
      <>
        <h1 className="mb-4 text-5xl">{heading}</h1>
        <Picker
          teams={data.teams}
          leftId={leftId}
          rightId={rightId}
          missing={Boolean(slug)}
          onLeft={setLeftId}
          onRight={setRightId}
        />
      </>
    );
  }

  const leftStats = data.stats[pair.left.id];
  const rightStats = data.stats[pair.right.id];
  const meeting = data.games.find(
    (game) =>
      (game.homeId === pair.left.id && game.awayId === pair.right.id) ||
      (game.homeId === pair.right.id && game.awayId === pair.left.id),
  );

  const sideBySide = sideBySideRows(leftStats, rightStats);
  const leftHasBall = ballKeys.map((key) =>
    rankRow(key, catalog[key].label, catalog[key].help, cell(leftStats, "offense", key), cell(rightStats, "defense", key)),
  );
  const rightHasBall = ballKeys.map((key) =>
    rankRow(key, catalog[key].label, catalog[key].help, cell(rightStats, "offense", key), cell(leftStats, "defense", key)),
  );
  const chart = sideBySide
    .filter((row) => row.gap != null)
    .map((row) => ({ name: row.label, gap: row.gap as number }));

  return (
    <div>
      <h1 className="mb-4 text-5xl">{heading}</h1>
      <p className="text-sm uppercase tracking-wide text-muted">
        {pair.left.conference} · {pair.right.conference}
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <TeamHead team={pair.left} stats={leftStats} />
        <TeamHead team={pair.right} stats={rightStats} />
      </div>
      <SpGap leftName={pair.left.school} rightName={pair.right.school} left={profiles.teams[pair.left.id]?.sp.rating ?? null} right={profiles.teams[pair.right.id]?.sp.rating ?? null} />
      <p className="mt-4 text-lg">
        {pair.left.school} leads {countEdges(sideBySide, "left")} categories. {pair.right.school} leads {countEdges(sideBySide, "right")}.
      </p>
      <p className="mt-2 text-sm text-muted">
        {meeting?.spread
          ? `Consensus line: ${meeting.spread}.`
          : "No line is posted. A line shows up only when these teams are scheduled and a number is in the feed."}
      </p>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
        Strength of schedule is the average winning percentage of opponents in games already played. Each FCS opponent counts as .400. Higher is a harder schedule. It is not an SP+ rating.
        {leftStats?.defense.totalYards?.value == null ? " Defensive yards are filled from each game's box score. If a row is blank, that number was not in the feed." : ""}
      </p>

      <Section title="Schedule strength">
        <StatTable
          rows={scheduleRows(profiles.teams[pair.left.id], profiles.teams[pair.right.id])}
          left={pair.left.school}
          right={pair.right.school}
        />
      </Section>
      <Section title="Each team on its own">
        <p className="mb-3 text-sm text-muted">Includes all plays. These box-score totals do not change with the garbage-time switch.</p>
        <StatTable rows={sideBySide} left={pair.left.school} right={pair.right.school} />
      </Section>
      <AdvancedMatchup leftId={pair.left.id} rightId={pair.right.id} leftName={pair.left.school} rightName={pair.right.school} />
      <Section title={`When ${pair.left.school} has the ball`}>
        <p className="mb-3 text-sm text-muted">
          {pair.left.school} offense against {pair.right.school} defense. {pair.left.school} leads {countEdges(leftHasBall, "left")}. {pair.right.school} leads {countEdges(leftHasBall, "right")}.
        </p>
        <StatTable rows={leftHasBall} left={`${pair.left.school} offense`} right={`${pair.right.school} defense`} />
      </Section>
      <Section title={`When ${pair.right.school} has the ball`}>
        <p className="mb-3 text-sm text-muted">
          {pair.right.school} offense against {pair.left.school} defense. {pair.right.school} leads {countEdges(rightHasBall, "left")}. {pair.left.school} leads {countEdges(rightHasBall, "right")}.
        </p>
        <StatTable rows={rightHasBall} left={`${pair.right.school} offense`} right={`${pair.left.school} defense`} />
      </Section>
      {chart.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-3xl">Rank gaps</h2>
          <p className="mt-2 text-sm text-muted">Bars to the right mean {pair.left.school} has the better rank. Bars to the left mean {pair.right.school} does.</p>
          <div className="mt-4 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} layout="vertical" margin={{ left: 16, right: 16 }}>
                <XAxis type="number" stroke="currentColor" />
                <YAxis type="category" dataKey="name" width={120} stroke="currentColor" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="gap" isAnimationActive={!reduceMotion} animationDuration={180}>
                  {chart.map((row) => (
                    <Cell key={row.name} fill={row.gap >= 0 ? "#178a45" : "#c53636"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Picker({
  teams,
  leftId,
  rightId,
  missing,
  onLeft,
  onRight,
}: {
  teams: Team[];
  leftId: string;
  rightId: string;
  missing: boolean;
  onLeft: (id: string) => void;
  onRight: (id: string) => void;
}) {
  return (
    <form
      className="grid max-w-xl gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!leftId || !rightId || leftId === rightId) return;
        window.location.assign(`/matchup/${leftId}-vs-${rightId}/`);
      }}
    >
      {missing ? <p>Those names are not both in this season. Pick two teams below.</p> : <p>Pick two teams. Any pair opens in the calculator.</p>}
      <label className="grid gap-1 text-sm">
        First team
        <select className="min-h-11 rounded-md border border-line bg-surface px-3" value={leftId} onChange={(event) => onLeft(event.target.value)}>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.school}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Second team
        <select className="min-h-11 rounded-md border border-line bg-surface px-3" value={rightId} onChange={(event) => onRight(event.target.value)}>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.school}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="min-h-11 rounded-md bg-accent px-4 font-medium text-accent-ink" disabled={leftId === rightId}>
        Compare
      </button>
    </form>
  );
}

function TeamHead({ team, stats }: { team: Team; stats: TeamSeason | undefined }) {
  return (
    <div className="flex items-center gap-3 rounded-md px-4 py-4" style={{ background: team.color, color: teamInk(team.color) }}>
      {team.logo ? <img src={team.logo} alt="" className="h-16 w-16 rounded-md bg-white p-1 object-contain" /> : null}
      <div>
        <p className="text-3xl">{team.school}</p>
        <p className="text-sm opacity-80">
          {stats ? `${stats.wins}-${stats.losses}` : "—"} · {team.conference}
        </p>
      </div>
    </div>
  );
}

type Row = {
  key: string;
  label: string;
  help: string;
  leftValue: string;
  rightValue: string;
  leftRank: number | null;
  rightRank: number | null;
  winner: "left" | "right" | "tie" | null;
  gap: number | null;
};

function sideBySideRows(leftStats: TeamSeason | undefined, rightStats: TeamSeason | undefined): Row[] {
  const rows: Row[] = [];
  for (const [key, entry] of Object.entries(catalog)) {
    if (key === "sos" || key === "ats" || entry.garbageTimeAware) continue;
    if (entry.offense) rows.push(rankRow(key, `${entry.label} (offense)`, entry.help, cell(leftStats, "offense", key), cell(rightStats, "offense", key)));
    if (entry.defense) rows.push(rankRow(key, `${entry.label} (defense)`, entry.help, cell(leftStats, "defense", key), cell(rightStats, "defense", key)));
  }
  rows.push(rankRow("sos", catalog.sos.label, catalog.sos.help, leftStats?.sos ?? { value: null, rank: null }, rightStats?.sos ?? { value: null, rank: null }));
  rows.push(atsRow(leftStats, rightStats));
  return rows.filter((row) => row.leftValue !== "—" || row.rightValue !== "—" || row.leftRank != null || row.rightRank != null);
}

function SpGap({ leftName, rightName, left, right }: { leftName: string; rightName: string; left: number | null; right: number | null }) {
  if (left == null || right == null) {
    return <p className="mt-4 text-sm text-muted">SP+ rating gap is not posted for this pair.</p>;
  }
  const gap = left - right;
  const ahead = gap > 0 ? leftName : rightName;
  return (
    <p className="mt-4 rounded-md border border-line bg-surface px-4 py-3 text-lg">
      SP+ rating gap: {gap === 0 ? "the ratings are even" : `${ahead} is ahead by ${Math.abs(gap).toFixed(1)}`}.
    </p>
  );
}

function scheduleRows(left: { sp: { sos: number | null; sosRank: number | null }; fpi: { strengthOfSchedule: number | null; remainingStrengthOfSchedule: number | null; strengthOfRecord: number | null } } | undefined, right: { sp: { sos: number | null; sosRank: number | null }; fpi: { strengthOfSchedule: number | null; remainingStrengthOfSchedule: number | null; strengthOfRecord: number | null } } | undefined): Row[] {
  const sp = rankRow("spSos", catalog.spSos.label, catalog.spSos.help, { value: left?.sp.sos ?? null, rank: left?.sp.sosRank ?? null }, { value: right?.sp.sos ?? null, rank: right?.sp.sosRank ?? null });
  if (sp.leftValue === "—" && sp.rightValue === "—") {
    sp.leftValue = "Not posted";
    sp.rightValue = "Not posted";
  }
  return [
    sp,
    rankRow("fpiSos", catalog.fpiSos.label, catalog.fpiSos.help, { value: null, rank: left?.fpi.strengthOfSchedule ?? null }, { value: null, rank: right?.fpi.strengthOfSchedule ?? null }),
    rankRow("remainingSos", catalog.remainingSos.label, catalog.remainingSos.help, { value: null, rank: left?.fpi.remainingStrengthOfSchedule ?? null }, { value: null, rank: right?.fpi.remainingStrengthOfSchedule ?? null }),
    rankRow("strengthOfRecord", catalog.strengthOfRecord.label, catalog.strengthOfRecord.help, { value: null, rank: left?.fpi.strengthOfRecord ?? null }, { value: null, rank: right?.fpi.strengthOfRecord ?? null }),
  ];
}

function rankRow(key: string, label: string, help: string, left: StatCell, right: StatCell): Row {
  const winner = edge(left.rank, right.rank);
  return {
    key,
    label,
    help,
    leftValue: formatValue(key, left.value),
    rightValue: formatValue(key, right.value),
    leftRank: left.rank,
    rightRank: right.rank,
    winner,
    gap: left.rank != null && right.rank != null ? right.rank - left.rank : null,
  };
}

function atsText(record: TeamSeason["ats"] | undefined) {
  if (!record || record.wins + record.losses + record.pushes === 0) return "—";
  return `${record.wins}-${record.losses}-${record.pushes}`;
}

function atsRow(leftStats: TeamSeason | undefined, rightStats: TeamSeason | undefined): Row {
  const left = leftStats?.ats;
  const right = rightStats?.ats;
  const leftRank = left?.rank ?? null;
  const rightRank = right?.rank ?? null;
  return {
    key: "ats",
    label: catalog.ats.label,
    help: catalog.ats.help,
    leftValue: atsText(left),
    rightValue: atsText(right),
    leftRank,
    rightRank,
    winner: edge(leftRank, rightRank),
    gap: leftRank != null && rightRank != null ? rightRank - leftRank : null,
  };
}

function edgeShade(winner: Row["winner"], side: "left" | "right") {
  if (!winner || winner === "tie") return "";
  return winner === side ? "bg-emerald-600/15 text-emerald-800 dark:text-emerald-200" : "bg-red-600/15 text-red-800 dark:text-red-200";
}

function countEdges(rows: Row[], side: "left" | "right") {
  return rows.filter((row) => row.winner === side).length;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-3xl">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function shown(value: string, rank: number | null) {
  if (value !== "—") return `${value}${rank ? ` #${rank}` : ""}`;
  return rank ? `#${rank}` : "—";
}

function StatTable({ rows, left, right }: { rows: Row[]; left: string; right: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="py-2 font-medium">Stat</th>
            <th className="py-2 font-medium">{left}</th>
            <th className="py-2 font-medium">{right}</th>
            <th className="py-2 font-medium">Edge</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-line">
              <td className="py-1">
                <span className="inline-flex items-center">
                  {row.label}
                  <InfoTip label={`About ${row.label}`} text={row.help} />
                </span>
              </td>
              <td className={`nums px-2 py-2 ${edgeShade(row.winner, "left")}`}>{shown(row.leftValue, row.leftRank)}</td>
              <td className={`nums px-2 py-2 ${edgeShade(row.winner, "right")}`}>{shown(row.rightValue, row.rightRank)}</td>
              <td className="py-2">{row.winner === "left" ? left : row.winner === "right" ? right : row.winner === "tie" ? "Even" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
