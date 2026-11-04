"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bracket } from "@/components/simulator/Bracket";
import { RankList } from "@/components/simulator/RankList";
import { InfoTip } from "@/components/info/InfoTip";
import { contenderBoard, simulate } from "@/lib/cfp/engine";
import { decodeScenario, emptyScenario, encodeScenario } from "@/lib/cfp/share";
import type { Scenario, Team } from "@/lib/cfp/types";
import { cfpFormat, loadSeason, rankingConfig } from "@/lib/load";

const STORAGE_KEY = "2fans1pod-scenario";

export function Simulator() {
  const data = useMemo(() => loadSeason(), []);
  const teams = useMemo(() => new Map(data.teams.map((team) => [team.id, team])), [data.teams]);
  const [scenario, setScenario] = useState<Scenario>(emptyScenario());
  const [ready, setReady] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [showOthers, setShowOthers] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("s");
    const decoded = fromUrl ? decodeScenario(fromUrl) : null;
    if (decoded) setScenario(decoded);
    else {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const fromDevice = saved ? decodeScenario(saved) : null;
      if (fromDevice) setScenario(fromDevice);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const encoded = encodeScenario(scenario);
    window.localStorage.setItem(STORAGE_KEY, encoded);
    const url = new URL(window.location.href);
    url.searchParams.set("s", encoded);
    window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
  }, [scenario, ready]);

  const result = useMemo(() => simulate(data, scenario, cfpFormat, rankingConfig), [data, scenario]);
  const board = useMemo(() => contenderBoard(data, rankingConfig), [data]);
  const contenderIds = useMemo(() => {
    const ids = new Set<string>();
    board.forEach((group) => {
      group.shown.forEach((id) => ids.add(id));
      if (openGroups[group.conference]) group.hidden.forEach((id) => ids.add(id));
    });
    data.teams.filter((team) => team.tier === "independent" && data.rankings.order.indexOf(team.id) < rankingConfig.bubbleRank).forEach((team) => ids.add(team.id));
    return ids;
  }, [board, openGroups, data, rankingConfig.bubbleRank]);

  const remainingFor = (teamId: string) =>
    result.games.filter((game) => !game.completed && (game.homeId === teamId || game.awayId === teamId));

  const setWinner = (gameId: string, winnerId: string) => {
    setScenario((current) => ({ ...current, picks: { ...current.picks, [gameId]: winnerId } }));
  };

  const toggleWinOut = (teamId: string) => {
    setScenario((current) => {
      const on = current.winOut.includes(teamId);
      const picks = { ...current.picks };
      for (const game of data.games) {
        if (!game.completed && (game.homeId === teamId || game.awayId === teamId)) delete picks[game.id];
      }
      delete picks[`ccg:${data.teams.find((team) => team.id === teamId)?.conference}`];
      return {
        ...current,
        winOut: on ? current.winOut.filter((id) => id !== teamId) : [...current.winOut, teamId],
        picks,
      };
    });
  };

  if (data.teams.length === 0) {
    return <p>Season data has not been built yet. Run the data script, then reload.</p>;
  }

  const otherGames = data.games.filter((game) => !game.completed && !contenderIds.has(game.homeId) && !contenderIds.has(game.awayId));
  const weeks = [...new Set(otherGames.map((game) => game.week))].sort((a, b) => a - b);

  return (
    <div>
      <p className="max-w-3xl text-lg leading-7">{result.sentence}</p>
      <p className="mt-3 flex items-start gap-1 text-sm text-muted">
        <span>
          Untouched games go to the higher-ranked team. Each future loss costs {rankingConfig.lossDropSpots} spots. A loss to a lower-ranked team drops the loser behind that team.
          {data.season.eloSource === "cfbd"
            ? " Teams outside the top 25 are ordered by College Football Data Elo."
            : " Teams outside the top 25 are ordered by an Elo rating computed from this season's results."}
        </span>
        <InfoTip label="How rankings are adjusted" text="The simulator starts from the latest CFP order, then Elo for everyone else. It applies every remaining result once. It does not re-rank after each game and then pick new favorites. Conference champions follow the records in your scenario. If the title game is not scheduled yet, the top two teams play a projected championship." />
      </p>
      <InOut resultField={result.field} firstOut={result.firstOut} teams={teams} />
      <div className="mt-8 grid gap-10 min-[1100px]:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          {board.map((group) => (
            <section key={group.conference} className="mb-8">
              <h2 className="text-3xl">{group.conference}</h2>
              {[...group.shown, ...(openGroups[group.conference] ? group.hidden : [])].map((teamId) => {
                const team = teams.get(teamId);
                if (!team) return null;
                const games = remainingFor(teamId);
                return (
                  <div key={teamId} className="border-b border-line py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="h-7 w-1.5 rounded-sm" style={{ background: team.color }} />
                      <Link href={`/teams/${team.id}`} className="font-medium underline-offset-4 hover:underline">
                        {team.school}
                      </Link>
                      <button
                        type="button"
                        className={`min-h-11 rounded-md px-3 text-sm ${scenario.winOut.includes(teamId) ? "bg-accent text-accent-ink" : "border border-line"}`}
                        onClick={() => toggleWinOut(teamId)}
                      >
                        Wins out
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {games.map((game) => {
                        const opponentId = game.homeId === teamId ? game.awayId : game.homeId;
                        const opponent = teams.get(opponentId)?.school ?? (game.homeId === teamId ? game.awayName : game.homeName);
                        const selected = game.winnerId === teamId;
                        return (
                          <button
                            key={game.id}
                            type="button"
                            className={`min-h-11 rounded-md border px-3 text-left text-sm ${selected ? "border-accent bg-surface" : "border-line text-muted"}`}
                            onClick={() => setWinner(game.id, selected ? opponentId : teamId)}
                          >
                            {game.projected ? "Title game vs " : "vs "}
                            {opponent}
                            {selected ? " · win" : " · loss"}
                          </button>
                        );
                      })}
                      {games.length === 0 ? <span className="text-sm text-muted">No games left</span> : null}
                    </div>
                  </div>
                );
              })}
              {group.hidden.length > 0 ? (
                <button type="button" className="mt-2 min-h-11 text-sm underline" onClick={() => setOpenGroups((current) => ({ ...current, [group.conference]: !current[group.conference] }))}>
                  {openGroups[group.conference] ? "Hide extra teams" : `${group.hidden.length} more still alive`}
                </button>
              ) : null}
              {result.champions[group.conference]?.tied.length > 1 ? (
                <label className="mt-3 flex min-h-11 flex-wrap items-center gap-2 text-sm">
                  Tied for the title
                  <select
                    className="min-h-11 rounded-md border border-line bg-surface px-2"
                    value={scenario.champPicks[group.conference] ?? result.champions[group.conference].teamId}
                    onChange={(event) => setScenario((current) => ({ ...current, champPicks: { ...current.champPicks, [group.conference]: event.target.value } }))}
                  >
                    {result.champions[group.conference].tied.map((id) => (
                      <option key={id} value={id}>
                        {teams.get(id)?.school ?? id}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </section>
          ))}
          <button type="button" className="min-h-11 text-sm underline" onClick={() => setShowOthers((value) => !value)}>
            {showOthers ? "Hide every other game" : "Every other game"}
          </button>
          {showOthers
            ? weeks.map((week) => (
                <div key={week} className="mt-4">
                  <h3 className="text-sm uppercase tracking-wide text-muted">Week {week}</h3>
                  {otherGames
                    .filter((game) => game.week === week)
                    .map((game) => {
                      const winner = scenario.picks[game.id] ?? (data.rankings.order.indexOf(game.homeId) <= data.rankings.order.indexOf(game.awayId) ? game.homeId : game.awayId);
                      return (
                        <div key={game.id} className="flex flex-wrap gap-2 border-b border-line py-2">
                          {[game.homeId, game.awayId].map((id) => (
                            <button key={id} type="button" className={`min-h-11 rounded-md border px-3 ${winner === id ? "border-accent" : "border-line text-muted"}`} onClick={() => setWinner(game.id, id)}>
                              {id === game.homeId ? game.homeName : game.awayName}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                </div>
              ))
            : null}
        </div>
        <div>
          <RankList
            order={result.order}
            teams={teams}
            manual={result.manual}
            onReorder={(order) => setScenario((current) => ({ ...current, manualOrder: order }))}
            onReset={() => setScenario((current) => ({ ...current, manualOrder: null }))}
          />
          <Bracket
            slots={result.bracket}
            teams={teams}
            onPick={(slotId, teamId) => setScenario((current) => ({ ...current, playoffPicks: { ...current.playoffPicks, [slotId]: teamId } }))}
          />
        </div>
      </div>
    </div>
  );
}

function InOut({
  resultField,
  firstOut,
  teams,
}: {
  resultField: { teamId: string; seed: number; reason: string }[];
  firstOut: string[];
  teams: Map<string, Team>;
}) {
  return (
    <section className="mt-6">
      <h2 className="sr-only">Who is in and out</h2>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {resultField.map((team) => (
          <li key={team.teamId} className="flex min-h-11 items-center gap-2 rounded-md border border-line bg-surface px-3 py-2">
            <span className="nums w-6 text-sm">{team.seed}</span>
            <span className="h-5 w-1.5 rounded-sm" style={{ background: teams.get(team.teamId)?.color }} />
            <span className="min-w-0 flex-1 truncate">{teams.get(team.teamId)?.school}</span>
            <span className="text-xs text-muted">{team.reason}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-muted">
        First teams out: {firstOut.map((id) => teams.get(id)?.school).filter(Boolean).join(", ") || "none"}
      </p>
    </section>
  );
}
