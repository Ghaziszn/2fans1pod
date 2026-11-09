import type { Metadata } from "next";
import Link from "next/link";
import { TeamMark } from "@/components/team/TeamMark";
import { rankingsIntro } from "@/lib/cfp/words";
import { JsonLd } from "@/lib/json-ld";
import { loadSeason, siteConfig } from "@/lib/load";

const seasonData = loadSeason();
const hasPoll = seasonData.rankings.cfp.length > 0;

export const metadata: Metadata = {
  title: hasPoll ? "CFP rankings" : "Elo rankings",
  description: hasPoll
    ? "This week's College Football Playoff rankings, plus the full order the simulator uses."
    : "Elo order used before the College Football Playoff committee releases a poll.",
};

export default function RankingsPage() {
  const data = loadSeason();
  const teams = new Map(data.teams.map((team) => [team.id, team]));
  const hasCommitteePoll = data.rankings.cfp.length > 0;
  const elo = data.season.eloSource === "cfbd" ? "College Football Data Elo" : "an Elo rating computed from this season's results";
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: hasCommitteePoll ? data.season.rankingLabel : "Elo rankings",
          url: `${siteConfig.siteUrl}/rankings/`,
          itemListElement: hasCommitteePoll
            ? data.rankings.cfp.map((row) => ({
                "@type": "ListItem",
                position: row.rank,
                name: teams.get(row.teamId)?.school ?? row.teamId,
              }))
            : data.rankings.order.map((id, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: teams.get(id)?.school ?? id,
              })),
        }}
      />
      <h1 className="text-5xl">{hasCommitteePoll ? "CFP rankings" : "Elo rankings"}</h1>
      <p className="mt-3 text-muted">{rankingsIntro(hasCommitteePoll, data.season.rankingLabel, data.season.updatedAt.slice(0, 10), elo)}</p>
      {hasCommitteePoll ? (
      <ol className="mt-6 divide-y divide-line">
        {data.rankings.cfp.map((row) => {
          const team = teams.get(row.teamId);
          const stats = data.stats[row.teamId];
          return (
            <li key={row.teamId} className="flex min-h-11 items-center gap-3 py-2">
              <Link className="min-w-0 flex-1" href={`/teams/${row.teamId}`}>
                <TeamMark team={team} name={team?.school ?? row.teamId} seed={row.rank} size="sm" />
              </Link>
              <span className="nums text-sm text-muted">{stats ? `${stats.wins}-${stats.losses}` : ""}</span>
            </li>
          );
        })}
      </ol>
      ) : null}
      <section className="mt-10">
        <h2 className="text-3xl">Full simulator order</h2>
        <ol className="mt-4 divide-y divide-line">
          {data.rankings.order.map((id, index) => {
            const team = teams.get(id);
            return (
              <li key={id} className="flex min-h-11 items-center gap-3 py-1">
                <Link className="min-w-0 flex-1" href={`/teams/${id}`}>
                  <TeamMark team={team} name={team?.school ?? id} seed={index + 1} size="sm" />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
