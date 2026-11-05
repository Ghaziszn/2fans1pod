"""Build the team-page rating file and the game-by-game EPA file.

This pulls season-wide College Football Data endpoints once each: SP+, SRS,
FPI, the talent composite, returning production, the head coach, and advanced
stats for every game, with and without garbage time. National ranks are
computed here. The site only displays them.

Weather is not requested. The free key cannot read that endpoint.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from scripts.build_advanced import dig, index_teams, team_id_for
from scripts.cfbd import RAW, CfbdClient, _cache_name, load_key
from scripts.compute import rank_values

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "data"

POWER_FOR_CHECK = {"SEC", "Big Ten"}
GROUP_FOR_CHECK = {"Mid-American", "Conference USA"}


def as_list(payload) -> list:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        for key in ("data", "teams", "items"):
            if isinstance(payload.get(key), list):
                return payload[key]
    raise SystemExit("CFBD returned a shape this script does not know. Nothing was guessed.")


def load_or_fetch(path: str, params: dict, client: list[CfbdClient | None]):
    """Reuse a saved response. The first miss spends a call."""
    cache = RAW / _cache_name(path, params)
    if cache.exists():
        print(f"Using cached {cache.name}")
        return json.loads(cache.read_text())
    if client[0] is None:
        client[0] = CfbdClient(load_key())
    print(f"Fetching {path}")
    return client[0].get(path, params, refresh=True)


def number(value) -> float | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    return float(value)


def rounded(value: float | None, digits: int = 3) -> float | None:
    if value is None:
        return None
    return round(value, digits)


def as_percent(value) -> float | None:
    """Returning production arrives as a fraction. 0.62 becomes 62.0."""
    raw = number(value)
    if raw is None:
        return None
    if abs(raw) <= 1.5:
        return round(raw * 100, 1)
    return round(raw, 1)


def cell(value, rank) -> dict:
    return {"value": rounded(value), "rank": rank}


def school_of(row: dict) -> str:
    for key in ("team", "school"):
        if isinstance(row.get(key), str) and row[key]:
            return row[key]
    team = row.get("team")
    if isinstance(team, dict):
        return str(team.get("school") or team.get("name") or "")
    return ""


def resume_rank(resume: dict, *names: str) -> int | None:
    if not isinstance(resume, dict):
        return None
    for name in names:
        raw = resume.get(name)
        if isinstance(raw, bool) or raw is None:
            continue
        try:
            return int(raw)
        except (TypeError, ValueError):
            continue
    return None


def coach_fields(row: dict) -> tuple[str, str, int]:
    coach = row.get("coach") if isinstance(row.get("coach"), dict) else {}
    first = str(coach.get("firstName") or row.get("firstName") or "").strip()
    last = str(coach.get("lastName") or row.get("lastName") or "").strip()
    name = f"{first} {last}".strip()
    games = row.get("games")
    played = int(games) if isinstance(games, (int, float)) and not isinstance(games, bool) else 0
    return school_of(row), name, played


def pick_coaches(rows: list[dict], index: dict[str, str], year: int | None = None) -> dict[str, str]:
    """One head coach per team. If two rows exist, keep the one with more games."""
    best: dict[str, tuple[int, str]] = {}
    for row in rows:
        row_year = row.get("year") if isinstance(row.get("year"), int) else row.get("season")
        if year is not None and isinstance(row_year, int) and row_year != year:
            continue
        school, name, games = coach_fields(row)
        team_id = team_id_for(school, index) if school else None
        if not team_id or not name:
            continue
        current = best.get(team_id)
        if current is None or games > current[0]:
            best[team_id] = (games, name)
    return {team_id: name for team_id, (_, name) in best.items()}


def game_series(rows: list[dict], index: dict[str, str]) -> dict[str, list[dict]]:
    """One team's offense and defense EPA for each game, ordered by week."""
    by_team: dict[str, list[dict]] = {}
    for row in rows:
        team_id = team_id_for(school_of(row), index)
        if not team_id:
            continue
        offense = dig(row.get("offense") or {}, ["ppa"])
        defense = dig(row.get("defense") or {}, ["ppa"])
        week = row.get("week")
        by_team.setdefault(team_id, []).append(
            {
                "week": int(week) if isinstance(week, (int, float)) and not isinstance(week, bool) else 0,
                "gameId": str(row.get("gameId") or ""),
                "opponent": str(row.get("opponent") or ""),
                "offEpa": rounded(offense),
                "defEpa": rounded(defense),
            }
        )
    for games in by_team.values():
        games.sort(key=lambda game: (game["week"], game["gameId"]))
    return by_team


