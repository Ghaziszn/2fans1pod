"""Save public betting splits from Cleatz for the schedule page.

Cleatz posts the current college football board at
https://cleatz.com/public-betting/college-football/
Bet % is the share of tickets. Handle % is the share of dollars.
Each game has those two numbers for the spread, the moneyline, and the total.
This script reads that public page, matches each game to our schedule, and
writes public/data/splits.json. It does not guess numbers for games Cleatz
has not posted.
"""

from __future__ import annotations

import html
import json
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
SOURCE_URL = "https://cleatz.com/public-betting/college-football/"

# Names Cleatz prints that are not already a school, nickname, or abbreviation.
EXTRA_NAMES = {
    "miami fl": "miami",
    "miami florida": "miami",
    "louisiana monroe": "ul-monroe",
    "appalachian state": "app-state",
}


def norm(value: str) -> str:
    text = html.unescape(value)
    text = unicodedata.normalize("NFKD", text)
    text = "".join(char for char in text if not unicodedata.combining(char))
    text = text.lower().replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def parse_board(page: str) -> tuple[str | None, list[dict]]:
    """Pull each game's three markets out of the Cleatz HTML."""
    label = None
    stamped = re.search(r"Splits updated ([^<]+)", page)
    if stamped:
        label = stamped.group(1).strip()
    games = []
    for article in re.findall(r'<article class="cfbv2-game"[\s\S]*?</article>', page):
        title = re.search(r"<h3>(.*?)</h3>", article)
        if not title:
            continue
        matchup = re.sub(r"<[^>]+>", "", html.unescape(title.group(1))).strip()
        parts = matchup.rsplit(" at ", 1)
        if len(parts) != 2:
            continue
        dated = re.search(r'data-cfbv2-date="(\d{4}-\d{2}-\d{2})"', article)
        markets = {}
        chunks = re.split(r"<h4>(Spread|Total|Moneyline)</h4>", article)
        for index in range(1, len(chunks) - 1, 2):
            name = chunks[index].lower()
            body = chunks[index + 1]
            labels = [re.sub(r"<[^>]+>", "", html.unescape(item)).strip() for item in re.findall(r"<strong>(.*?)</strong>", body)]
            percents = [int(item) for item in re.findall(r"<b>(\d+)%</b>", body)]
            sides = []
            for side_index, side_label in enumerate(labels):
                bet_at = side_index * 2
                if bet_at + 1 >= len(percents):
                    break
                sides.append({"label": side_label, "bet": percents[bet_at], "handle": percents[bet_at + 1]})
            if sides:
                markets[name] = {"sides": sides}
        if not markets:
            continue
        games.append(
            {
                "away": parts[0].strip(),
                "home": parts[1].strip(),
                "date": dated.group(1) if dated else None,
                "spread": markets.get("spread"),
                "total": markets.get("total"),
                "moneyline": markets.get("moneyline"),
            }
        )
    return label, games


def team_index(teams: list[dict], aliases: dict[str, list[str]]) -> dict[str, str]:
    index: dict[str, str] = {}

    def add(name: str, team_id: str) -> None:
        key = norm(name)
        if key and key not in index:
            index[key] = team_id

    for team in teams:
        add(team["school"], team["id"])
        add(team.get("abbreviation") or "", team["id"])
        add(team["id"].replace("-", " "), team["id"])
        for alternate in team.get("alternateNames") or []:
            add(alternate, team["id"])
        for alternate in aliases.get(team["school"], []):
            add(alternate, team["id"])
    for name, team_id in EXTRA_NAMES.items():
        add(name, team_id)
    return index


def attach(board: list[dict], games: list[dict], names: dict[str, str]) -> tuple[dict[str, dict], list[str]]:
    matched: dict[str, dict] = {}
    missed: list[str] = []
    for row in board:
        away_id = names.get(norm(row["away"]))
        home_id = names.get(norm(row["home"]))
        if not away_id or not home_id:
            missed.append(f"{row['away']} at {row['home']}")
            continue
        candidates = [
            game
            for game in games
            if game.get("seasonType", "regular") == "regular" and game["awayId"] == away_id and game["homeId"] == home_id
        ]
        if not candidates:
            missed.append(f"{row['away']} at {row['home']}")
            continue
        chosen = _closest(candidates, row.get("date"))
        if chosen is None:
            missed.append(f"{row['away']} at {row['home']}")
            continue
        matched[chosen["id"]] = {
            "spread": row["spread"],
            "total": row["total"],
            "moneyline": row["moneyline"],
        }
    return matched, missed


def _closest(candidates: list[dict], date: str | None) -> dict | None:
    if date is None:
        return candidates[-1]
    target = datetime.fromisoformat(date).date()

    def distance(game: dict) -> int:
        start = datetime.fromisoformat(game["startDate"].replace("Z", "+00:00")).date()
        return abs((start - target).days)

    best = min(candidates, key=distance)
    if distance(best) > 2:
        return None
    return best


def refresh_splits(games_path: Path, teams_path: Path, dest: Path, aliases_path: Path | None = None) -> int:
    response = requests.get(SOURCE_URL, timeout=40, headers={"User-Agent": "2fans1pod/1.0 (public schedule splits)"})
    response.raise_for_status()
    raw = ROOT / "data" / "raw" / "cleatz-cfb.html"
    raw.parent.mkdir(parents=True, exist_ok=True)
    raw.write_text(response.text)
    label, board = parse_board(response.text)
    if not board:
        raise RuntimeError("Cleatz returned a page with no games.")
    teams = json.loads(teams_path.read_text())
    games = json.loads(games_path.read_text())
    aliases = json.loads(aliases_path.read_text()) if aliases_path and aliases_path.exists() else {}
    matched, missed = attach(board, games, team_index(teams, aliases))
    if not matched:
        raise RuntimeError("None of the Cleatz games matched our schedule.")
    payload = {
        "source": "Cleatz",
        "url": SOURCE_URL,
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "label": label,
        "games": matched,
    }
    dest.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"Saved splits for {len(matched)} games. {len(missed)} Cleatz rows did not match.")
    for row in missed:
        print(f"  unmatched: {row}")
    return len(matched)


if __name__ == "__main__":
    public = ROOT / "public" / "data"
    refresh_splits(public / "games.json", public / "teams.json", public / "splits.json", ROOT / "config" / "aliases.json")
