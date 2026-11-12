import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TeamMark } from "@/components/team/TeamMark";
import { loadSeason } from "@/lib/load";

export function generateStaticParams() {
  return loadSeason().conferences.map((conference) => ({ slug: conference.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const conference = loadSeason().conferences.find((item) => item.id === slug);
  if (!conference) return { title: "Conference" };
  return {
    title: conference.name,
    description: `${conference.name} standings and team pages.`,
  };
}

export default async function ConferencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = loadSeason();
  const conference = data.conferences.find((item) => item.id === slug);
  if (!conference) notFound();
  const rank = new Map(data.rankings.order.map((id, index) => [id, index]));
  const teams = conference.teams
    .map((id) => data.teams.find((team) => team.id === id))
    .filter((team) => team != null)
    .sort((a, b) => {
      const left = data.stats[a.id];
      const right = data.stats[b.id];
      const conferenceWins = (right?.conferenceWins ?? 0) - (left?.conferenceWins ?? 0);
      if (conferenceWins !== 0) return conferenceWins;
      const conferenceLosses = (left?.conferenceLosses ?? 0) - (right?.conferenceLosses ?? 0);
      if (conferenceLosses !== 0) return conferenceLosses;
      const wins = (right?.wins ?? 0) - (left?.wins ?? 0);
      if (wins !== 0) return wins;
      const losses = (left?.losses ?? 0) - (right?.losses ?? 0);
      if (losses !== 0) return losses;
      return (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999);
    });

  return (
    <>
      <h1 className="text-5xl">{conference.name}</h1>
      <p className="mt-3 text-muted">{teams.length} teams. Sorted by conference record, then overall record.</p>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="py-2 font-medium">Team</th>
            <th className="py-2 font-medium">Overall</th>
            <th className="py-2 font-medium">Conference</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => {
            const stats = data.stats[team.id];
            return (
              <tr key={team.id} className="border-b border-line">
                <td className="py-2">
                  <Link className="inline-flex min-h-11 items-center" href={`/teams/${team.id}`}>
                    <TeamMark team={team} size="sm" />
                  </Link>
                </td>
                <td className="nums">{stats ? `${stats.wins}-${stats.losses}` : "—"}</td>
                <td className="nums">{stats ? `${stats.conferenceWins}-${stats.conferenceLosses}` : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
