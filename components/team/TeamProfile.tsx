"use client";

import { useReducedMotion } from "motion/react";
import { InfoTip } from "@/components/info/InfoTip";
import { useGarbageTime } from "@/components/stats/GarbageTime";
import type { GameEpaPoint } from "@/lib/cfp/types";
import { loadAdvanced, loadGameEpa, loadProfile, loadSeason, statCatalog } from "@/lib/load";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";

type CatalogEntry = { label: string; help: string; garbageTimeAware?: boolean };

const catalog = statCatalog as Record<string, CatalogEntry>;
const profile = loadProfile();
const advanced = loadAdvanced();
const gameEpa = loadGameEpa();
const seasonTeams = loadSeason().teams;
const metricKeys = Object.keys(catalog).filter((key) => catalog[key].garbageTimeAware);

function percentile(rank: number | null, count: number) {
  if (rank == null || count < 2) return null;
  return Math.round(((count - rank) / (count - 1)) * 100);
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function ratingText(value: number | null, rank: number | null, digits = 1) {
  if (value == null) return "—";
  return `${value.toFixed(digits)}${rank ? ` (#${rank})` : ""}`;
}

export function TeamProfile({ teamId, record, conferenceRecord }: { teamId: string; record: string; conferenceRecord: string }) {
  const team = seasonTeams.find((item) => item.id === teamId);
  const row = profile.teams[teamId];
  if (!team || !row) return null;
  return (
    <>
      <section className="mt-8">
        <h2 className="text-3xl">Ratings</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card label="Record" value={record} detail={conferenceRecord} help="Wins and losses so far, then the conference record." />
          <Card label={catalog.spPlus.label} value={ratingText(row.sp.rating, row.sp.rank)} help={catalog.spPlus.help} />
          <Card label={catalog.srs.label} value={ratingText(row.srs.rating, row.srs.rank)} help={catalog.srs.help} />
          <Card label={catalog.fpi.label} value={ratingText(row.fpi.rating, row.fpi.rank)} help={catalog.fpi.help} />
          <Card label={catalog.talent.label} value={row.talent.rank ? `#${row.talent.rank}` : "—"} detail={row.talent.rating != null ? row.talent.rating.toFixed(0) : undefined} help={catalog.talent.help} />
          <Card label={catalog.returning.label} value={row.returning.percent != null ? `${row.returning.percent.toFixed(1)}%` : "—"} detail={row.returning.rank ? `#${row.returning.rank}` : undefined} help={catalog.returning.help} />
          <Card label="Head coach" value={row.coach ?? "—"} help="Head coach listed by College Football Data for this season." />
        </ul>
      </section>
      <section className="mt-8">
        <div className="flex flex-wrap items-center">
          <h2 className="text-3xl">Schedule strength</h2>
          <InfoTip label="About schedule strength" text="These answer different questions. SP+ schedule strength is blank in the feed this season. The FPI ranks come from ESPN: 1 is the hardest schedule, or the most impressive record." />
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card label={catalog.spSos.label} value={row.sp.sos != null ? ratingText(row.sp.sos, row.sp.sosRank) : "Not posted"} help={catalog.spSos.help} />
          <Card label={catalog.fpiSos.label} value={row.fpi.strengthOfSchedule ? `#${row.fpi.strengthOfSchedule}` : "—"} help={catalog.fpiSos.help} />
          <Card label={catalog.remainingSos.label} value={row.fpi.remainingStrengthOfSchedule ? `#${row.fpi.remainingStrengthOfSchedule}` : "—"} help={catalog.remainingSos.help} />
          <Card label={catalog.strengthOfRecord.label} value={row.fpi.strengthOfRecord ? `#${row.fpi.strengthOfRecord}` : "—"} help={catalog.strengthOfRecord.help} />
        </ul>
      </section>
      <PercentileBars teamId={teamId} color={team.color} />
      <EpaScatter teamId={teamId} school={team.school} color={team.color} />
      <EpaLine teamId={teamId} color={team.color} />
    </>
  );
}

function Card({ label, value, detail, help }: { label: string; value: string; detail?: string; help: string }) {
  return (
    <li className="rounded-md border border-line bg-surface px-3 py-2">
      <p className="flex items-center text-xs uppercase tracking-wide text-muted">
        {label}
        <InfoTip label={`About ${label}`} text={help} />
      </p>
      <p className="nums text-2xl leading-tight">{value}</p>
      {detail ? <p className="text-sm text-muted">{detail}</p> : null}
    </li>
  );
}

function PercentileBars({ teamId, color }: { teamId: string; color: string }) {
  const { include } = useGarbageTime();
  const copyName = include ? "withGT" : "noGT";
  const rows = metricKeys.map((key) => {
    const offenseRanks = Object.values(advanced.teams).map((team) => team[copyName]?.offense[key]?.rank ?? null).filter((rank): rank is number => rank != null);
    const defenseRanks = Object.values(advanced.teams).map((team) => team[copyName]?.defense[key]?.rank ?? null).filter((rank): rank is number => rank != null);
    const mine = advanced.teams[teamId]?.[copyName];
    return {
      key,
      label: catalog[key].label,
      offense: percentile(mine?.offense[key]?.rank ?? null, offenseRanks.length),
      defense: percentile(mine?.defense[key]?.rank ?? null, defenseRanks.length),
    };
  });
  return (
    <section className="mt-8">
      <h2 className="text-3xl">Where they stand</h2>
      <p className="mt-2 text-sm text-muted">{include ? "Every play is counted." : "Garbage time is left out."} 100 is the best in FBS. The bar follows the header switch.</p>
      <ul className="mt-3 grid gap-4">
        {rows.map((row) => (
          <li key={row.key}>
            <p className="text-sm">{row.label}</p>
            <PercentBar label="Offense" value={row.offense} color={color} />
            <PercentBar label="Defense" value={row.defense} color={color} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function PercentBar({ label, value, color }: { label: string; value: number | null; color: string }) {
  return (
    <div className="mt-1 grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="h-3 overflow-hidden rounded-full bg-line">
        <span className="block h-full rounded-full" style={{ width: `${value ?? 0}%`, background: color }} />
      </span>
      <span className="nums text-right">{value == null ? "—" : value}</span>
    </div>
  );
}

function EpaScatter({ teamId, school, color }: { teamId: string; school: string; color: string }) {
  const { include } = useGarbageTime();
  const reduceMotion = useReducedMotion();
  const copyName = include ? "withGT" : "noGT";
  const points = seasonTeams.flatMap((team) => {
    const copy = advanced.teams[team.id]?.[copyName];
    const off = copy?.offense.ppa?.value;
    const def = copy?.defense.ppa?.value;
    if (off == null || def == null) return [];
    return [{ id: team.id, name: team.school, off, def }];
  });
  const ours = points.find((point) => point.id === teamId);
  return (
    <section className="mt-8">
      <h2 className="text-3xl">Offense EPA and defense EPA</h2>
      <p className="mt-2 text-sm text-muted">
        Every FBS team is a dot. Right is a better offense. Up is a better defense, because a lower defensive EPA sits higher on the chart. The lines are the middle of FBS. {school} is the larger dot.
        {include ? " Every play is counted." : " Garbage time is left out."}
      </p>
      <div className="mt-4 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <XAxis type="number" dataKey="off" stroke="currentColor" tick={{ fontSize: 12 }} />
            <YAxis type="number" dataKey="def" reversed stroke="currentColor" tick={{ fontSize: 12 }} width={48} />
            <ReferenceLine x={median(points.map((point) => point.off))} stroke="var(--line)" />
            <ReferenceLine y={median(points.map((point) => point.def))} stroke="var(--line)" />
            <Tooltip content={<ScatterTip />} />
            <Scatter data={points} isAnimationActive={!reduceMotion} shape={(props: { cx?: number; cy?: number; payload?: { id?: string } }) => <ScatterDot {...props} teamId={teamId} color={color} />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {ours ? <p className="mt-2 text-sm text-muted">{school} is at {ours.off.toFixed(3)} offense EPA and {ours.def.toFixed(3)} defense EPA.</p> : null}
    </section>
  );
}

function ScatterDot(props: { cx?: number; cy?: number; payload?: { id?: string }; teamId?: string; color?: string }) {
  const big = props.payload?.id === props.teamId;
  if (props.cx == null || props.cy == null) return null;
  return <circle cx={props.cx} cy={props.cy} r={big ? 7 : 3} fill={big ? props.color : "var(--muted)"} />;
}

function ScatterTip({ active, payload }: { active?: boolean; payload?: { payload: { name: string; off: number; def: number } }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink">
      <p>{point.name}</p>
      <p className="nums">Offense {point.off.toFixed(3)}</p>
      <p className="nums">Defense {point.def.toFixed(3)}</p>
    </div>
  );
}

function EpaLine({ teamId, color }: { teamId: string; color: string }) {
  const { include } = useGarbageTime();
  const reduceMotion = useReducedMotion();
  const games = gameEpa.teams[teamId]?.[include ? "withGT" : "noGT"] ?? [];
  return (
    <section className="mt-8">
      <h2 className="text-3xl">EPA by game</h2>
      <p className="mt-2 text-sm text-muted">
        The solid line is offense EPA. The dashed line is defense EPA. {include ? "Every play is counted." : "Garbage time is left out."}
      </p>
      {games.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No game EPA is posted yet.</p>
      ) : (
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={games} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey="week" stroke="currentColor" tick={{ fontSize: 12 }} />
              <YAxis stroke="currentColor" tick={{ fontSize: 12 }} width={48} />
              <Tooltip content={<LineTip />} />
              <Line type="monotone" dataKey="offEpa" name="Offense" stroke={color} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={!reduceMotion} animationDuration={180} />
              <Line type="monotone" dataKey="defEpa" name="Defense" stroke="currentColor" strokeDasharray="5 4" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={!reduceMotion} animationDuration={180} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function LineTip({ active, payload }: { active?: boolean; payload?: { payload: GameEpaPoint }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink">
      <p>Week {point.week} vs {point.opponent}</p>
      <p className="nums">Offense {point.offEpa == null ? "—" : point.offEpa.toFixed(3)}</p>
      <p className="nums">Defense {point.defEpa == null ? "—" : point.defEpa.toFixed(3)}</p>
    </div>
  );
}
