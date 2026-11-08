import { describe, expect, it } from "vitest";
import { contenderBoard, isAlive, simulate, withWinOut } from "./engine";
import { decodeScenario, encodeScenario, emptyScenario } from "./share";
import type { CfpFormat, Game, RankingConfig, SeasonData, Team } from "./types";

const format: CfpFormat = {
  powerConferences: ["ACC", "Big Ten", "Big 12", "SEC"],
  groupConferences: ["American", "Conference USA", "MAC", "Mountain West", "Pac-12", "Sun Belt"],
  notreDame: "Notre Dame",
  notreDameAutoBidMaxRank: 12,
  atLargeBids: 7,
  atLargeBidsIfNotreDameAuto: 6,
  seedAutoQualifiersOutsideTop12AtBottom: true,
};

const ranking: RankingConfig = {
  lossDropSpots: 4,
  championRankBoost: 0,
  bubbleRank: 30,
  earlySeasonCap: { power: 8, group: 5 },
};

function team(id: string, conference: string, tier: Team["tier"]): Team {
  return {
    id,
    school: id,
    mascot: "",
    abbreviation: id.slice(0, 3).toUpperCase(),
    conference,
    tier,
    color: "#000000",
    alternateColor: "#ffffff",
    logo: "",
    alternateNames: [],
  };
}

function future(id: string, home: string, away: string, conferenceGame = false): Game {
  return {
    id,
    week: 12,
    seasonType: "regular",
    startDate: "",
    homeId: home,
    awayId: away,
    homeName: home,
    awayName: away,
    homePoints: null,
    awayPoints: null,
    completed: false,
    conferenceGame,
    championship: false,
    neutralSite: false,
    venue: null,
    spread: null,
  };
}

function played(id: string, home: string, away: string, homePoints: number, awayPoints: number, conferenceGame = false): Game {
  return { ...future(id, home, away, conferenceGame), homePoints, awayPoints, completed: true, week: 3 };
}

function season(teams: Team[], games: Game[], order: string[]): SeasonData {
  return {
    season: {
      season: 2026,
      updatedAt: "",
      week: 11,
      provider: "test",
      eloSource: "computed",
      rankingLabel: "Test",
      fieldLocked: false,
      teamCount: teams.length,
    },
    teams,
    games,
    conferences: [],
    rankings: { cfp: order.slice(0, 25).map((teamId, index) => ({ teamId, rank: index + 1 })), order },
    stats: {},
  };
}

const power = ["SEC", "Big Ten", "Big 12", "ACC"] as const;

function fieldTeams() {
  const teams: Team[] = [];
  const order: string[] = [];
  power.forEach((conference, conferenceIndex) => {
    for (let n = 1; n <= 4; n += 1) {
      const id = `${conference}-${n}`;
      teams.push(team(id, conference, "power"));
      order.push(id);
    }
    void conferenceIndex;
  });
  for (let n = 1; n <= 6; n += 1) {
    const id = `G6-${n}`;
    teams.push(team(id, n % 2 === 0 ? "MAC" : "American", "group"));
    order.push(id);
  }
  teams.push(team("Notre Dame", "FBS Independents", "independent"));
  order.splice(7, 0, "Notre Dame");
  return { teams, order };
}

