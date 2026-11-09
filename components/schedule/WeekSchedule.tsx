"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TeamMark } from "@/components/team/TeamMark";
import type { Game, GameSplit, Team } from "@/lib/cfp/types";
import { loadSeason, loadSplits, matchupSlug } from "@/lib/load";

const zone = "America/Chicago";

function kickoffUnset(iso: string) {
  // The feed uses 05:00 UTC when a kickoff is not set yet. That is not 11 PM Central.
  return /T05:00(?::00(?:\.0+)?)?Z$/.test(iso);
}

function placed(iso: string) {
  return kickoffUnset(iso) ? `${iso.slice(0, 10)}T18:00:00Z` : iso;
}

function dayKey(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(placed(iso)));
}

function dayLabel(iso: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: zone, weekday: "long", month: "short", day: "numeric" }).format(new Date(placed(iso)));
}

function timeLabel(iso: string) {
  if (kickoffUnset(iso)) return "TBD";
  return new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

type Kickoff = "any" | "morning" | "afternoon" | "prime" | "night" | "tbd";

const kickoffChoices: { id: Kickoff; label: string }[] = [
  { id: "any", label: "Any kickoff" },
  { id: "morning", label: "Morning, before noon" },
  { id: "afternoon", label: "Afternoon, noon to 5" },
  { id: "prime", label: "Prime time, 5 to 8" },
  { id: "night", label: "Night, 9 PM and later" },
  { id: "tbd", label: "Kickoff not set" },
];

function kickoffHour(iso: string) {
  if (kickoffUnset(iso)) return null;
  const hour = new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", hourCycle: "h23" }).formatToParts(new Date(iso)).find((part) => part.type === "hour")?.value;
  return hour == null ? null : Number(hour);
}

function inKickoff(iso: string, kickoff: Kickoff) {
  if (kickoff === "any") return true;
  if (kickoff === "tbd") return kickoffUnset(iso);
  const hour = kickoffHour(iso);
  if (hour == null) return false;
  if (kickoff === "morning") return hour < 12;
  if (kickoff === "afternoon") return hour >= 12 && hour < 17;
  if (kickoff === "prime") return hour >= 17 && hour < 21;
  return hour >= 21;
}

export function WeekSchedule() {
  const data = useMemo(() => loadSeason(), []);
  const splits = useMemo(() => loadSplits(), []);
  const teams = useMemo(() => new Map(data.teams.map((team) => [team.id, team])), [data.teams]);
  const weeks = useMemo(() => {
    const regular = [...new Set(data.games.filter((game) => game.seasonType === "regular").map((game) => game.week))].sort((a, b) => a - b);
    const postseason = data.games.some((game) => game.seasonType === "postseason");
    return { regular, postseason };
  }, [data.games]);
  const ranked = useMemo(() => new Set(data.rankings.cfp.map((row) => row.teamId)), [data.rankings.cfp]);
  const start = weeks.regular.includes(data.season.week) ? data.season.week : weeks.regular[0] ?? 1;
  const [selected, setSelected] = useState<number | "postseason">(start);
  const [top25, setTop25] = useState(false);
  const [conference, setConference] = useState("all");
  const [kickoff, setKickoff] = useState<Kickoff>("any");

  const games = data.games
    .filter((game) => (selected === "postseason" ? game.seasonType === "postseason" : game.seasonType === "regular" && game.week === selected))
    .filter((game) => !top25 || ranked.has(game.homeId) || ranked.has(game.awayId))
    .filter((game) => {
      if (conference === "all") return true;
      const home = teams.get(game.homeId)?.conference;
      const away = teams.get(game.awayId)?.conference;
      return home === conference || away === conference;
    })
    .filter((game) => inKickoff(game.startDate, kickoff))
    .sort((a, b) => {
      const unset = Number(kickoffUnset(a.startDate)) - Number(kickoffUnset(b.startDate));
      if (unset !== 0) return unset;
      return a.startDate.localeCompare(b.startDate) || a.awayName.localeCompare(b.awayName);
    });

  const notes = [
    top25 ? "with a Top 25 team" : "",
    conference === "all" ? "" : `in the ${conference}`,
    kickoff === "any" ? "" : kickoffChoices.find((choice) => choice.id === kickoff)?.label.toLowerCase() ?? "",
  ].filter(Boolean);
  const scope = selected === "postseason" ? "after the regular season" : `in week ${selected}`;
  const summary = `${games.length} ${games.length === 1 ? "game" : "games"}${notes.length ? ` ${notes.join(", ")}` : ""} ${scope}.`;
  const splitsNote = games.some((game) => splits.games[game.id])
    ? `Bet % is the share of tickets. Handle % is the share of dollars.${splits.label ? ` Cleatz updated ${splits.label}.` : ""}`
    : "";

  const days = new Map<string, Game[]>();
  for (const game of games) {
    const key = dayKey(game.startDate);
    const list = days.get(key) ?? [];
    list.push(game);
    days.set(key, list);
  }

  return (
    <div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {weeks.regular.map((week) => (
          <button
            key={week}
            type="button"
            className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-medium ${selected === week ? "bg-accent text-accent-ink" : "border border-line text-muted"}`}
            onClick={() => setSelected(week)}
          >
            Week {week}
            {week === data.season.week ? " · now" : ""}
          </button>
        ))}
        {weeks.postseason ? (
          <button
            type="button"
            className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-medium ${selected === "postseason" ? "bg-accent text-accent-ink" : "border border-line text-muted"}`}
            onClick={() => setSelected("postseason")}
          >
            Postseason
          </button>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <button
          type="button"
          className={`min-h-11 rounded-full px-4 text-sm font-medium ${top25 ? "bg-accent text-accent-ink" : "border border-line text-muted"}`}
          aria-pressed={top25}
          onClick={() => setTop25((value) => !value)}
        >
          Top 25
        </button>
        <label className="grid gap-1 text-sm">
          Conference
          <select className="min-h-11 rounded-md border border-line bg-paper px-3" value={conference} onChange={(event) => setConference(event.target.value)}>
            <option value="all">All conferences</option>
            {data.conferences.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Kickoff
          <select className="min-h-11 rounded-md border border-line bg-paper px-3" value={kickoff} onChange={(event) => setKickoff(event.target.value as Kickoff)}>
            {kickoffChoices.map((choice) => (
              <option key={choice.id} value={choice.id}>
                {choice.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-4 text-sm text-muted">{summary}</p>
      {splitsNote ? <p className="mt-1 text-sm text-muted">{splitsNote}</p> : null}
      {games.length === 0 ? <p className="mt-6 text-sm text-muted">No games match these filters. Clear one and the list fills back in.</p> : null}
      <div className="mt-4 grid gap-8">
        {[...days.entries()].map(([key, dayGames]) => (
          <section key={key}>
            <h2 className="text-2xl">{dayLabel(dayGames[0].startDate)}</h2>
            <ul className="mt-3 divide-y divide-line">
              {dayGames.map((game) => (
                <GameRow key={game.id} game={game} teams={teams} split={splits.games[game.id]} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function GameRow({ game, teams, split }: { game: Game; teams: Map<string, Team>; split?: GameSplit }) {
  const away = teams.get(game.awayId);
  const home = teams.get(game.homeId);
  const both = Boolean(away && home);
  const score =
    game.completed && game.awayPoints != null && game.homePoints != null ? `${game.awayPoints}–${game.homePoints}` : game.spread || "No line";
  const body = (
    <>
      <span className="nums w-20 shrink-0 text-sm text-muted">{timeLabel(game.startDate)}</span>
      <span className="min-w-0 flex-1">
        <TeamMark team={away} name={away?.school ?? game.awayName} size="sm" />
      </span>
      <span className="w-8 shrink-0 text-center text-xs uppercase tracking-wide text-muted">{game.neutralSite ? "vs" : "at"}</span>
      <span className="min-w-0 flex-1">
        <TeamMark team={home} name={home?.school ?? game.homeName} size="sm" />
      </span>
      <span className="nums w-24 shrink-0 text-right text-sm">{score}</span>
    </>
  );
  const card = (
    <>
      <div className="grid gap-2 sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="nums text-sm text-muted">{timeLabel(game.startDate)}</span>
          <span className="nums text-sm">{score}</span>
        </div>
        <TeamMark team={away} name={away?.school ?? game.awayName} size="sm" />
        <span className="text-xs uppercase tracking-wide text-muted">{game.neutralSite ? "vs" : "at"}</span>
        <TeamMark team={home} name={home?.school ?? game.homeName} size="sm" />
      </div>
      <div className="hidden min-h-11 items-center gap-3 sm:flex">{body}</div>
      {split ? <PublicSplits split={split} /> : null}
    </>
  );
  return (
    <li className="py-2">
      {both ? (
        <Link href={`/matchup/${matchupSlug(game.awayId, game.homeId)}/`} className="block">
          {card}
        </Link>
      ) : (
        card
      )}
    </li>
  );
}

function PublicSplits({ split }: { split: GameSplit }) {
  const markets = [
    ["Spread", split.spread],
    ["Moneyline", split.moneyline],
    ["Total", split.total],
  ] as const;
  return (
    <div className="mt-2 grid gap-3 border-t border-line pt-2 sm:grid-cols-3">
      {markets.map(([name, market]) =>
        market ? (
          <div key={name}>
            <p className="text-xs uppercase tracking-wide text-muted">{name}</p>
            {market.sides.map((side) => (
              <p key={side.label} className="mt-1 flex items-baseline justify-between gap-3 text-sm">
                <span>{side.label}</span>
                <span className="nums shrink-0 text-muted">
                  {side.bet}% bets · {side.handle}% handle
                </span>
              </p>
            ))}
          </div>
        ) : null,
      )}
    </div>
  );
}
