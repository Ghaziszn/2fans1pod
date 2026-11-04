"""Check season JSON before it is allowed to replace the live files."""

from __future__ import annotations

import json
from pathlib import Path


def fail(message: str) -> None:
    raise SystemExit(message)


def validate_dir(folder: Path) -> None:
    required = ["season.json", "teams.json", "games.json", "conferences.json", "rankings.json", "team-stats.json", "search-index.json"]
    for name in required:
        path = folder / name
        if not path.exists() or path.stat().st_size < 10:
            fail(f"{name} is missing or empty.")
        json.loads(path.read_text())

    teams = json.loads((folder / "teams.json").read_text())
    games = json.loads((folder / "games.json").read_text())
    rankings = json.loads((folder / "rankings.json").read_text())
    stats = json.loads((folder / "team-stats.json").read_text())
    season = json.loads((folder / "season.json").read_text())

    if not 120 <= len(teams) <= 150:
        fail(f"Expected about 138 FBS teams, found {len(teams)}.")
    if len(games) < 100:
        fail("The schedule is too small to publish.")
    ids = {team["id"] for team in teams}
    if len(ids) != len(teams):
        fail("Team ids are not unique.")
    for team_id in rankings["order"]:
        if team_id not in ids:
            fail(f"Ranking lists an unknown team: {team_id}")
    if len(rankings["order"]) != len(ids):
        fail("The full ranking order does not include every team.")
    if not rankings["cfp"]:
        fail("CFP rankings are empty.")
    if not season.get("rankingLabel"):
        fail("Season file needs a ranking label.")
    missing_stats = [team_id for team_id in ids if team_id not in stats]
    if missing_stats:
        fail(f"Missing team stats for {missing_stats[:3]}")
    print(f"Validated {len(teams)} teams, {len(games)} games, {len(rankings['cfp'])} ranked teams.")


if __name__ == "__main__":
    validate_dir(Path(__file__).resolve().parents[1] / "public" / "data")
