import type {
  BracketSlot,
  CfpFormat,
  ChampState,
  ContenderGroup,
  Game,
  RankingConfig,
  ResolvedGame,
  Scenario,
  SeasonData,
  SeededTeam,
  SimResult,
  Team,
} from "./types";

const FIRST_ROUND: [number, number][] = [
  [5, 12],
  [6, 11],
  [7, 10],
  [8, 9],
];

function teamMap(data: SeasonData) {
  return new Map(data.teams.map((team) => [team.id, team]));
}

function startRanks(data: SeasonData) {
  const known = new Set(data.teams.map((team) => team.id));
  const order = data.rankings.order.filter((id) => known.has(id));
  const index = new Map(order.map((id, position) => [id, position + 1]));
  return { order, index };
}

function betterStart(a: string, b: string, index: Map<string, number>, known: Set<string>) {
  const aKnown = known.has(a);
  const bKnown = known.has(b);
  if (aKnown && !bKnown) return a;
  if (bKnown && !aKnown) return b;
  return (index.get(a) ?? 9999) <= (index.get(b) ?? 9999) ? a : b;
}

function actualWinner(game: Game): string | null {
  if (!game.completed || game.homePoints == null || game.awayPoints == null) return null;
  if (game.homePoints === game.awayPoints) return null;
  return game.homePoints > game.awayPoints ? game.homeId : game.awayId;
}

function resolveScheduled(
  game: Game,
  scenario: Scenario,
  index: Map<string, number>,
  known: Set<string>,
): string {
  const played = actualWinner(game);
  if (played) return played;
  const picked = scenario.picks[game.id];
  if (picked === game.homeId || picked === game.awayId) return picked;
  const homeOut = scenario.winOut.includes(game.homeId);
  const awayOut = scenario.winOut.includes(game.awayId);
  if (homeOut && !awayOut) return game.homeId;
  if (awayOut && !homeOut) return game.awayId;
  return betterStart(game.homeId, game.awayId, index, known);
}

interface RecordLine {
  wins: number;
  losses: number;
  confWins: number;
  confLosses: number;
}

function blankRecord(): RecordLine {
  return { wins: 0, losses: 0, confWins: 0, confLosses: 0 };
}

function addResult(records: Map<string, RecordLine>, winner: string, loser: string, conferenceGame: boolean) {
  const win = records.get(winner) ?? blankRecord();
  const loss = records.get(loser) ?? blankRecord();
  win.wins += 1;
  loss.losses += 1;
  if (conferenceGame) {
    win.confWins += 1;
    loss.confLosses += 1;
  }
  records.set(winner, win);
  records.set(loser, loss);
}

function recordKey(line: RecordLine | undefined) {
  return `${line?.confWins ?? 0}-${line?.confLosses ?? 0}`;
}

function sortByRecord(ids: string[], records: Map<string, RecordLine>, index: Map<string, number>) {
  return [...ids].sort((a, b) => {
    const ar = records.get(a) ?? blankRecord();
    const br = records.get(b) ?? blankRecord();
    if (br.confWins !== ar.confWins) return br.confWins - ar.confWins;
    if (ar.confLosses !== br.confLosses) return ar.confLosses - br.confLosses;
    return (index.get(a) ?? 9999) - (index.get(b) ?? 9999);
  });
}

