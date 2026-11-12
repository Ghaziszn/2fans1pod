"""Check season JSON before it is allowed to replace the live files."""

from __future__ import annotations

import json
from pathlib import Path

import jsonschema


def fail(message: str) -> None:
    raise SystemExit(message)


ROOT = Path(__file__).resolve().parents[1]
SCHEMAS = ROOT / "schemas"


def validate_dir(folder: Path) -> None:
    required = ["season.json", "teams.json", "games.json", "conferences.json", "rankings.json", "team-stats.json", "search-index.json"]
    for name in required:
        path = folder / name
        if not path.exists() or path.stat().st_size < 10:
            fail(f"{name} is missing or empty.")
        payload = json.loads(path.read_text())
        schema_path = SCHEMAS / f"{name.replace('.json', '')}.schema.json"
        schema = json.loads(schema_path.read_text())
        try:
            jsonschema.validate(payload, schema)
        except jsonschema.ValidationError as exc:
            fail(f"{name} does not match its schema: {exc.message}")

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
    if not rankings["cfp"] and "elo" not in season.get("rankingLabel", "").lower():
        fail("CFP rankings are empty, and the season file does not say this order is Elo.")
    if not season.get("rankingLabel"):
        fail("Season file needs a ranking label.")
    missing_stats = [team_id for team_id in ids if team_id not in stats]
    if missing_stats:
        fail(f"Missing team stats for {missing_stats[:3]}")
    print(f"Validated {len(teams)} teams, {len(games)} games, {len(rankings['cfp'])} ranked teams.")


def validate_advanced(path: Path) -> None:
    """Check the two garbage-time copies of the advanced stats."""
    if not path.exists() or path.stat().st_size < 10:
        fail("team-advanced.json is missing or empty.")
    payload = json.loads(path.read_text())
    schema = json.loads((SCHEMAS / "team-advanced.schema.json").read_text())
    try:
        jsonschema.validate(payload, schema)
    except jsonschema.ValidationError as exc:
        fail(f"team-advanced.json does not match its schema: {exc.message}")
    teams = payload["teams"]
    if len(teams) < 130:
        fail(f"Advanced stats cover {len(teams)} teams.")
    sample = next(iter(teams.values()))
    for copy in ("noGT", "withGT"):
        if "ppa" not in sample[copy]["offense"] or "ppa" not in sample[copy]["defense"]:
            fail(f"Advanced stats are missing EPA in {copy}.")
    print(f"Validated advanced stats for {len(teams)} teams.")


def validate_profile(path: Path) -> None:
    """Ratings, coach, talent, and the FPI schedule ranks used on the team page."""
    if not path.exists() or path.stat().st_size < 10:
        fail("team-profile.json is missing or empty.")
    payload = json.loads(path.read_text())
    schema = json.loads((SCHEMAS / "team-profile.schema.json").read_text())
    try:
        jsonschema.validate(payload, schema)
    except jsonschema.ValidationError as exc:
        fail(f"team-profile.json does not match its schema: {exc.message}")
    teams = payload["teams"]
    if len(teams) < 130:
        fail(f"Team profile covers {len(teams)} teams.")
    sample = next(iter(teams.values()))
    if "rank" not in sample["sp"] or "strengthOfRecord" not in sample["fpi"]:
        fail("Team profile is missing SP+ or FPI.")
    if payload.get("fpiRank1IsToughest") is not True:
        fail("FPI rank direction was not confirmed.")
    print(f"Validated ratings for {len(teams)} teams.")


def validate_game_epa(path: Path) -> None:
    """Game-by-game EPA, stored twice so the garbage-time switch can change the line."""
    if not path.exists() or path.stat().st_size < 10:
        fail("game-epa.json is missing or empty.")
    payload = json.loads(path.read_text())
    schema = json.loads((SCHEMAS / "game-epa.schema.json").read_text())
    try:
        jsonschema.validate(payload, schema)
    except jsonschema.ValidationError as exc:
        fail(f"game-epa.json does not match its schema: {exc.message}")
    teams = payload["teams"]
    if len(teams) < 100:
        fail(f"Game EPA covers {len(teams)} teams.")
    sample = next(iter(teams.values()))
    if not isinstance(sample.get("noGT"), list) or not isinstance(sample.get("withGT"), list):
        fail("Game EPA is missing a garbage-time copy.")
    print(f"Validated game EPA for {len(teams)} teams.")


if __name__ == "__main__":
    folder = Path(__file__).resolve().parents[1] / "public" / "data"
    validate_dir(folder)
    advanced = folder / "team-advanced.json"
    if advanced.exists():
        validate_advanced(advanced)
    profile = folder / "team-profile.json"
    if profile.exists():
        validate_profile(profile)
    game_epa = folder / "game-epa.json"
    if game_epa.exists():
        validate_game_epa(game_epa)