def sos_is_harder_when_higher(pairs: list[tuple[str, float, float]]) -> bool:
    """pairs are (conference, SP+ rating, SP+ SOS).

    Power-conference teams should show a higher SOS than the MAC and Conference
    USA when a higher number means a harder schedule.
    """
    power = [sos for conference, _rating, sos in pairs if conference in POWER_FOR_CHECK]
    group = [sos for conference, _rating, sos in pairs if conference in GROUP_FOR_CHECK]
    if len(power) < 10 or len(group) < 10:
        return False
    return sum(power) / len(power) > sum(group) / len(group)


def fpi_rank1_is_toughest(pairs: list[tuple[float, int]]) -> bool:
    """pairs are (SP+ SOS, FPI schedule rank). Rank 1 is toughest when the
    highest SP+ SOS values carry the lower FPI ranks."""
    usable = [(sos, rank) for sos, rank in pairs if sos is not None and rank is not None]
    if len(usable) < 40:
        return False
    ordered = sorted(usable, key=lambda item: item[0], reverse=True)
    toughest = sum(rank for _, rank in ordered[:20]) / 20
    easiest = sum(rank for _, rank in ordered[-20:]) / 20
    return toughest < easiest


def lower_rank_favors_power(pairs: list[tuple[str, int]]) -> bool:
    """pairs are (conference, rank). Rank 1 is the strong end when the SEC and
    Big Ten average a lower rank than the MAC and Conference USA."""
    power = [rank for conference, rank in pairs if conference in POWER_FOR_CHECK]
    group = [rank for conference, rank in pairs if conference in GROUP_FOR_CHECK]
    if len(power) < 10 or len(group) < 10:
        return False
    return sum(power) / len(power) < sum(group) / len(group)


def build_profiles(sp_rows, srs_rows, fpi_rows, talent_rows, returning_rows, coach_rows, index, year: int | None = None):
    sp_by_id = {}
    for row in as_list(sp_rows):
        team_id = team_id_for(school_of(row), index)
        if team_id:
            sp_by_id[team_id] = row
    srs_by_id = {}
    for row in as_list(srs_rows):
        team_id = team_id_for(school_of(row), index)
        if team_id:
            srs_by_id[team_id] = row
    fpi_by_id = {}
    for row in as_list(fpi_rows):
        team_id = team_id_for(school_of(row), index)
        if team_id:
            fpi_by_id[team_id] = row
    talent_by_id = {}
    for row in as_list(talent_rows):
        team_id = team_id_for(school_of(row), index)
        if team_id and number(row.get("talent")) is not None:
            talent_by_id[team_id] = number(row.get("talent"))
    returning_by_id = {}
    for row in as_list(returning_rows):
        team_id = team_id_for(school_of(row), index)
        if team_id:
            returning_by_id[team_id] = as_percent(row.get("percentPPA"))
    coaches = pick_coaches(as_list(coach_rows), index, year)

    sos_values = [number(row.get("sos")) for row in sp_by_id.values()]
    posted = [value for value in sos_values if value is not None]
    if posted:
        check_pairs = []
        for row in sp_by_id.values():
            rating = number(row.get("rating"))
            sos = number(row.get("sos"))
            if rating is None or sos is None:
                continue
            check_pairs.append((str(row.get("conference") or ""), rating, sos))
        higher_is_harder = sos_is_harder_when_higher(check_pairs)
        if not higher_is_harder:
            raise SystemExit("SP+ schedule strength did not look harder for the SEC and Big Ten than for the MAC and Conference USA. Rankings were not written.")
    else:
        # The field exists on the response and is empty for this season, so it is not ranked.
        higher_is_harder = None

    for field in ("strengthOfSchedule", "remainingStrengthOfSchedule", "strengthOfRecord"):
        pairs = []
        for row in fpi_by_id.values():
            rank = resume_rank(row.get("resumeRanks") or {}, field)
            if rank is None:
                continue
            pairs.append((str(row.get("conference") or ""), rank))
        if not lower_rank_favors_power(pairs):
            raise SystemExit(f"FPI {field} did not give the SEC and Big Ten a lower rank than the MAC and Conference USA. Rankings were not written.")
    rank1_toughest = True

    sos_ranks = rank_values([(team_id, number(row.get("sos"))) for team_id, row in sp_by_id.items()], True)
    sp_ranks = rank_values([(team_id, number(row.get("rating"))) for team_id, row in sp_by_id.items()], True)
    srs_ranks = rank_values([(team_id, number(row.get("rating"))) for team_id, row in srs_by_id.items()], True)
    fpi_ranks = rank_values([(team_id, number(row.get("fpi"))) for team_id, row in fpi_by_id.items()], True)
    talent_ranks = rank_values(list(talent_by_id.items()), True)
    returning_ranks = rank_values(list(returning_by_id.items()), True)

    teams = {}
    unique_ids = sorted(set(index.values()))
    for team_id in unique_ids:
        sp = sp_by_id.get(team_id) or {}
        srs = srs_by_id.get(team_id) or {}
        fpi = fpi_by_id.get(team_id) or {}
        resume = fpi.get("resumeRanks") or {}
        official_sp = sp.get("ranking")
        official_srs = srs.get("ranking")
        teams[team_id] = {
            "coach": coaches.get(team_id),
            "sp": {
                "rating": rounded(number(sp.get("rating")), 2),
                "rank": int(official_sp) if isinstance(official_sp, int) else sp_ranks.get(team_id),
                "sos": rounded(number(sp.get("sos")), 2),
                "sosRank": sos_ranks.get(team_id),
            },
            "srs": {
                "rating": rounded(number(srs.get("rating")), 2),
                "rank": int(official_srs) if isinstance(official_srs, int) else srs_ranks.get(team_id),
            },
            "fpi": {
                "rating": rounded(number(fpi.get("fpi")), 2),
                "rank": fpi_ranks.get(team_id),
                "strengthOfSchedule": resume_rank(resume, "strengthOfSchedule"),
                "remainingStrengthOfSchedule": resume_rank(resume, "remainingStrengthOfSchedule"),
                "strengthOfRecord": resume_rank(resume, "strengthOfRecord"),
            },
            "talent": {"rating": rounded(talent_by_id.get(team_id), 1), "rank": talent_ranks.get(team_id)},
            "returning": {"percent": returning_by_id.get(team_id), "rank": returning_ranks.get(team_id)},
        }
    return teams, higher_is_harder, rank1_toughest