function championForConference(
  conference: string,
  teams: Team[],
  resolved: ResolvedGame[],
  scenario: Scenario,
  index: Map<string, number>,
  known: Set<string>,
): { champ: ChampState; projected: ResolvedGame | null } {
  const members = teams.filter((team) => team.conference === conference).map((team) => team.id);
  const records = new Map<string, RecordLine>();
  for (const id of members) records.set(id, blankRecord());
  for (const game of resolved) {
    if (game.championship || game.projected || !game.conferenceGame) continue;
    if (!members.includes(game.homeId) || !members.includes(game.awayId)) continue;
    const loser = game.winnerId === game.homeId ? game.awayId : game.homeId;
    addResult(records, game.winnerId, loser, true);
  }
  const real = resolved.find(
    (game) =>
      game.championship &&
      !game.projected &&
      members.includes(game.homeId) &&
      members.includes(game.awayId),
  );
  const ordered = sortByRecord(members, records, index);
  if (real) {
    return { champ: { teamId: real.winnerId, tied: [] }, projected: null };
  }
  if (ordered.length === 0) return { champ: { teamId: "", tied: [] }, projected: null };
  const best = recordKey(records.get(ordered[0]));
  const leaders = ordered.filter((id) => recordKey(records.get(id)) === best);
  // Two teams with the best record play the projected title game. Ask the visitor only when three or more share that record.
  const tied = leaders.length > 2 ? leaders : [];
  const [homeId, awayId] = tied.length > 2 ? teamsInTitle(conference, ordered, tied, scenario) : [ordered[0], ordered[1] ?? ordered[0]];
  if (homeId === awayId) return { champ: { teamId: homeId, tied }, projected: null };
  const home = teams.find((team) => team.id === homeId);
  const away = teams.find((team) => team.id === awayId);
  const projectedId = `ccg:${conference}`;
  const winner = (() => {
    const crowned = scenario.champPicks[conference];
    const picked = scenario.picks[projectedId];
    if (picked === homeId || picked === awayId) return picked;
    if (tied.length > 2 && (crowned === homeId || crowned === awayId)) return crowned;
    const homeOut = scenario.winOut.includes(homeId);
    const awayOut = scenario.winOut.includes(awayId);
    if (homeOut && !awayOut) return homeId;
    if (awayOut && !homeOut) return awayId;
    return betterStart(homeId, awayId, index, known);
  })();
  const projected: ResolvedGame = {
    id: projectedId,
    week: 16,
    seasonType: "regular",
    startDate: "",
    homeId,
    awayId,
    homeName: home?.school ?? homeId,
    awayName: away?.school ?? awayId,
    homePoints: null,
    awayPoints: null,
    completed: false,
    conferenceGame: true,
    championship: true,
    neutralSite: true,
    venue: null,
    spread: null,
    winnerId: winner,
    projected: true,
  };
  return { champ: { teamId: winner, tied, playing: tied.length > 2 ? [homeId, awayId] : undefined }, projected };
}

function teamsInTitle(conference: string, ordered: string[], tied: string[], scenario: Scenario): [string, string] {
  const chosen = scenario.titlePairs?.[conference];
  let home = ordered[0];
  let away = ordered[1] ?? ordered[0];
  if (chosen && chosen[0] !== chosen[1] && tied.includes(chosen[0]) && tied.includes(chosen[1])) {
    home = chosen[0];
    away = chosen[1];
  }
  const crowned = scenario.champPicks[conference];
  if (crowned && tied.includes(crowned) && crowned !== home && crowned !== away) away = crowned;
  return [home, away];
}

function formulaOrder(
  data: SeasonData,
  resolved: ResolvedGame[],
  champions: Record<string, string>,
  ranking: RankingConfig,
) {
  const { order, index } = startRanks(data);
  const known = new Set(order);
  const losses = new Map<string, { opponent: string }[]>();
  for (const id of order) losses.set(id, []);
  for (const game of resolved) {
    if (game.completed && !game.projected) continue;
    const loser = game.winnerId === game.homeId ? game.awayId : game.homeId;
    if (!known.has(loser)) continue;
    losses.get(loser)?.push({ opponent: known.has(game.winnerId) ? game.winnerId : "" });
  }
  const champSet = new Set(Object.values(champions));
  const scored = order.map((id) => {
    const future = losses.get(id) ?? [];
    let score = (index.get(id) ?? 999) + future.length * ranking.lossDropSpots;
    if (champSet.has(id)) score -= ranking.championRankBoost;
    for (const loss of future) {
      const opponentRank = index.get(loss.opponent);
      const ownRank = index.get(id) ?? 999;
      if (opponentRank != null && opponentRank > ownRank) {
        score = Math.max(score, opponentRank + 1);
      }
    }
    return { id, score, start: index.get(id) ?? 999 };
  });
  scored.sort((a, b) => a.score - b.score || a.start - b.start);
  return scored.map((row) => row.id);
}

