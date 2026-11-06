import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `next build` writes the static site. During `next dev`, an unknown matchup
  // should open the calculator instead of crashing on the static-export rule.
  // A normal build writes the finished site to out/. Setting NEXT_DIST_DIR
  // sends that same site into another folder so the local preview can stay up.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  ...(process.env.NODE_ENV === "production" ? { output: "export" as const } : {}),
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
