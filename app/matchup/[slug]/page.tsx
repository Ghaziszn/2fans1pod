import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MatchupView } from "@/components/matchup/MatchupView";
import { JsonLd } from "@/lib/json-ld";
import { loadSeason, parseMatchupSlug, resolvedRivalries, siteConfig } from "@/lib/load";

export const dynamicParams = false;

export function generateStaticParams() {
  return resolvedRivalries(loadSeason()).map((rivalry) => ({ slug: rivalry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = loadSeason();
  const pair = parseMatchupSlug(data, slug);
  const rivalry = resolvedRivalries(data).find((item) => item.slug === slug);
  if (!pair) return { title: "Matchup" };
  const title = rivalry?.name ?? `${pair.left.school} vs ${pair.right.school}`;
  return {
    title,
    description: `${pair.left.school} and ${pair.right.school} compared by national rank, with the line only when they are scheduled.`,
  };
}

export default async function RivalryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = loadSeason();
  const pair = parseMatchupSlug(data, slug);
  if (!pair) notFound();
  const game = data.games.find(
    (item) =>
      (item.homeId === pair.left.id && item.awayId === pair.right.id) ||
      (item.homeId === pair.right.id && item.awayId === pair.left.id),
  );
  const event = game
    ? {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name: `${pair.left.school} vs ${pair.right.school}`,
        startDate: game.startDate,
        url: `${siteConfig.siteUrl}/matchup/${slug}/`,
        location: game.venue ? { "@type": "Place", name: game.venue } : undefined,
        homeTeam: { "@type": "SportsTeam", name: game.homeName },
        awayTeam: { "@type": "SportsTeam", name: game.awayName },
      }
    : null;

  return (
    <>
      {event ? <JsonLd data={event} /> : null}
      <MatchupView initialSlug={slug} />
    </>
  );
}
