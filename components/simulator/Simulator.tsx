"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bracket, laterPlayoffSlots } from "@/components/simulator/Bracket";
import { renderBracketPng } from "@/components/simulator/bracketImage";
import { RankList } from "@/components/simulator/RankList";
import { InfoTip } from "@/components/info/InfoTip";
import { TeamMark, teamInk } from "@/components/team/TeamMark";
import { contenderBoard, simulate, withWinOut } from "@/lib/cfp/engine";
import { decodeScenario, emptyScenario, encodeScenario } from "@/lib/cfp/share";
import type { ChampState, ContenderGroup, Game, Scenario, Team } from "@/lib/cfp/types";
import { cfpFormat, loadProfile, loadSeason, matchupSlug, rankingConfig } from "@/lib/load";

const STORAGE_KEY = "2fans1pod-scenario";
const profiles = loadProfile();

export function Simulator() {
  const data = useMemo(() => loadSeason(), []);
  const teams = useMemo(() => new Map(data.teams.map((team) => [team.id, team])), [data.teams]);
  const [scenario, setScenario] = useState<Scenario>(emptyScenario());
  const [ready, setReady] = useState(false);
  const [focusConference, setFocusConference] = useState("");
  const [focusTeam, setFocusTeam] = useState("");
  const [showOthers, setShowOthers] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [copied, setCopied] = useState(false);
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [pictureBlob, setPictureBlob] = useState<Blob | null>(null);
  const [pictureStatus, setPictureStatus] = useState<"idle" | "shared" | "saved">("idle");

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

  useEffect(() => {
    if (!ready || step !== 3) return;
    let cancel = false;
    let url = "";
    renderBracketPng(result.bracket, teams).then((blob) => {
      if (cancel) return;
      url = URL.createObjectURL(blob);
      setPictureBlob(blob);
      setPictureUrl(url);
    });
    return () => {
      cancel = true;
      if (url) URL.revokeObjectURL(url);
      setPictureUrl(null);
      setPictureBlob(null);
    };
  }, [ready, step, result, teams]);
  const board = useMemo(() => contenderBoard(data, rankingConfig), [data]);
  const independents = useMemo(
    () => data.teams.filter((team) => team.tier === "independent" && data.rankings.order.indexOf(team.id) < rankingConfig.bubbleRank).map((team) => team.id),
    [data, rankingConfig.bubbleRank],
  );
  const contenderIds = useMemo(() => {
    const ids = new Set<string>(independents);
    board.forEach((group) => {
      group.shown.forEach((id) => ids.add(id));
      group.hidden.forEach((id) => ids.add(id));
    });
    return ids;
  }, [board, independents]);

  const remainingFor = (teamId: string) =>
    result.games.filter((game) => !game.completed && (game.homeId === teamId || game.awayId === teamId));

  const setWinner = (gameId: string, winnerId: string) => {
    setScenario((current) => ({ ...current, picks: { ...current.picks, [gameId]: winnerId } }));
  };

  const toggleWinOut = (teamId: string) => {
    const conference = data.teams.find((team) => team.id === teamId)?.conference;
    setScenario((current) => {
      const draft = withWinOut(current, teamId, data.games, conference);
      if (!draft.winOut.includes(teamId) || !conference) return draft;
      const title = simulate(data, draft, cfpFormat, rankingConfig).games.find((game) => game.id === `ccg:${conference}`);
      if (!title || (title.homeId !== teamId && title.awayId !== teamId)) return draft;
      return withWinOut(current, teamId, data.games, conference, title);
    });
  };

  if (data.teams.length === 0) {
    return <p>Season data has not been built yet. Run the data script, then reload.</p>;
  }

  const otherGames = data.games.filter((game) => {
    if (game.completed || game.seasonType !== "regular") return false;
    if (game.homeId.startsWith("ext--") || game.awayId.startsWith("ext--")) return false;
    if (!teams.has(game.homeId) && !teams.has(game.awayId)) return false;
    return !contenderIds.has(game.homeId) && !contenderIds.has(game.awayId);
  });
  const weeks = [...new Set(otherGames.map((game) => game.week))].sort((a, b) => a - b);
  const winnerById = new Map(result.games.map((game) => [game.id, game.winnerId]));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const sharePicture = async () => {
    const blob = pictureBlob ?? (await renderBracketPng(result.bracket, teams));
    const file = new File([blob], "2fans1pod-bracket.png", { type: "image/png" });
    let canShareFile = false;
    try {
      canShareFile = typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
    } catch {
      canShareFile = false;
    }
    if (canShareFile) {
      try {
        await navigator.share({ files: [file], title: "2fans1pod bracket", text: result.sentence });
        setPictureStatus("shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    savePng(blob);
    setPictureStatus("saved");
  };

  const downloadPicture = async () => {
    const blob = pictureBlob ?? (await renderBracketPng(result.bracket, teams));
    savePng(blob);
  };

  return (
    <div>
      <ol className="grid grid-cols-3 gap-2">
        {(
          [
            [1, "1. Season"],
            [2, "2. Bracket"],
            [3, "3. Share"],
          ] as const
        ).map(([number, label]) => (
          <li key={number}>
            <button
              type="button"
              className={`min-h-11 w-full rounded-md border px-2 text-sm font-medium ${step === number ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface"}`}
              aria-current={step === number ? "step" : undefined}
              onClick={() => {
                setStep(number);
                setCopied(false);
                setPictureStatus("idle");
              }}
            >
              {label}
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-4 max-w-3xl text-lg leading-7">{result.sentence}</p>

      {step === 1 ? (
        <>
          <p className="mt-3 flex items-start gap-1 text-sm text-muted">
            <span>
              Pick a conference, then a team, then mark each remaining game W or L. That fills the 12-team field. Untouched games go to the higher-ranked team. Each future loss costs {rankingConfig.lossDropSpots} spots.
              {data.season.eloSource === "cfbd"
                ? " Teams outside the top 25 are ordered by College Football Data Elo."
                : " Teams outside the top 25 are ordered by an Elo rating computed from this season's results."}
            </span>
            <InfoTip label="How rankings are adjusted" text="The simulator starts from the latest CFP order, then Elo for everyone else. It applies every remaining result once. It does not re-rank after each game and then pick new favorites. Conference champions follow the records in your scenario. If the title game is not scheduled yet, the top two teams play a projected championship." />
          </p>
          <InOut resultField={result.field} firstOut={result.firstOut} teams={teams} remainingSos={(teamId) => profiles.teams[teamId]?.fpi.remainingStrengthOfSchedule ?? null} />
          <div className="mt-8 grid gap-10 min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <ScenarioBuilder
              board={board}
              independents={independents}
              teams={teams}
              scenario={scenario}
              champions={result.champions}
              focusConference={focusConference || board[0]?.conference || "Independents"}
              focusTeam={focusTeam}
              onConference={(value) => {
                setFocusConference(value);
                setFocusTeam("");
                setShowOthers(value === "other");
              }}
              onTeam={setFocusTeam}
              remainingFor={remainingFor}
              setWinner={setWinner}
              toggleWinOut={toggleWinOut}
              onChampion={(conference, team) => setScenario((current) => ({ ...current, champPicks: { ...current.champPicks, [conference]: team } }))}
              showOthers={showOthers}
              weeks={weeks}
              otherGames={otherGames}
              winnerById={winnerById}
            />
            <RankList
              order={result.order}
              teams={teams}
              manual={result.manual}
              onReorder={(order) => setScenario((current) => ({ ...current, manualOrder: order }))}
              onReset={() => setScenario((current) => ({ ...current, manualOrder: null }))}
            />
          </div>
          <button type="button" className="mt-6 min-h-11 rounded-full bg-accent px-5 font-medium text-accent-ink" onClick={() => setStep(2)}>
            Next: play the bracket
          </button>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <p className="mt-6 text-sm text-muted">Seeds 1 through 4 would choose among the Fiesta, Cotton, Peach, and Rose Bowls. This bracket shows the pairings. It does not pick the bowl sites.</p>
          <div className="mt-4">
            <Bracket
              slots={result.bracket}
              teams={teams}
              onPick={(slotId, teamId) =>
                setScenario((current) => {
                  if (current.playoffPicks[slotId] === teamId) return current;
                  const playoffPicks = { ...current.playoffPicks, [slotId]: teamId };
                  for (const later of laterPlayoffSlots(slotId)) delete playoffPicks[later];
                  return { ...current, playoffPicks };
                })
              }
            />
          </div>
          <div className="mt-6">
            <h2 className="text-xl">Compare a game</h2>
            <p className="mt-1 text-sm text-muted">These open the matchup calculator. Tapping a team in the tree still picks the winner.</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {result.bracket
                .filter((slot) => slot.teamA && slot.teamB)
                .map((slot) => (
                  <li key={slot.id}>
                    <Link href={`/matchup/${matchupSlug(slot.teamA as string, slot.teamB as string)}/`} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm">
                      {teams.get(slot.teamA as string)?.school ?? slot.teamA} vs {teams.get(slot.teamB as string)?.school ?? slot.teamB}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="min-h-11 rounded-full border border-line px-5" onClick={() => setStep(1)}>
              Back to the season
            </button>
            <button type="button" className="min-h-11 rounded-full bg-accent px-5 font-medium text-accent-ink" onClick={() => setStep(3)}>
              Next: share
            </button>
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <section className="mt-6">
          <h2 className="text-3xl">Share your bracket</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">Share saves a picture of the whole bracket: every game, the connecting lines, and the champion.</p>
          <div className="mt-4 overflow-x-auto">
            {pictureUrl ? (
              <img id="bracket-picture" src={pictureUrl} alt="Your full playoff bracket" className="h-auto max-w-none" style={{ width: 740 }} />
            ) : (
              <p className="text-sm text-muted">Drawing the bracket…</p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="min-h-11 rounded-full bg-accent px-5 font-medium text-accent-ink" onClick={sharePicture}>
              {pictureStatus === "shared" ? "Shared" : pictureStatus === "saved" ? "Saved" : "Share"}
            </button>
            <button type="button" className="min-h-11 rounded-full border border-line px-5" onClick={downloadPicture}>
              Download
            </button>
            <button type="button" className="min-h-11 rounded-full border border-line px-5" onClick={() => setStep(2)}>
              Back to the bracket
            </button>
          </div>
          <button type="button" className="mt-3 text-sm text-muted underline" onClick={copyLink}>
            {copied ? "Link copied" : "Copy link"}
          </button>
        </section>
      ) : null}
    </div>
  );
}

function savePng(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "2fans1pod-bracket.png";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function ScenarioBuilder({
  board,
  independents,
  teams,
  scenario,
  champions,
  focusConference,
  focusTeam,
  onConference,
  onTeam,
  remainingFor,
  setWinner,
  toggleWinOut,
  onChampion,
  showOthers,
  weeks,
  otherGames,
  winnerById,
}: {
  board: ContenderGroup[];
  independents: string[];
  teams: Map<string, Team>;
  scenario: Scenario;
  champions: Record<string, ChampState>;
  focusConference: string;
  focusTeam: string;
  onConference: (value: string) => void;
  onTeam: (value: string) => void;
  remainingFor: (teamId: string) => { id: string; homeId: string; awayId: string; homeName: string; awayName: string; projected: boolean; neutralSite: boolean; winnerId: string }[];
  setWinner: (gameId: string, winnerId: string) => void;
  toggleWinOut: (teamId: string) => void;
  onChampion: (conference: string, teamId: string) => void;
  showOthers: boolean;
  weeks: number[];
  otherGames: Game[];
  winnerById: Map<string, string>;
}) {
  const group = board.find((item) => item.conference === focusConference);
  const choices = focusConference === "Independents" ? independents : [...(group?.shown ?? []), ...(group?.hidden ?? [])];
  const selected = focusTeam && choices.includes(focusTeam) ? focusTeam : choices[0] ?? "";
  const team = teams.get(selected);
  const games = selected ? remainingFor(selected) : [];
  const tied = champions[focusConference]?.tied ?? [];

  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <h2 className="text-3xl">Build the scenario</h2>
      <p className="mt-2 text-sm text-muted">Pick a conference, then a team. Their remaining games are listed underneath. W means that team wins the game.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Conference
          <select className="min-h-11 rounded-md border border-line bg-paper px-3" value={showOthers ? "other" : focusConference} onChange={(event) => onConference(event.target.value)}>
            {board.map((item) => (
              <option key={item.conference} value={item.conference}>
                {item.conference}
              </option>
            ))}
            {independents.length ? <option value="Independents">Independents</option> : null}
            <option value="other">Every other game</option>
          </select>
        </label>
        {showOthers ? null : (
          <label className="grid gap-1 text-sm">
            Team
            <select className="min-h-11 rounded-md border border-line bg-paper px-3" value={selected} onChange={(event) => onTeam(event.target.value)}>
              {(group?.shown ?? (focusConference === "Independents" ? independents : [])).map((id) => (
                <option key={id} value={id}>
                  {teams.get(id)?.school ?? id}
                </option>
              ))}
              {group?.hidden.length ? (
                <optgroup label="Still alive">
                  {group.hidden.map((id) => (
                    <option key={id} value={id}>
                      {teams.get(id)?.school ?? id}
                    </option>
                  ))}
                </optgroup>
              ) : null}
            </select>
          </label>
        )}
      </div>
      {showOthers ? (
        <div className="mt-4">
          {weeks.map((week) => (
            <div key={week} className="mt-4">
              <h3 className="text-sm uppercase tracking-wide text-muted">Week {week}</h3>
              {otherGames
                .filter((game) => game.week === week)
                .map((game) => {
                  const winner = winnerById.get(game.id) ?? game.homeId;
                  return (
                    <div key={game.id} className="mt-2 flex flex-wrap items-center justify-between gap-2 border-b border-line py-2">
                      {teams.has(game.awayId) && teams.has(game.homeId) ? (
                        <Link href={`/matchup/${matchupSlug(game.awayId, game.homeId)}/`} className="text-sm underline-offset-4 hover:underline">
                          {game.awayName} {game.neutralSite ? "vs" : "at"} {game.homeName}
                        </Link>
                      ) : (
                        <span className="text-sm">
                          {game.awayName} {game.neutralSite ? "vs" : "at"} {game.homeName}
                        </span>
                      )}
                      <WinLoss winnerIsHome={winner === game.homeId} onHome={() => setWinner(game.id, game.homeId)} onAway={() => setWinner(game.id, game.awayId)} homeLabel={game.homeName} awayLabel={game.awayName} />
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      ) : team ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md px-3 py-3" style={{ background: team.color, color: teamInk(team.color) }}>
            <Link href={`/teams/${team.id}`} className="flex min-w-0 items-center gap-3">
              {team.logo ? <img src={team.logo} alt="" className="h-12 w-12 rounded-md bg-white p-1 object-contain" /> : null}
              <span className="text-2xl">{team.school}</span>
            </Link>
            <button type="button" className={`min-h-11 rounded-full px-4 text-sm font-medium ${scenario.winOut.includes(team.id) ? "bg-paper text-ink" : "border border-current"}`} onClick={() => toggleWinOut(team.id)}>
              Wins out
            </button>
          </div>
          <ul className="mt-3">
            {games.map((game) => {
              const opponentId = game.homeId === team.id ? game.awayId : game.homeId;
              const opponent = teams.get(opponentId);
              const opponentName = opponent?.school ?? (game.homeId === team.id ? game.awayName : game.homeName);
              const teamWon = game.winnerId === team.id;
              return (
                <li key={game.id} className="flex min-h-12 items-center gap-3 border-b border-line py-2">
                  <span className="w-24 shrink-0 text-xs uppercase tracking-wide text-muted">{game.projected ? "Projected" : game.neutralSite ? "Neutral" : game.homeId === team.id ? "Home" : "Away"}</span>
                  <span className="min-w-0 flex-1">
                    {opponent ? (
                      <Link href={`/matchup/${matchupSlug(team.id, opponent.id)}/`} className="inline-flex max-w-full">
                        <TeamMark team={opponent} size="sm" />
                      </Link>
                    ) : (
                      opponentName
                    )}
                  </span>
                  <span className="inline-flex shrink-0 overflow-hidden rounded-full border border-line">
                    <button type="button" className={`min-h-11 min-w-11 px-3 text-sm font-medium ${teamWon ? "bg-emerald-600 text-white" : "text-muted"}`} onClick={() => setWinner(game.id, team.id)}>
                      W
                    </button>
                    <button type="button" className={`min-h-11 min-w-11 px-3 text-sm font-medium ${!teamWon ? "bg-red-600 text-white" : "text-muted"}`} onClick={() => setWinner(game.id, opponentId)}>
                      L
                    </button>
                  </span>
                </li>
              );
            })}
            {games.length === 0 ? <li className="py-3 text-sm text-muted">No games left on the schedule.</li> : null}
          </ul>
          {tied.length > 1 ? (
            <label className="mt-3 flex min-h-11 flex-wrap items-center gap-2 text-sm">
              Title is tied. Who wins it?
              <select className="min-h-11 rounded-md border border-line bg-paper px-2" value={scenario.champPicks[focusConference] ?? champions[focusConference].teamId} onChange={(event) => onChampion(focusConference, event.target.value)}>
                {tied.map((id) => (
                  <option key={id} value={id}>
                    {teams.get(id)?.school ?? id}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">No contenders in this group yet.</p>
      )}
    </section>
  );
}

function WinLoss({
  winnerIsHome,
  onHome,
  onAway,
  homeLabel,
  awayLabel,
}: {
  winnerIsHome: boolean;
  onHome: () => void;
  onAway: () => void;
  homeLabel: string;
  awayLabel: string;
}) {
  return (
    <span className="inline-flex overflow-hidden rounded-full border border-line text-sm">
      <button type="button" className={`min-h-11 px-3 ${!winnerIsHome ? "bg-emerald-600 text-white" : "text-muted"}`} onClick={onAway}>
        {awayLabel} W
      </button>
      <button type="button" className={`min-h-11 px-3 ${winnerIsHome ? "bg-emerald-600 text-white" : "text-muted"}`} onClick={onHome}>
        {homeLabel} W
      </button>
    </span>
  );
}

function InOut({
  resultField,
  firstOut,
  teams,
  remainingSos,
}: {
  resultField: { teamId: string; seed: number; reason: string }[];
  firstOut: string[];
  teams: Map<string, Team>;
  remainingSos: (teamId: string) => number | null;
}) {
  return (
    <section className="mt-6">
      <h2 className="sr-only">Who is in and out</h2>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {resultField.map((team) => {
          const club = teams.get(team.teamId);
          return (
            <li key={team.teamId} className="flex min-h-11 items-center gap-2 rounded-md border border-line px-3 py-2" style={{ background: club ? `${club.color}18` : undefined }}>
              <span className="nums w-6 text-sm">{team.seed}</span>
              <span className="min-w-0 flex-1">
                <TeamMark team={club} size="sm" />
              </span>
              <span className="text-xs text-muted">
                {team.reason}
                {remainingSos(team.teamId) != null ? ` · Rem. SOS #${remainingSos(team.teamId)}` : ""}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm text-muted">
        First teams out: {firstOut.map((id) => teams.get(id)?.school).filter(Boolean).join(", ") || "none"}
      </p>
      <p className="mt-2 text-sm text-muted">Rem. SOS is ESPN&apos;s rank for the games still left. 1 is the hardest remaining schedule.</p>
    </section>
  );
}
