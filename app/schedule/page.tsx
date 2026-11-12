import type { Metadata } from "next";
import { WeekSchedule } from "@/components/schedule/WeekSchedule";
import { siteConfig } from "@/lib/load";

export const metadata: Metadata = {
  title: "Schedule",
  description: `Every FBS game in the ${siteConfig.season} season, week by week.`,
};

export default function SchedulePage() {
  return (
    <>
      <h1 className="text-5xl">Schedule</h1>
      <p className="mt-3 max-w-3xl text-muted">
        Every game on the {siteConfig.season} slate. Pick a week, then narrow it: Top 25, one conference, or a kickoff window. A finished game shows the score. A game still to be played shows the line, when one is posted. When Cleatz has posted the public board, the row also shows bet % and handle % for the spread, moneyline, and total. Tap a game between two FBS teams to open the matchup.
      </p>
      <WeekSchedule />
    </>
  );
}