def main() -> None:
    year = json.loads((ROOT / "config" / "site.json").read_text())["season"]
    teams = json.loads((PUBLIC / "teams.json").read_text())
    index = index_teams(teams)
    holder: list[CfbdClient | None] = [None]
    params = {"year": year}
    sp_rows = load_or_fetch("/ratings/sp", params, holder)
    srs_rows = load_or_fetch("/ratings/srs", params, holder)
    fpi_rows = load_or_fetch("/ratings/fpi", params, holder)
    talent_rows = load_or_fetch("/talent", params, holder)
    returning_rows = load_or_fetch("/player/returning", params, holder)
    coach_rows = load_or_fetch("/coaches/seasons", params, holder)
    no_gt = load_or_fetch("/stats/game/advanced", {"year": year, "excludeGarbageTime": "true"}, holder)
    with_gt = load_or_fetch("/stats/game/advanced", {"year": year, "excludeGarbageTime": "false"}, holder)

    profiles, higher_is_harder, rank1_toughest = build_profiles(sp_rows, srs_rows, fpi_rows, talent_rows, returning_rows, coach_rows, index, year)
    matched = sum(1 for row in profiles.values() if row["sp"]["rating"] is not None)
    if matched < 130:
        raise SystemExit(f"Only matched SP+ for {matched} teams.")
    coaches_found = sum(1 for row in profiles.values() if row["coach"])
    if coaches_found < 100:
        sample = as_list(coach_rows)[:1]
        keys = list(sample[0].keys()) if sample else []
        raise SystemExit(f"Only matched {coaches_found} head coaches. First row keys: {keys}")

    no_series = game_series(as_list(no_gt), index)
    yes_series = game_series(as_list(with_gt), index)
    if len(no_series) < 100:
        sample = as_list(no_gt)[:1]
        keys = list(sample[0].keys()) if sample else []
        raise SystemExit(f"Game EPA matched {len(no_series)} teams. First row keys: {keys}")

    calls = holder[0].calls if holder[0] else 0
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    profile = {
        "season": year,
        "source": "cfbd",
        "updatedAt": stamp,
        "callsUsed": calls,
        "spSosHigherIsHarder": higher_is_harder,
        "fpiRank1IsToughest": rank1_toughest,
        "teams": profiles,
    }
    series = {
        "season": year,
        "source": "cfbd",
        "updatedAt": stamp,
        "teams": {
            team_id: {"noGT": no_series.get(team_id, []), "withGT": yes_series.get(team_id, [])}
            for team_id in sorted(set(no_series) | set(yes_series))
        },
    }
    PUBLIC.mkdir(parents=True, exist_ok=True)
    (PUBLIC / "team-profile.json").write_text(json.dumps(profile) + "\n")
    (PUBLIC / "game-epa.json").write_text(json.dumps(series) + "\n")
    print(f"Wrote ratings for {matched} teams and game EPA for {len(no_series)} teams. CFBD calls this run: {calls}.")
    if higher_is_harder:
        print("SP+ SOS: a higher number is a harder schedule.")
    else:
        print("SP+ SOS was blank for every team, so it was not ranked.")
    print("FPI schedule rank: 1 is the toughest. Strength of record: 1 is the most impressive.")


if __name__ == "__main__":
    main()
