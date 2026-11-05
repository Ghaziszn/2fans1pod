import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdvancedTeamTable } from "@/components/stats/AdvancedStats";
import { TeamMark, teamInk } from "@/components/team/TeamMark";
import { TeamProfile } from "@/components/team/TeamProfile";
import { simulate } from "@/lib/cfp/engine";
import { emptyScenario } from "@/lib/cfp/share";
import { JsonLd } from "@/lib/json-ld";
import { cfpFormat, loadSeason, rankingConfig, siteConfig, statCatalog } from "@/lib/load";

const catalog = statCatalog as Record<string, { label: string; offense?: boolean; defense?: boolean; digits?: number; suffix?: string; garbageTimeAware?: boolean }>;

export function generateStaticParams() {
  return loadSeason().teams.map((team) => ({ slug: team.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const team = loadSeason().teams.find((item) => item.id === slug);
  if (!team) return { title: "Team" };
  return {
    title: team.school,
    description: `${team.school} ${team.mascot}: record, schedule, national ranks, and playoff outlook.`,
  };
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = loadSeason();
  const team = data.teams.find((item) => item.id === slug);
  if (!team) notFound();
  const stats = data.stats[team.id];
  const result = simulate(data, emptyScenario(), cfpFormat, rankingConfig);
  const seeded = result.field.find((item) => item.teamId === team.id);
  const rank = result.order.indexOf(team.id) + 1;
  const games = data.games
    .filter((game) => game.homeId === team.id || game.awayId === team.id)
    .sort((a, b) => a.week - b.week || a.startDate.localeCompare(b.startDate));
  const keys = Object.keys(catalog).filter((key) => (catalog[key].offense || catalog[key].defense) && !catalog[key].garbageTimeAware);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsTeam",
          name: `${team.school} ${team.mascot}`,
          sport: "American Football",
          url: `${siteConfig.siteUrl}/teams/${team.id}/`,
          memberOf: { "@type": "SportsOrganization", name: team.conference },
        }}
      />
      <p className="text-sm uppercase tracking-wide text-muted">{team.conference}</p>
      <div className="mt-3 inline-flex max-w-full items-center gap-4 rounded-md px-4 py-3" style={{ background: team.color, color: teamInk(team.color) }}>
        {team.logo ? <img src={team.logo} alt="" className="h-16 w-16 shrink-0 rounded-sm bg-white object-contain p-1" /> : null}
        <div>
          <h1 className="text-5xl">{team.school}</h1>
          <p className="mt-1 text-lg">
            {stats ? `${stats.wins}-${stats.losses}` : "Record unavailable"}
            {stats ? `, ${stats.conferenceWins}-${stats.conferenceLosses} in conference` : ""}. Simulator rank {rank || "—"}.
          </p>
        </div>
      </div>
      <p className="mt-2 max-w-3xl">
        {seeded
          ? `${seeded.reason}. Seed ${seeded.seed} if the rest of the season follows the current favorites.`
          : "Outside the current field if the rest of the season follows the favorites."}
      </p>
      <p className="mt-2">
        <Link className="underline" href={`/conferences/${data.conferences.find((item) => item.name === team.conference)?.id ?? ""}`}>
          {team.conference} standings
        </Link>
      </p>
      <TeamProfile
        teamId={team.id}
        record={stats ? `${stats.wins}-${stats.losses}` : "—"}
        conferenceRecord={stats ? `${stats.conferenceWins}-${stats.conferenceLosses} in the ${team.conference}` : team.conference}
      />
      <section className="mt-8">
        <h2 className="text-3xl">Schedule</h2>
        <ul className="mt-3 divide-y divide-line">
          {games.map((game) => {
            const home = game.homeId === team.id;
            const opponent = home ? game.awayName : game.homeName;
            const opponentId = home ? game.awayId : game.homeId;
            const ours = home ? game.homePoints : game.awayPoints;
            const theirs = home ? game.awayPoints : game.homePoints;
            const score = game.completed && ours != null && theirs != null ? `${ours}-${theirs}` : "upcoming";
            const opponentTeam = data.teams.find((item) => item.id === opponentId);
            const pair = `/matchup/${home ? team.id : opponentId}-vs-${home ? opponentId : team.id}/`;
            return (
              <li key={game.id} className="flex min-h-11 flex-wrap items-center gap-3 py-2">
                <span className="nums w-16 shrink-0 text-sm text-muted">Week {game.week}</span>
                <span className="w-12 shrink-0 text-xs uppercase tracking-wide text-muted">{home ? "Home" : "Away"}</span>
                {opponentTeam ? (
                  <Link className="min-w-0 flex-1" href={pair}>
                    <TeamMark team={opponentTeam} size="sm" />
                  </Link>
                ) : (
                  <span className="min-w-0 flex-1">{opponent}</span>
                )}
                <span className="nums text-sm text-muted">{score}</span>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-3xl">National ranks</h2>
        <p className="mt-2 text-sm text-muted">Includes all plays. These box-score totals do not change with the garbage-time switch.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-2 font-medium">Stat</th>
                <th className="py-2 font-medium">Offense</th>
                <th className="py-2 font-medium">Defense</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => {
                const entry = catalog[key];
                const offense = stats?.offense[key];
                const defense = stats?.defense[key];
                return (
                  <tr key={key} className="border-b border-line">
                    <td className="py-2">{entry.label}</td>
                    <td className="nums py-2">{entry.offense ? showCell(key, offense?.value ?? null, offense?.rank ?? null) : "—"}</td>
                    <td className="nums py-2">{entry.defense ? showCell(key, defense?.value ?? null, defense?.rank ?? null) : "—"}</td>
                  </tr>
                );
              })}
              <tr className="border-b border-line">
                <td className="py-2">{catalog.sos.label}</td>
                <td className="nums py-2" colSpan={2}>
                  {showCell("sos", stats?.sos.value ?? null, stats?.sos.rank ?? null)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <AdvancedTeamTable teamId={team.id} />
    </>
  );
}

function showCell(key: string, value: number | null, rank: number | null) {
  if (value == null) return "—";
  const entry = catalog[key];
  const digits = entry?.digits ?? 1;
  return `${value.toFixed(digits)}${entry?.suffix ?? ""}${rank ? ` (#${rank})` : ""}`;
}
