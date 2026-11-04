"""Shared math for the season files.

Strength of schedule is the average winning percentage of opponents played so far.
FBS opponents use their record with the game against this team removed.
An FCS opponent counts as the configured win percentage (default .400).
"""

from __future__ import annotations


def slugify(name: str) -> str:
    text = name.lower().replace("&", "")
    cleaned = []
    dash = False
    for char in text:
        if char.isascii() and char.isalnum():
            cleaned.append(char)
            dash = False
        elif not dash:
            cleaned.append("-")
            dash = True
    return "".join(cleaned).strip("-")


def record_without(wins: int, losses: int, beat_us: bool | None) -> tuple[int, int]:
    """Remove the head-to-head game. beat_us True means the opponent won that game."""
    if beat_us is True and wins > 0:
        wins -= 1
    elif beat_us is False and losses > 0:
        losses -= 1
    return wins, losses


def win_pct(wins: int, losses: int) -> float | None:
    total = wins + losses
    if total <= 0:
        return None
    return wins / total


def strength_of_schedule(values: list[float]) -> float | None:
    if not values:
        return None
    return sum(values) / len(values)


def rank_values(items: list[tuple[str, float | None]], higher_is_better: bool) -> dict[str, int]:
    """Competition rank. Ties share the best rank in the tie."""
    present = [(team_id, value) for team_id, value in items if value is not None]
    present.sort(key=lambda row: row[1], reverse=higher_is_better)
    ranks: dict[str, int] = {}
    last_value = None
    last_rank = 0
    for position, (team_id, value) in enumerate(present, start=1):
        if last_value is not None and abs(value - last_value) < 1e-9:
            ranks[team_id] = last_rank
        else:
            ranks[team_id] = position
            last_rank = position
            last_value = value
    return ranks


def update_elo(elo: dict[str, float], games: list[dict], k: float = 20.0, home_edge: float = 55.0) -> dict[str, float]:
    """Simple Elo. Unknown opponents stay at 1400 and are not stored."""
    ratings = dict(elo)
    ordered = sorted(games, key=lambda game: (game.get("startDate") or "", game["id"]))
    for game in ordered:
        if not game.get("completed"):
            continue
        home = game["homeId"]
        away = game["awayId"]
        home_points = game.get("homePoints")
        away_points = game.get("awayPoints")
        if home_points is None or away_points is None or home_points == away_points:
            continue
        home_rating = ratings.get(home, 1400.0 if not game.get("homeFbs", True) else 1500.0)
        away_rating = ratings.get(away, 1400.0 if not game.get("awayFbs", True) else 1500.0)
        if game.get("neutralSite"):
            expected_home = 1 / (1 + 10 ** ((away_rating - home_rating) / 400))
        else:
            expected_home = 1 / (1 + 10 ** ((away_rating - (home_rating + home_edge)) / 400))
        actual_home = 1.0 if home_points > away_points else 0.0
        if home in ratings or game.get("homeFbs", True):
            ratings[home] = home_rating + k * (actual_home - expected_home)
        if away in ratings or game.get("awayFbs", True):
            ratings[away] = away_rating + k * ((1 - actual_home) - (1 - expected_home))
    return ratings
