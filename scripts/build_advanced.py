"""Build public/data/team-advanced.json from CFBD advanced season stats.

Each metric is stored twice. noGT leaves out garbage time, which is the
default on the site. withGT includes every play. National ranks are computed
here. The browser only displays them.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from scripts.cfbd import CfbdClient, load_key
from scripts.compute import rank_values, slugify

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "data"

# path is the nested keys inside offense or defense.
# scale turns a 0-1 rate into a percent for the page.
METRICS = [
    {"key": "ppa", "path": ["ppa"], "scale": 1, "higherOffense": True, "higherDefense": False},
    {"key": "successRate", "path": ["successRate"], "scale": 100, "higherOffense": True, "higherDefense": False},
    {"key": "explosiveness", "path": ["explosiveness"], "scale": 1, "higherOffense": True, "higherDefense": False},
    {"key": "havoc", "path": ["havoc", "total"], "scale": 100, "higherOffense": False, "higherDefense": True},
    {"key": "lineYards", "path": ["lineYards"], "scale": 1, "higherOffense": True, "higherDefense": False},
    {"key": "stuffRate", "path": ["stuffRate"], "scale": 100, "higherOffense": False, "higherDefense": True},
    {"key": "pointsPerOpportunity", "path": ["pointsPerOpportunity"], "scale": 1, "higherOffense": True, "higherDefense": False},
    {"key": "fieldPosition", "path": ["fieldPosition", "averageStart"], "scale": 1, "higherOffense": False, "higherDefense": True},
    {"key": "standardDownsEpa", "path": ["standardDowns", "ppa"], "scale": 1, "higherOffense": True, "higherDefense": False},
    {"key": "passingDownsEpa", "path": ["passingDowns", "ppa"], "scale": 1, "higherOffense": True, "higherDefense": False},
    {"key": "rushEpa", "path": ["rushingPlays", "ppa"], "scale": 1, "higherOffense": True, "higherDefense": False},
    {"key": "passEpa", "path": ["passingPlays", "ppa"], "scale": 1, "higherOffense": True, "higherDefense": False},
]


def dig(node: dict, path: list[str]):
    current = node
    for key in path:
        if not isinstance(current, dict) or key not in current:
            return None
        current = current[key]
    if isinstance(current, bool) or not isinstance(current, (int, float)):
        return None
    return float(current)


def metric_value(side: dict, metric: dict) -> float | None:
    raw = dig(side, metric["path"])
    if raw is None:
        return None
    return raw * metric["scale"]


def index_teams(teams: list[dict]) -> dict[str, str]:
    """Map a CFBD school name to our team id."""
    index: dict[str, str] = {}
    for team in teams:
        index[team["school"].lower()] = team["id"]
        index[slugify(team["school"])] = team["id"]
        index[team["id"]] = team["id"]
    return index


def team_id_for(name: str, index: dict[str, str]) -> str | None:
    return index.get(name.lower()) or index.get(slugify(name))


def build_side(rows: list[dict], index: dict[str, str]) -> tuple[dict[str, dict], list[str]]:
    """Rank one garbage-time version. Returns team id -> {offense, defense}."""
    found: dict[str, dict] = {}
    missed: list[str] = []
    values: dict[str, dict[str, dict[str, float | None]]] = {}
    for row in rows:
        team_id = team_id_for(row.get("team") or "", index)
        if not team_id:
            missed.append(row.get("team") or "")
            continue
        values[team_id] = {
            "offense": {metric["key"]: metric_value(row.get("offense") or {}, metric) for metric in METRICS},
            "defense": {metric["key"]: metric_value(row.get("defense") or {}, metric) for metric in METRICS},
        }
    for metric in METRICS:
        offense_ranks = rank_values([(team_id, sides["offense"][metric["key"]]) for team_id, sides in values.items()], metric["higherOffense"])
        defense_ranks = rank_values([(team_id, sides["defense"][metric["key"]]) for team_id, sides in values.items()], metric["higherDefense"])
        for team_id, sides in values.items():
            bucket = found.setdefault(team_id, {"offense": {}, "defense": {}})
            bucket["offense"][metric["key"]] = {"value": sides["offense"][metric["key"]], "rank": offense_ranks.get(team_id)}
            bucket["defense"][metric["key"]] = {"value": sides["defense"][metric["key"]], "rank": defense_ranks.get(team_id)}
    return found, missed


def combine(no_gt: dict[str, dict], with_gt: dict[str, dict]) -> dict[str, dict]:
    teams = {}
    for team_id in sorted(set(no_gt) | set(with_gt)):
        teams[team_id] = {"noGT": no_gt.get(team_id), "withGT": with_gt.get(team_id)}
    return teams


def main() -> None:
    key = load_key()
    client = CfbdClient(key)
    year = json.loads((ROOT / "config" / "site.json").read_text())["season"]
    teams = json.loads((PUBLIC / "teams.json").read_text())
    index = index_teams(teams)
    no_rows = client.get("/stats/season/advanced", {"year": year, "excludeGarbageTime": "true"})
    yes_rows = client.get("/stats/season/advanced", {"year": year, "excludeGarbageTime": "false"})
    no_gt, missed_no = build_side(no_rows, index)
    with_gt, missed_yes = build_side(yes_rows, index)
    if len(no_gt) < 130:
        raise SystemExit(f"Only matched {len(no_gt)} teams. Unmatched sample: {missed_no[:8]}")
    payload = {
        "season": year,
        "source": "cfbd",
        "endpoint": "/stats/season/advanced",
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "callsUsed": client.calls,
        "teams": combine(no_gt, with_gt),
    }
    dest = PUBLIC / "team-advanced.json"
    dest.write_text(json.dumps(payload, indent=2) + "\n")
    from scripts.validate import validate_advanced

    validate_advanced(dest)
    print(f"Wrote advanced stats for {len(payload['teams'])} teams. CFBD calls this run: {client.calls}.")
    if missed_no or missed_yes:
        print(f"Unmatched names: {sorted(set(missed_no + missed_yes))[:8]}")


if __name__ == "__main__":
    main()
