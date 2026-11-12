import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `next build` writes the static site. During `next dev`, an unknown matchup
  // should open the calculator instead of crashing on the static-export rule.
  // A normal build writes the finished site to out/. Setting NEXT_DIST_DIR
  // sends that same site into another folder so the local preview can stay up.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: { unoptimized: true },
  trailingSlash: true,
  ...(process.env.NODE_ENV === "production"
    ? { output: "export" as const }
    : {
        // The published site uses vercel.json for the same rule. This copy
        // runs only on the local server, so an unlisted pair still opens.
        async rewrites() {
          return {
            fallback: [{ source: "/matchup/:slug", destination: "/matchup" }],
          };
        },
      }),
};

export default nextConfig;
