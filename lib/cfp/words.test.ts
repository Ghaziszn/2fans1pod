import { describe, expect, it } from "vitest";
import { rankingsIntro, simulatorRankNote } from "./words";

describe("ranking words", () => {
  it("does not call an Elo list a committee poll", () => {
    expect(rankingsIntro(false, "CFP committee rankings", "2026-11-05", "Elo")).toBe(
      "The committee has not released a poll yet. This order is Elo only. It is not a committee ranking.",
    );
    expect(simulatorRankNote(false, "Elo")).toContain("Elo only");
  });

  it("names the committee poll without calling the file date the poll date", () => {
    expect(rankingsIntro(true, "CFP committee rankings", "2026-11-05", "College Football Data Elo")).toBe(
      "CFP committee rankings. The top 25 below is the committee poll. Teams after 25 follow College Football Data Elo. Data checked 2026-11-05.",
    );
  });
});
