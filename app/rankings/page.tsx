import type { Metadata } from "next";
import Link from "next/link";
import { TeamMark } from "@/components/team/TeamMark";
import { JsonLd } from "@/lib/json-ld";
import { loadSeason, siteConfig } from "@/lib/load";

export const metadata: Metadata = {
  title: "CFP rankings",
  description: "This week's College Football Playoff rankings, plus the full order the simulator uses.",
};

export default function RankingsPage() {
  const data = loadSeason();
  const teams = new Map(data.teams.map((team) => [team.id, team]));
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: data.season.rankingLabel,
          url: `${siteConfig.siteUrl}/rankings/`,
          itemListElement: data.rankings.cfp.map((row) => ({
            "@type": "ListItem",
            position: row.rank,
            name: teams.get(row.teamId)?.school ?? row.teamId,
          })),
        }}
      />
      <h1 className="text-5xl">CFP rankings</h1>
      <p className="mt-3 text-muted">
        {data.season.rankingLabel}. Updated {data.season.updatedAt.slice(0, 10)}. Teams after 25 follow {data.season.eloSource === "cfbd" ? "CollegeFootballData Elo" : "an Elo rating computed from this season's results"}.
      </p>
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
