import type { MetadataRoute } from "next";
import { loadSeason, resolvedRivalries, siteConfig } from "@/lib/load";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const data = loadSeason();
  const paths = [
    "/",
    "/schedule/",
    "/matchup/",
    "/rankings/",
    "/conferences/",
    "/contact/",
    ...data.teams.map((team) => `/teams/${team.id}/`),
    ...data.conferences.map((conference) => `/conferences/${conference.id}/`),
    ...resolvedRivalries(data).map((rivalry) => `/matchup/${rivalry.slug}/`),
  ];
  return paths.map((path) => ({
    url: `${siteConfig.siteUrl}${path}`,
    changeFrequency: "daily",
  }));
}
