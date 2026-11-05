import type { Metadata } from "next";
import { Simulator } from "@/components/simulator/Simulator";
import { JsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/load";

export const metadata: Metadata = {
  title: "Playoff Simulator",
  description: "Change the games that have not been played and see who makes the College Football Playoff.",
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.siteUrl,
          description: siteConfig.description,
        }}
      />
      <h1 className="mb-4 text-5xl">Playoff Simulator</h1>
      <Simulator />
    </>
  );
}