function selectField(order: string[], teams: Map<string, Team>, champions: Record<string, string>, format: CfpFormat): {
  field: SeededTeam[];
  firstOut: string[];
} {
  const rankOf = new Map(order.map((id, position) => [id, position + 1]));
  const autos: { id: string; reason: string; automatic: boolean }[] = [];
  for (const conference of format.powerConferences) {
    const id = champions[conference];
    if (id) autos.push({ id, reason: `${conference} champion`, automatic: true });
  }
  const groupIds = order.filter((id) => teams.get(id)?.tier === "group");
  if (groupIds[0]) autos.push({ id: groupIds[0], reason: "Group of Six bid", automatic: true });
  const notreDame = [...teams.values()].find((team) => team.school === format.notreDame);
  const ndRank = notreDame ? rankOf.get(notreDame.id) ?? 999 : 999;
  const ndAuto = Boolean(notreDame && ndRank <= format.notreDameAutoBidMaxRank);
  if (ndAuto && notreDame) autos.push({ id: notreDame.id, reason: "Notre Dame", automatic: true });
  const autoIds = new Set<string>();
  const uniqueAutos = autos.filter((entry) => {
    if (!entry.id || autoIds.has(entry.id)) return false;
    autoIds.add(entry.id);
    return true;
  });
  const slots = ndAuto ? format.atLargeBidsIfNotreDameAuto : format.atLargeBids;
  const atLarge = order.filter((id) => !autoIds.has(id)).slice(0, slots);
  const chosen = [
    ...uniqueAutos,
    ...atLarge.map((id) => ({ id, reason: "At-large", automatic: false })),
  ].slice(0, 12);
  const inField = new Set(chosen.map((entry) => entry.id));
  const aqOutside = format.seedAutoQualifiersOutsideTop12AtBottom
    ? chosen.filter((entry) => entry.automatic && (rankOf.get(entry.id) ?? 999) > 12)
    : [];
  const outsideIds = new Set(aqOutside.map((entry) => entry.id));
  const rest = chosen
    .filter((entry) => !outsideIds.has(entry.id))
    .sort((a, b) => (rankOf.get(a.id) ?? 999) - (rankOf.get(b.id) ?? 999));
  const sunk = [...aqOutside].sort((a, b) => (rankOf.get(a.id) ?? 999) - (rankOf.get(b.id) ?? 999));
  const seeded = [...rest, ...sunk].map((entry, position) => {
    const team = teams.get(entry.id);
    return {
      teamId: entry.id,
      seed: position + 1,
      reason: entry.reason,
      conference: team?.conference ?? "",
      automatic: entry.automatic,
    };
  });
  return { field: seeded, firstOut: order.filter((id) => !inField.has(id)).slice(0, 5) };
}

function buildBracket(field: SeededTeam[], scenario: Scenario, teams: Map<string, Team>): BracketSlot[] {
  const bySeed = new Map(field.map((team) => [team.seed, team.teamId]));
  const seedOf = new Map(field.map((team) => [team.teamId, team.seed]));
  const slots: BracketSlot[] = [];

  const play = (
    id: string,
    round: BracketSlot["round"],
    teamA: string | null,
    teamB: string | null,
  ): string | null => {
    const seedA = teamA ? seedOf.get(teamA) ?? null : null;
    const seedB = teamB ? seedOf.get(teamB) ?? null : null;
    let winner: string | null = null;
    if (teamA && teamB) {
      const picked = scenario.playoffPicks[id];
      if (picked === teamA || picked === teamB) winner = picked;
      else winner = (seedA ?? 99) <= (seedB ?? 99) ? teamA : teamB;
    } else {
      winner = teamA ?? teamB;
    }
    const school = (teamId: string | null) => (teamId ? teams.get(teamId)?.school ?? "TBD" : "TBD");
    const host = (seedA ?? 99) <= (seedB ?? 99) ? school(teamA) : school(teamB);
    const venueNote = !teamA || !teamB ? "Bye" : round === "First round" ? `at ${host}` : "Bowl site not chosen";
    slots.push({
      id,
      round,
      seedA,
      seedB,
      teamA,
      teamB,
      winnerId: winner,
      venueNote,
    });
    return winner;
  };

  const winners = new Map<string, string | null>();
  for (const [high, low] of FIRST_ROUND) {
    const id = `r1-${high}-${low}`;
    winners.set(id, play(id, "First round", bySeed.get(high) ?? null, bySeed.get(low) ?? null));
  }
  const quarters: [string, number, string][] = [
    ["qf-1", 1, "r1-8-9"],
    ["qf-2", 2, "r1-7-10"],
    ["qf-3", 3, "r1-6-11"],
    ["qf-4", 4, "r1-5-12"],
  ];
  for (const [id, seed, source] of quarters) {
    winners.set(id, play(id, "Quarterfinal", bySeed.get(seed) ?? null, winners.get(source) ?? null));
  }
  const semiOne = play("sf-1", "Semifinal", winners.get("qf-1") ?? null, winners.get("qf-4") ?? null);
  const semiTwo = play("sf-2", "Semifinal", winners.get("qf-2") ?? null, winners.get("qf-3") ?? null);
  play("final", "Championship", semiOne, semiTwo);
  return slots;
}

