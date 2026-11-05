import type { Metadata } from "next";
import { MatchupView } from "@/components/matchup/MatchupView";

export const metadata: Metadata = {
  title: "Matchup calculator",
  description: "Compare two college football teams by national rank: offense, defense, schedule, and the line when one is posted.",
};

export default function MatchupPage() {
  return <MatchupView />;
}
