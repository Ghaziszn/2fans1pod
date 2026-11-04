import catalog from "@/config/stat-catalog.json";
import format from "@/config/cfp-format.json";
import ranking from "@/config/ranking.json";
import rivalries from "@/config/rivalries.json";
import site from "@/config/site.json";
import conferences from "@/public/data/conferences.json";
import games from "@/public/data/games.json";
import rankings from "@/public/data/rankings.json";
import season from "@/public/data/season.json";
import searchIndex from "@/public/data/search-index.json";
import stats from "@/public/data/team-stats.json";
import teams from "@/public/data/teams.json";
import type { CfpFormat, Conference, Game, RankingConfig, SeasonData, SeasonMeta, Team, TeamSeason } from "@/lib/cfp/types";

export const siteConfig = site;
export const statCatalog = catalog;
export const cfpFormat = format as CfpFormat;
export const rankingConfig = ranking as RankingConfig;
export const rivalryList = rivalries as { name: string; home: string; away: string }[];

export function loadSeason(): SeasonData {
  return {
    season: season as SeasonMeta,
    teams: teams as Team[],
    games: games as Game[],
    conferences: conferences as Conference[],
    rankings: rankings as SeasonData["rankings"],
    stats: stats as Record<string, TeamSeason>,
  };
}

export type SearchEntry = {
  type: string;
  name: string;
  detail: string;
  href: string;
  aliases: string[];
};

export const searchEntries = searchIndex as SearchEntry[];

export function teamById(data: SeasonData) {
  return new Map(data.teams.map((team) => [team.id, team]));
}

export function findTeam(data: SeasonData, query: string) {
  const needle = query.trim().toLowerCase();
  return data.teams.find((team) => {
    const names = [team.school, team.mascot, team.abbreviation, team.id, ...team.alternateNames];
    return names.some((name) => name.toLowerCase() === needle);
  });
}

export function matchupSlug(a: string, b: string) {
  return `${a}-vs-${b}`;
}

export function resolvedRivalries(data: SeasonData) {
  return rivalryList.flatMap((item) => {
    const home = findTeam(data, item.home);
    const away = findTeam(data, item.away);
    if (!home || !away) return [];
    return [{ ...item, slug: `${home.id}-vs-${away.id}`, home, away }];
  });
}

export function parseMatchupSlug(data: SeasonData, slug: string) {
  const marker = "-vs-";
  const index = slug.lastIndexOf(marker);
  if (index === -1) return null;
  const left = findTeam(data, slug.slice(0, index).replaceAll("-", " ")) ?? data.teams.find((team) => team.id === slug.slice(0, index));
  const rightId = slug.slice(index + marker.length);
  const right = data.teams.find((team) => team.id === rightId) ?? findTeam(data, rightId.replaceAll("-", " "));
  if (!left || !right || left.id === right.id) return null;
  return { left, right };
}