function ordinal(seed: number) {
  const teen = seed % 100;
  if (teen >= 11 && teen <= 13) return `${seed}th`;
  const last = seed % 10;
  if (last === 1) return `${seed}st`;
  if (last === 2) return `${seed}nd`;
  if (last === 3) return `${seed}rd`;
  return `${seed}th`;
}

function writeSentence(
  field: SeededTeam[],
  firstOut: string[],
  teams: Map<string, Team>,
  fieldLocked: boolean,
  scenario: Scenario,
) {
  const name = (id: string | undefined) => (id ? teams.get(id)?.school ?? "A team" : "The next team");
  const last = field[field.length - 1];
  const out = name(firstOut[0]);
  const untouched =
    Object.keys(scenario.picks).length === 0 &&
    scenario.winOut.length === 0 &&
    scenario.manualOrder == null &&
    Object.keys(scenario.champPicks).length === 0 &&
    Object.keys(scenario.titlePairs ?? {}).length === 0;
  if (fieldLocked && untouched) {
    return `This is the official field. ${name(last?.teamId)} is the ${ordinal(last?.seed ?? 12)} seed. ${out} is the first team out.`;
  }
  const bubble = field.find((team) => team.automatic && team.reason.includes("champion") && team.seed >= 5);
  if (bubble) {
    const school = name(bubble.teamId);
    return `${school} wins the ${bubble.conference} and is the ${ordinal(bubble.seed)} seed. ${out} is the first team out.`;
  }
  if (!last) return "Pick the remaining games to see the bracket.";
  return `${name(last.teamId)} is the last team in, the ${ordinal(last.seed)} seed (${last.reason}). ${out} is the first team out.`;
}

export function withWinOut(
  scenario: Scenario,
  teamId: string,
  games: Game[],
  conference: string | undefined,
  titleGame?: { id: string; homeId: string; awayId: string } | null,
): Scenario {
  const turningOff = scenario.winOut.includes(teamId);
  const picks = { ...scenario.picks };
  const involved = games.filter(
    (game) => !game.completed && game.seasonType === "regular" && (game.homeId === teamId || game.awayId === teamId),
  );
  const titleId = conference ? `ccg:${conference}` : "";
  if (turningOff) {
    for (const game of involved) {
      if (picks[game.id] === teamId) delete picks[game.id];
    }
    if (titleId && picks[titleId] === teamId) delete picks[titleId];
    return { ...scenario, winOut: scenario.winOut.filter((id) => id !== teamId), picks };
  }
  for (const game of involved) picks[game.id] = teamId;
  if (titleGame && (titleGame.homeId === teamId || titleGame.awayId === teamId)) picks[titleGame.id] = teamId;
  return { ...scenario, winOut: [...scenario.winOut, teamId], picks };
}

