export type Tier = "power" | "group" | "independent";

export interface Team {
  id: string;
  school: string;
  mascot: string;
  abbreviation: string;
  conference: string;
  tier: Tier;
  color: string;
  alternateColor: string;
  logo: string;
  alternateNames: string[];
}

export interface Game {
  id: string;
  week: number;
  seasonType: "regular" | "postseason";
  startDate: string;
  homeId: string;
  awayId: string;
  homeName: string;
  awayName: string;
  homePoints: number | null;
  awayPoints: number | null;
  completed: boolean;
  conferenceGame: boolean;
  championship: boolean;
  neutralSite: boolean;
  venue: string | null;
  spread: string | null;
}

export interface StatCell {
  value: number | null;
  rank: number | null;
}

export interface TeamSeason {
  games: number;
  wins: number;
  losses: number;
  conferenceWins: number;
  conferenceLosses: number;
  offense: Record<string, StatCell>;
  defense: Record<string, StatCell>;
  sos: StatCell;
  ats: { wins: number; losses: number; pushes: number; rank: number | null };
}

export interface Conference {
  id: string;
  name: string;
  tier: Tier;
  teams: string[];
}

export interface SeasonMeta {
  season: number;
  updatedAt: string;
  week: number;
  provider: string;
  eloSource: "cfbd" | "computed";
  rankingLabel: string;
  fieldLocked: boolean;
  teamCount: number;
}

export interface SeasonData {
  season: SeasonMeta;
  teams: Team[];
  games: Game[];
  conferences: Conference[];
  rankings: { cfp: { teamId: string; rank: number }[]; order: string[] };
  stats: Record<string, TeamSeason>;
}

export interface CfpFormat {
  powerConferences: string[];
  groupConferences: string[];
  notreDame: string;
  notreDameAutoBidMaxRank: number;
  atLargeBids: number;
  atLargeBidsIfNotreDameAuto: number;
  seedAutoQualifiersOutsideTop12AtBottom: boolean;
}

export interface RankingConfig {
  lossDropSpots: number;
  championRankBoost: number;
  bubbleRank: number;
  earlySeasonCap: { power: number; group: number };
}

export interface Scenario {
  picks: Record<string, string>;
  winOut: string[];
  champPicks: Record<string, string>;
  manualOrder: string[] | null;
  playoffPicks: Record<string, string>;
}

export const emptyScenario = (): Scenario => ({
  picks: {},
  winOut: [],
  champPicks: {},
  manualOrder: null,
  playoffPicks: {},
});

export interface ResolvedGame extends Game {
  winnerId: string;
  projected: boolean;
}

export interface SeededTeam {
  teamId: string;
  seed: number;
  reason: string;
  conference: string;
  automatic: boolean;
}

export interface ChampState {
  teamId: string;
  tied: string[];
}

export interface BracketSlot {
  id: string;
  round: "First round" | "Quarterfinal" | "Semifinal" | "Championship";
  seedA: number | null;
  seedB: number | null;
  teamA: string | null;
  teamB: string | null;
  winnerId: string | null;
  venueNote: string;
}

export interface SimResult {
  order: string[];
  formulaOrder: string[];
  manual: boolean;
  games: ResolvedGame[];
  champions: Record<string, ChampState>;
  field: SeededTeam[];
  firstOut: string[];
  bracket: BracketSlot[];
  sentence: string;
}

export interface ContenderGroup {
  conference: string;
  tier: Tier;
  shown: string[];
  hidden: string[];
}