describe("playoff field", () => {
  it("gives Notre Dame an automatic bid inside the top 12 and leaves six at-large spots", () => {
    const { teams, order } = fieldTeams();
    const result = simulate(season(teams, [], order), emptyScenario(), format, ranking);
    const nd = result.field.find((entry) => entry.teamId === "Notre Dame");
    expect(nd?.reason).toBe("Notre Dame");
    expect(result.field.filter((entry) => entry.reason === "At-large")).toHaveLength(6);
    expect(result.field).toHaveLength(12);
  });

  it("does not give Notre Dame an automatic bid outside the top 12", () => {
    const { teams, order } = fieldTeams();
    const moved = order.filter((id) => id !== "Notre Dame");
    moved.splice(14, 0, "Notre Dame");
    const result = simulate(season(teams, [], moved), emptyScenario(), format, ranking);
    expect(result.field.find((entry) => entry.teamId === "Notre Dame")).toBeUndefined();
    expect(result.field.filter((entry) => entry.reason === "At-large")).toHaveLength(7);
  });

  it("seeds an automatic qualifier outside the top 12 at the bottom", () => {
    const { teams, order } = fieldTeams();
    const moved = order.filter((id) => id !== "SEC-1");
    moved.push("SEC-1");
    const scenario = emptyScenario();
    scenario.champPicks.SEC = "SEC-1";
    const result = simulate(season(teams, [], moved), scenario, format, ranking);
    const sec = result.field.find((entry) => entry.teamId === "SEC-1");
    expect(sec?.seed).toBe(12);
    expect(sec?.automatic).toBe(true);
  });

  it("gives the Group of Six bid to the highest-ranked team, not the conference champion", () => {
    const teams = [
      ...power.flatMap((conference) => [1, 2, 3].map((n) => team(`${conference}-${n}`, conference, "power"))),
      team("MAC-champ", "MAC", "group"),
      team("American-high", "American", "group"),
      ...Array.from({ length: 8 }, (_, n) => team(`Fill-${n}`, "Big Ten", "power")),
    ];
    const order = [
      "SEC-1",
      "Big Ten-1",
      "Big 12-1",
      "American-high",
      "ACC-1",
      "SEC-2",
      "Big Ten-2",
      "Big 12-2",
      "ACC-2",
      "SEC-3",
      "Fill-0",
      "Fill-1",
      "MAC-champ",
      ...teams.map((item) => item.id).filter((id) => !["SEC-1", "Big Ten-1", "Big 12-1", "American-high", "ACC-1", "SEC-2", "Big Ten-2", "Big 12-2", "ACC-2", "SEC-3", "Fill-0", "Fill-1", "MAC-champ"].includes(id)),
    ];
    const games = [
      played("1", "MAC-champ", "MAC-other", 1, 0, true),
    ];
    const withExtra = [...teams, team("MAC-other", "MAC", "group")];
    const result = simulate(season(withExtra, games, order), emptyScenario(), format, ranking);
    const bid = result.field.find((entry) => entry.reason === "Group of Six bid");
    expect(bid?.teamId).toBe("American-high");
  });
});

describe("ranking adjustment", () => {
  it("drops a team four spots for a future loss", () => {
    const teams = Array.from({ length: 8 }, (_, n) => team(`T${n + 1}`, "SEC", "power"));
    const order = teams.map((item) => item.id);
    const games = [future("g", "T1", "T8")];
    const scenario = emptyScenario();
    scenario.picks.g = "T8";
    const result = simulate(season(teams, games, order), scenario, format, ranking);
    expect(result.formulaOrder.indexOf("T1")).toBeGreaterThan(3);
    expect(result.formulaOrder.indexOf("T1")).toBeGreaterThan(result.formulaOrder.indexOf("T8"));
  });

  it("does not count a postseason game as a regular-season loss", () => {
    const teams = Array.from({ length: 8 }, (_, n) => team(`T${n + 1}`, "SEC", "power"));
    const order = teams.map((item) => item.id);
    const bowl = { ...future("bowl", "T1", "T8"), seasonType: "postseason" as const, week: 1 };
    const scenario = emptyScenario();
    scenario.picks.bowl = "T8";
    const result = simulate(season(teams, [bowl], order), scenario, format, ranking);
    const baseline = simulate(season(teams, [], order), emptyScenario(), format, ranking);
    expect(result.formulaOrder).toEqual(baseline.formulaOrder);
  });

  it("puts a loser behind a worse team that beat them", () => {
    const teams = Array.from({ length: 6 }, (_, n) => team(`T${n + 1}`, "SEC", "power"));
    const order = teams.map((item) => item.id);
    const scenario = emptyScenario();
    scenario.picks.g = "T6";
    const result = simulate(season(teams, [future("g", "T1", "T6")], order), scenario, format, ranking);
    expect(result.formulaOrder.indexOf("T1")).toBeGreaterThan(result.formulaOrder.indexOf("T6"));
  });
});

describe("early-season cap", () => {
  function tenTeamSeason(week: number) {
    const teams = Array.from({ length: 10 }, (_, n) => team(`T${n + 1}`, "SEC", "power"));
    const data = season(teams, [], teams.map((item) => item.id));
    data.season.week = week;
    data.conferences = [{ id: "sec", name: "SEC", tier: "power", teams: teams.map((item) => item.id) }];
    return data;
  }

  const capped = { ...ranking, bubbleRank: 0, earlySeasonThroughWeek: 5 };

  it("shows every team still alive after the early weeks", () => {
    const board = contenderBoard(tenTeamSeason(11), capped);
    expect(board[0].hidden).toEqual([]);
    expect(board[0].shown).toHaveLength(10);
  });

  it("caps a power conference at eight teams during the early weeks", () => {
    const board = contenderBoard(tenTeamSeason(3), capped);
    expect(board[0].shown).toHaveLength(8);
    expect(board[0].hidden).toEqual(["T9", "T10"]);
  });
});