export function simulate(data: SeasonData, scenario: Scenario, format: CfpFormat, ranking: RankingConfig): SimResult {
  const teams = teamMap(data);
  const known = new Set(teams.keys());
  const { index } = startRanks(data);
  const resolved: ResolvedGame[] = data.games.filter((game) => game.seasonType === "regular").map((game) => ({
    ...game,
    winnerId: resolveScheduled(game, scenario, index, known),
    projected: false,
  }));
  const champions: Record<string, ChampState> = {};
  const champIds: Record<string, string> = {};
  for (const conference of [...format.powerConferences, ...format.groupConferences]) {
    const result = championForConference(conference, data.teams, resolved, scenario, index, known);
    if (!result.champ.teamId) continue;
    champions[conference] = result.champ;
    champIds[conference] = result.champ.teamId;
    if (result.projected) resolved.push(result.projected);
  }
  const formula = formulaOrder(data, resolved, champIds, ranking);
  const manual = scenario.manualOrder?.filter((id) => known.has(id)) ?? null;
  const order = manual && manual.length ? manual : formula;
  const selected = selectField(order, teams, champIds, format);
  const bracket = buildBracket(selected.field, scenario, teams);
  return {
    order,
    formulaOrder: formula,
    manual: Boolean(manual && manual.length),
    games: resolved,
    champions,
    field: selected.field,
    firstOut: selected.firstOut,
    bracket,
    sentence: writeSentence(selected.field, selected.firstOut, teams, data.season.fieldLocked, scenario),
  };
}

export function currentRecords(data: SeasonData) {
  const records = new Map<string, RecordLine>();
  for (const team of data.teams) records.set(team.id, blankRecord());
  for (const game of data.games) {
    const winner = actualWinner(game);
    if (!winner) continue;
    const loser = winner === game.homeId ? game.awayId : game.homeId;
    if (!records.has(winner) || !records.has(loser)) continue;
    addResult(records, winner, loser, game.conferenceGame && !game.championship);
  }
  return records;
}

export function contenderBoard(data: SeasonData, ranking: RankingConfig): ContenderGroup[] {
  const { order, index } = startRanks(data);
  const records = currentRecords(data);
  const remaining = new Map<string, number>();
  for (const team of data.teams) remaining.set(team.id, 0);
  for (const game of data.games) {
    if (game.completed || game.seasonType !== "regular" || !game.conferenceGame || game.championship) continue;
    if (remaining.has(game.homeId)) remaining.set(game.homeId, (remaining.get(game.homeId) ?? 0) + 1);
    if (remaining.has(game.awayId)) remaining.set(game.awayId, (remaining.get(game.awayId) ?? 0) + 1);
  }
  const bubble = new Set(order.slice(0, ranking.bubbleRank));
  return data.conferences
    .filter((conference) => conference.tier !== "independent")
    .map((conference) => {
      const ids = conference.teams.filter((id) => index.has(id));
      const leaderWins = Math.max(0, ...ids.map((id) => records.get(id)?.confWins ?? 0));
      const alive = ids.filter((id) => (records.get(id)?.confWins ?? 0) + (remaining.get(id) ?? 0) >= leaderWins);
      const cap = conference.tier === "power" ? ranking.earlySeasonCap.power : ranking.earlySeasonCap.group;
      const aliveSorted = sortByRecord(alive, records, index);
      const early = ranking.earlySeasonThroughWeek == null || data.season.week <= ranking.earlySeasonThroughWeek;
      const capped = early ? aliveSorted.slice(0, cap) : aliveSorted;
      const shown = order.filter((id) => ids.includes(id) && (bubble.has(id) || capped.includes(id)));
      const hidden = aliveSorted.filter((id) => !shown.includes(id));
      return { conference: conference.name, tier: conference.tier, shown, hidden };
    });
}

export function isAlive(teamId: string, data: SeasonData) {
  const records = currentRecords(data);
  const team = data.teams.find((item) => item.id === teamId);
  if (!team) return false;
  const mates = data.teams.filter((item) => item.conference === team.conference);
  const remaining = (id: string) =>
    data.games.filter(
      (game) =>
        game.seasonType === "regular" &&
        !game.completed &&
        game.conferenceGame &&
        !game.championship &&
        (game.homeId === id || game.awayId === id),
    ).length;
  const leader = Math.max(...mates.map((item) => records.get(item.id)?.confWins ?? 0));
  return (records.get(teamId)?.confWins ?? 0) + remaining(teamId) >= leader;
}