describe("conference title", () => {
  it("does not call second place a tie for the title", () => {
    const teams = ["Leader", "Second", "Third", "Fourth"].map((id) => team(id, "Big Ten", "power"));
    const games = [
      played("a", "Leader", "Second", 1, 0, true),
      played("b", "Leader", "Third", 1, 0, true),
      played("c", "Second", "Fourth", 1, 0, true),
      played("d", "Third", "Fourth", 1, 0, true),
    ];
    const result = simulate(season(teams, games, ["Second", "Third", "Leader", "Fourth"]), emptyScenario(), format, ranking);
    expect(result.champions["Big Ten"].tied).toEqual([]);
    expect(result.champions["Big Ten"].teamId).toBe("Second");
  });

  it("leaves a two-team tie to the projected title game", () => {
    const teams = ["A", "B", "C"].map((id) => team(id, "SEC", "power"));
    const games = [played("a", "A", "C", 1, 0, true), played("b", "B", "C", 1, 0, true)];
    const result = simulate(season(teams, games, ["B", "A", "C"]), emptyScenario(), format, ranking);
    expect(result.champions.SEC.tied).toEqual([]);
    expect(result.champions.SEC.teamId).toBe("B");
  });

  it("asks the visitor when three or more teams share the best record", () => {
    const teams = ["A", "B", "C", "D"].map((id) => team(id, "MAC", "group"));
    const games = [played("a", "A", "D", 1, 0, true), played("b", "B", "D", 1, 0, true), played("c", "C", "D", 1, 0, true)];
    const result = simulate(season(teams, games, ["A", "B", "C", "D"]), emptyScenario(), format, ranking);
    expect(result.champions.MAC.tied).toEqual(["A", "B", "C"]);
  });
});

describe("wins out on a shared game", () => {
  it("gives the head-to-head to the team that most recently wins out", () => {
    const teams = ["Favorite", "Underdog"].map((id) => team(id, "SEC", "power"));
    const games = [future("g", "Favorite", "Underdog")];
    let scenario = withWinOut(emptyScenario(), "Favorite", games, "SEC");
    scenario = withWinOut(scenario, "Underdog", games, "SEC");
    const result = simulate(season(teams, games, ["Favorite", "Underdog"]), scenario, format, ranking);
    expect(result.games.find((game) => game.id === "g")?.winnerId).toBe("Underdog");
  });

  it("ignores a title-game pick for a team that is not playing", () => {
    const teams = ["A", "B", "C"].map((id) => team(id, "SEC", "power"));
    const games = [played("a", "A", "C", 1, 0, true), played("b", "B", "C", 1, 0, true)];
    const scenario = emptyScenario();
    scenario.picks["ccg:SEC"] = "C";
    const result = simulate(season(teams, games, ["A", "B", "C"]), scenario, format, ranking);
    expect(result.champions.SEC.teamId).toBe("A");
  });
});

describe("wins out and still alive", () => {
  it("makes a team the champion when they win out and the leader loses", () => {
    const teams = ["Wake", "Clemson", "Duke", "Pitt"].map((id) => team(id, "ACC", "power"));
    const games = [
      played("p1", "Clemson", "Duke", 1, 0, true),
      played("p2", "Wake", "Pitt", 1, 0, true),
      future("g1", "Wake", "Clemson", true),
      future("g2", "Duke", "Pitt", true),
    ];
    const order = ["Clemson", "Wake", "Duke", "Pitt"];
    const scenario = emptyScenario();
    scenario.winOut = ["Wake"];
    scenario.picks.g2 = "Pitt";
    const result = simulate(season(teams, games, order), scenario, format, ranking);
    expect(result.champions.ACC.teamId).toBe("Wake");
  });

  it("knows who can still catch the leader", () => {
    const teams = ["Leader", "Alive", "Gone"].map((id) => team(id, "ACC", "power"));
    const games = [
      played("a", "Leader", "Gone", 1, 0, true),
      future("c", "Alive", "Leader", true),
    ];
    const data = season(teams, games, ["Leader", "Alive", "Gone"]);
    data.conferences = [{ id: "acc", name: "ACC", tier: "power", teams: ["Leader", "Alive", "Gone"] }];
    expect(isAlive("Alive", data)).toBe(true);
    expect(isAlive("Gone", data)).toBe(false);
  });
});

describe("share links", () => {
  it("round-trips a scenario", () => {
    const scenario = emptyScenario();
    scenario.picks.g1 = "alabama";
    scenario.winOut = ["wake-forest"];
    scenario.playoffPicks["r1-5-12"] = "kentucky";
    scenario.manualOrder = ["a", "b", "c"];
    const again = decodeScenario(encodeScenario(scenario));
    expect(again).toEqual(scenario);
  });
});
