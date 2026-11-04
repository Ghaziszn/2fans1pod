"""Build the JSON files the site reads.

If CFBD_API_KEY is set, numbers come from collegefootballdata.com.
If it is not set, the same files are built from ESPN's public feed and a
simple Elo rating computed from the results. The season file records which
source was used. Re-run this script after adding the key and it overwrites
the files. Raw downloads stay in data/raw, which git ignores.
"""

from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

from scripts.compute import rank_values, record_without, slugify, strength_of_schedule, update_elo, win_pct

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
PUBLIC = ROOT / "public" / "data"
LOGOS = ROOT / "public" / "logos"

CONFERENCE_NAMES = {
    "American Conference": "American",
    "Atlantic Coast Conference": "ACC",
    "Big 12 Conference": "Big 12",
    "Big Ten Conference": "Big Ten",
    "Conference USA": "Conference USA",
    "Mid-American Conference": "MAC",
    "Mountain West Conference": "Mountain West",
    "Pac-12 Conference": "Pac-12",
    "Southeastern Conference": "SEC",
    "Sun Belt Conference": "Sun Belt",
    "FBS Independents": "FBS Independents",
}


def load_json(path: Path):
    return json.loads(path.read_text())


def canon_conference(name: str) -> str:
    return CONFERENCE_NAMES.get(name, name)


def tier_for(name: str, fmt: dict) -> str:
    if name in fmt["powerConferences"]:
        return "power"
    if name in fmt["groupConferences"]:
        return "group"
    return "independent"


def get_json(url: str, headers: dict | None = None, cache_name: str | None = None):
    if cache_name:
        path = RAW / cache_name
        if path.exists():
            return json.loads(path.read_text())
    response = requests.get(url, headers=headers or {}, timeout=40)
    response.raise_for_status()
    data = response.json()
    if cache_name:
        path = RAW / cache_name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data))
    return data


def flatten_standings(node: dict, inherited: str | None = None) -> list[tuple[str, dict]]:
    raw_name = node.get("name") or ""
    name = CONFERENCE_NAMES.get(raw_name, inherited)
    rows: list[tuple[str, dict]] = []
    entries = (node.get("standings") or {}).get("entries") or []
    if name:
        for entry in entries:
            rows.append((name, entry))
    for child in node.get("children") or []:
        rows.extend(flatten_standings(child, name))
    return rows


def fetch_espn(fmt: dict) -> dict:
    RAW.mkdir(parents=True, exist_ok=True)
    standings = get_json(
        "https://site.api.espn.com/apis/v2/sports/football/college-football/standings",
        cache_name="espn-standings.json",
    )
    directory = get_json(
        "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams?limit=500",
        cache_name="espn-directory.json",
    )
    by_espn: dict[str, dict] = {}
    for item in directory["sports"][0]["leagues"][0]["teams"]:
        team = item["team"]
        by_espn[str(team["id"])] = team

    teams = []
    used_slugs: set[str] = set()
    for conference, entry in flatten_standings(standings):
        if conference not in CONFERENCE_NAMES.values() and conference not in fmt["powerConferences"] + fmt["groupConferences"] + ["FBS Independents"]:
            continue
        raw = entry["team"]
        espn_id = str(raw["id"])
        extra = by_espn.get(espn_id, {})
        school = extra.get("location") or extra.get("displayName") or raw.get("location") or raw.get("displayName")
        if not school:
            continue
        slug = slugify(school)
        if slug in used_slugs:
            slug = f"{slug}-{espn_id}"
        used_slugs.add(slug)
        logos = extra.get("logos") or raw.get("logos") or []
        logo = logos[0]["href"] if logos else ""
        color = extra.get("color") or raw.get("color") or "333333"
        alt = extra.get("alternateColor") or raw.get("alternateColor") or "ffffff"
        teams.append(
            {
                "id": slug,
                "espnId": espn_id,
                "school": school,
                "mascot": extra.get("name") or raw.get("name") or "",
                "abbreviation": extra.get("abbreviation") or raw.get("abbreviation") or school[:3].upper(),
                "conference": conference,
                "tier": tier_for(conference, fmt),
                "color": f"#{color.lstrip('#')}",
                "alternateColor": f"#{alt.lstrip('#')}",
                "logo": logo,
                "alternateNames": [],
            }
        )

    id_by_espn = {team["espnId"]: team["id"] for team in teams}
    games = []
    for season_type, label in (("2", "regular"), ("3", "postseason")):
        for week in range(1, 16):
            url = (
                "https://site.api.espn.com/apis/site/v2/sports/football/college-football/"
                f"scoreboard?week={week}&seasontype={season_type}&groups=80&limit=400"
            )
            try:
                board = get_json(url, cache_name=f"espn-week-{label}-{week}.json")
            except requests.RequestException:
                continue
            for event in board.get("events") or []:
                comp = (event.get("competitions") or [None])[0]
                if not comp:
                    continue
                competitors = {c.get("homeAway"): c for c in comp.get("competitors") or []}
                home = competitors.get("home")
                away = competitors.get("away")
                if not home or not away:
                    continue
                home_espn = str(home["team"]["id"])
                away_espn = str(away["team"]["id"])
                status = (comp.get("status") or {}).get("type") or {}
                completed = bool(status.get("completed"))
                def points(side: dict):
                    if not completed:
                        return None
                    try:
                        return int(float(side.get("score")))
                    except (TypeError, ValueError):
                        return None
                notes = " ".join(
                    f"{note.get('headline', '')} {note.get('text', '')}" for note in (comp.get("notes") or [])
                )
                title = f"{event.get('name', '')} {notes}".lower()
                odds = (comp.get("odds") or [None])[0] or {}
                spread = odds.get("details") if isinstance(odds, dict) else None
                home_id = id_by_espn.get(home_espn, f"ext-{home_espn}")
                away_id = id_by_espn.get(away_espn, f"ext-{away_espn}")
                home_team = next((team for team in teams if team["id"] == home_id), None)
                away_team = next((team for team in teams if team["id"] == away_id), None)
                games.append(
                    {
                        "id": str(event["id"]),
                        "week": week,
                        "seasonType": "postseason" if label == "postseason" else "regular",
                        "startDate": event.get("date") or "",
                        "homeId": home_id,
                        "awayId": away_id,
                        "homeName": home_team["school"] if home_team else home["team"].get("displayName") or home["team"].get("location") or "Away",
                        "awayName": away_team["school"] if away_team else away["team"].get("displayName") or away["team"].get("location") or "Home",
                        "homePoints": points(home),
                        "awayPoints": points(away),
                        "completed": completed,
                        "conferenceGame": bool(comp.get("conferenceCompetition")),
                        "championship": "championship" in title,
                        "neutralSite": bool(comp.get("neutralSite")),
                        "venue": (comp.get("venue") or {}).get("fullName"),
                        "spread": spread,
                        "homeFbs": home_id in id_by_espn.values(),
                        "awayFbs": away_id in id_by_espn.values(),
                    }
                )
            time.sleep(0.15)

    deduped = []
    seen_games: set[str] = set()
    for game in games:
        if game["id"] in seen_games:
            continue
        seen_games.add(game["id"])
        deduped.append(game)
    games = deduped

    rankings = get_json(
        "https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings",
        cache_name="espn-rankings.json",
    )
    cfp = next(row for row in rankings["rankings"] if "Playoff" in row.get("name", ""))
    cfp_rows = []
    school_by_espn = {team["espnId"]: team for team in teams}
    for row in cfp.get("ranks") or []:
        espn_id = str(row["team"]["id"])
        team = school_by_espn.get(espn_id)
        if team:
            cfp_rows.append({"teamId": team["id"], "rank": row["current"]})

    stats_raw: dict[str, dict] = {}
    for team in teams:
        cache = RAW / "espn-stats" / f"{team['espnId']}.json"
        if cache.exists():
            payload = json.loads(cache.read_text())
        else:
            url = f"https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/{team['espnId']}/statistics"
            try:
                payload = requests.get(url, timeout=30).json()
            except requests.RequestException:
                payload = {}
            cache.parent.mkdir(parents=True, exist_ok=True)
            cache.write_text(json.dumps(payload))
            time.sleep(0.12)
        flat: dict[str, float] = {}
        categories = (((payload.get("results") or {}).get("stats") or {}).get("categories") or [])
        for category in categories:
            for stat in category.get("stats") or []:
                if stat.get("value") is not None:
                    flat[stat["name"]] = stat["value"]
        stats_raw[team["id"]] = flat

    week_number = 0
    try:
        sample = json.loads((RAW / "espn-week-regular-10.json").read_text())
        week_number = int((sample.get("week") or {}).get("number") or 0)
    except (OSError, json.JSONDecodeError, ValueError):
        week_number = 0
    label = cfp.get("occurrence") or {}
    ranking_label = "CFP Rankings"
    if isinstance(label, dict) and label.get("displayValue"):
        ranking_label = f"CFP Rankings, {label['displayValue']}"
    return {
        "provider": "espn",
        "eloSource": "computed",
        "teams": teams,
        "games": games,
        "cfp": cfp_rows,
        "elo": None,
        "stats": stats_raw,
        "week": week_number,
        "rankingLabel": ranking_label,
    }


CFBSTATS_NAMES = {
    "App State": "Appalachian State",
    "Florida International": "FIU",
    "Hawai'i": "Hawaii",
    "Miami": "Miami (FL)",
    "Middle Tennessee": "Middle Tennessee State",
    "Sam Houston": "Sam Houston State",
    "San José State": "San Jose State",
    "South Florida": "USF",
    "UConn": "Connecticut",
    "UL Monroe": "Louisiana-Monroe",
}


def cfbstats_name(school: str) -> str:
    return CFBSTATS_NAMES.get(school, school)


def percent(value: float | None) -> float | None:
    if value is None:
        return None
    if value <= 1:
        return round(value * 100, 1)
    return round(value, 1)


def per_game(total: float | None, games: int) -> float | None:
    if total is None or games <= 0:
        return None
    return round(total / games, 2)


def build_outputs(bundle: dict, fmt: dict, ranking: dict, aliases: dict, catalog: dict, dest: Path = PUBLIC) -> None:
    teams = bundle["teams"]
    games = bundle["games"]
    by_id = {team["id"]: team for team in teams}
    fbs_ids = set(by_id)
    for team in teams:
        team["alternateNames"] = aliases.get(team["school"], [])

    results: dict[str, dict] = {team["id"]: {"wins": 0, "losses": 0, "confWins": 0, "confLosses": 0} for team in teams}
    points_allowed: dict[str, list[int]] = {team["id"]: [] for team in teams}
    for game in games:
        if not game["completed"] or game["homePoints"] is None or game["awayPoints"] is None:
            continue
        if game["homePoints"] == game["awayPoints"]:
            continue
        winner = game["homeId"] if game["homePoints"] > game["awayPoints"] else game["awayId"]
        loser = game["awayId"] if winner == game["homeId"] else game["homeId"]
        if winner in results:
            results[winner]["wins"] += 1
            if game["conferenceGame"] and not game["championship"] and loser in fbs_ids:
                results[winner]["confWins"] += 1
        if loser in results:
            results[loser]["losses"] += 1
            if game["conferenceGame"] and not game["championship"] and winner in fbs_ids:
                results[loser]["confLosses"] += 1
        if game["homeId"] in points_allowed:
            points_allowed[game["homeId"]].append(game["awayPoints"])
        if game["awayId"] in points_allowed:
            points_allowed[game["awayId"]].append(game["homePoints"])

    base_elo = {team["id"]: 1500.0 for team in teams}
    elo = bundle["elo"] or update_elo(base_elo, games)
    cfp_ids = [row["teamId"] for row in sorted(bundle["cfp"], key=lambda row: row["rank"]) if row["teamId"] in fbs_ids]
    rest = [team["id"] for team in teams if team["id"] not in set(cfp_ids)]
    rest.sort(key=lambda team_id: (-elo.get(team_id, 0), by_id[team_id]["school"]))
    order = cfp_ids + rest

    redzone_path = RAW / "redzone.json"
    redzone = {"offense": {}, "defense": {}}
    if redzone_path.exists():
        redzone = json.loads(redzone_path.read_text())

    stat_rows: dict[str, dict] = {}
    for team in teams:
        raw = bundle["stats"].get(team["id"], {})
        games_played = int(raw.get("gamesPlayed") or raw.get("teamGamesPlayed") or (results[team["id"]]["wins"] + results[team["id"]]["losses"]) or 0)
        allowed = points_allowed[team["id"]]
        offense = {
            "points": raw.get("totalPointsPerGame"),
            "totalYards": raw.get("yardsPerGame") or per_game(raw.get("totalYards"), games_played),
            "passYards": raw.get("netPassingYardsPerGame") or raw.get("passingYardsPerGame"),
            "rushYards": raw.get("rushingYardsPerGame"),
            "yardsPerRush": raw.get("yardsPerRushAttempt"),
            "thirdDown": percent(raw.get("thirdDownConvPct")),
            "fourthDown": percent(raw.get("fourthDownConvPct")),
            "redZone": percent(raw.get("redzoneScoringPct")),
            "giveaways": per_game(raw.get("totalGiveaways"), games_played),
            "top": None if raw.get("possessionTimeSeconds") is None or games_played == 0 else round(raw["possessionTimeSeconds"] / games_played / 60, 1),
            "penalties": per_game(raw.get("totalPenalties"), games_played),
        }
        scraped_off = redzone.get("offense", {}).get(cfbstats_name(team["school"]))
        if scraped_off is not None:
            offense["redZone"] = round(float(scraped_off), 1)
        defense = {
            "points": round(sum(allowed) / len(allowed), 1) if allowed else None,
            "totalYards": None,
            "passYards": None,
            "rushYards": None,
            "yardsPerRush": None,
            "thirdDown": None,
            "fourthDown": None,
            "redZone": None,
            "takeaways": per_game(raw.get("totalTakeaways"), games_played),
            "sacks": per_game(raw.get("sacks"), games_played),
            "tfl": per_game(raw.get("tacklesForLoss"), games_played),
        }
        scraped_def = redzone.get("defense", {}).get(cfbstats_name(team["school"]))
        if scraped_def is not None:
            defense["redZone"] = round(float(scraped_def), 1)
        stat_rows[team["id"]] = {"games": games_played, "offense": offense, "defense": defense}

    sos_values: dict[str, float | None] = {}
    fcs_pct = float(ranking.get("fcsOpponentWinPct", 0.4))
    for team in teams:
        values = []
        for game in games:
            if not game["completed"] or team["id"] not in (game["homeId"], game["awayId"]):
                continue
            opponent = game["awayId"] if game["homeId"] == team["id"] else game["homeId"]
            if opponent not in results:
                values.append(fcs_pct)
                continue
            if game["homePoints"] == game["awayPoints"]:
                opponent_won = None
            elif opponent == game["homeId"]:
                opponent_won = game["homePoints"] > game["awayPoints"]
            else:
                opponent_won = game["awayPoints"] > game["homePoints"]
            wins, losses = record_without(results[opponent]["wins"], results[opponent]["losses"], beat_us=opponent_won)
            pct = win_pct(wins, losses)
            if pct is not None:
                values.append(pct)
        sos_values[team["id"]] = strength_of_schedule(values)

    def cell(value, rank):
        rounded = None if value is None else round(float(value), 3 if abs(float(value)) < 2 else 2)
        return {"value": rounded, "rank": rank}

    offense_keys = [key for key, meta in catalog.items() if meta.get("offense")]
    defense_keys = [key for key, meta in catalog.items() if meta.get("defense")]
    ranks_off = {
        key: rank_values([(team_id, rows["offense"].get(key)) for team_id, rows in stat_rows.items()], catalog[key]["higherIsBetterOffense"])
        for key in offense_keys
    }
    ranks_def = {
        key: rank_values([(team_id, rows["defense"].get(key)) for team_id, rows in stat_rows.items()], catalog[key]["higherIsBetterDefense"])
        for key in defense_keys
    }
    sos_ranks = rank_values(list(sos_values.items()), True)

    team_stats = {}
    for team in teams:
        rows = stat_rows[team["id"]]
        team_stats[team["id"]] = {
            "games": rows["games"],
            "wins": results[team["id"]]["wins"],
            "losses": results[team["id"]]["losses"],
            "conferenceWins": results[team["id"]]["confWins"],
            "conferenceLosses": results[team["id"]]["confLosses"],
            "offense": {key: cell(rows["offense"].get(key), ranks_off.get(key, {}).get(team["id"])) for key in offense_keys},
            "defense": {key: cell(rows["defense"].get(key), ranks_def.get(key, {}).get(team["id"])) for key in defense_keys},
            "sos": cell(None if sos_values[team["id"]] is None else round(sos_values[team["id"]], 3), sos_ranks.get(team["id"])),
            "ats": {"wins": 0, "losses": 0, "pushes": 0, "rank": None},
        }

    conferences = []
    for name in fmt["powerConferences"] + fmt["groupConferences"] + ["FBS Independents"]:
        members = [team["id"] for team in teams if team["conference"] == name]
        if not members:
            continue
        conferences.append({"id": slugify(name), "name": name, "tier": tier_for(name, fmt), "teams": members})

    remaining = [game for game in games if not game["completed"] and game["seasonType"] == "regular"]
    season = {
        "season": load_json(ROOT / "config" / "site.json")["season"],
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "week": bundle["week"],
        "provider": bundle["provider"],
        "eloSource": bundle["eloSource"],
        "rankingLabel": bundle["rankingLabel"],
        "fieldLocked": len(remaining) == 0,
        "teamCount": len(teams),
    }
    search = []
    for team in teams:
        search.append(
            {
                "type": "team",
                "name": team["school"],
                "detail": team["conference"],
                "href": f"/teams/{team['id']}",
                "aliases": team["alternateNames"] + [team["abbreviation"], team["mascot"]],
            }
        )
    for conference in conferences:
        search.append({"type": "conference", "name": conference["name"], "detail": "Conference", "href": f"/conferences/{conference['id']}", "aliases": []})
    for name, href, aliases_list in (
        ("Playoff Simulator", "/", ["playoff", "bracket", "simulate"]),
        ("Matchup Calculator", "/matchup", ["matchup", "compare", "calculator"]),
        ("CFP Rankings", "/rankings", ["rankings", "poll", "cfp"]),
        ("Conferences", "/conferences", ["standings"]),
        ("Contact", "/contact", ["email", "sponsor"]),
    ):
        search.append({"type": "page", "name": name, "detail": "Page", "href": href, "aliases": aliases_list})

    dest.mkdir(parents=True, exist_ok=True)
    LOGOS.mkdir(parents=True, exist_ok=True)
    for team in teams:
        logo_path = LOGOS / f"{team['id']}.png"
        if team["logo"] and not logo_path.exists():
            try:
                image = requests.get(team["logo"], timeout=20)
                if image.ok and image.content:
                    logo_path.write_bytes(image.content)
            except requests.RequestException:
                pass
        if logo_path.exists():
            team["logo"] = f"/logos/{team['id']}.png"

    public_teams = [{key: team[key] for key in ("id", "school", "mascot", "abbreviation", "conference", "tier", "color", "alternateColor", "logo", "alternateNames")} for team in teams]
    public_games = [{key: game[key] for key in ("id", "week", "seasonType", "startDate", "homeId", "awayId", "homeName", "awayName", "homePoints", "awayPoints", "completed", "conferenceGame", "championship", "neutralSite", "venue", "spread")} for game in games]

    write_json(dest / "season.json", season)
    write_json(dest / "teams.json", public_teams)
    write_json(dest / "games.json", public_games)
    write_json(dest / "conferences.json", conferences)
    write_json(dest / "rankings.json", {"cfp": bundle["cfp"], "order": order})
    write_json(dest / "team-stats.json", team_stats)
    write_json(dest / "search-index.json", search)
    print(f"Wrote {len(public_teams)} teams and {len(public_games)} games from {bundle['provider']}.")


def write_json(path: Path, payload) -> None:
    path.write_text(json.dumps(payload, indent=2) + "\n")


def fetch_cfbd(fmt: dict, key: str) -> dict:
    """College Football Data API. Used when CFBD_API_KEY is present."""

    def pull(path: str, **params):
        response = requests.get(
            f"https://api.collegefootballdata.com{path}",
            params=params,
            headers={"Authorization": f"Bearer {key}"},
            timeout=60,
        )
        response.raise_for_status()
        return response.json()

    year = load_json(ROOT / "config" / "site.json")["season"]
    raw_teams = pull("/teams/fbs", year=year)
    teams = []
    used: set[str] = set()
    for raw in raw_teams:
        school = raw.get("school")
        if not school:
            continue
        slug = slugify(school)
        if slug in used:
            slug = f"{slug}-{raw.get('id')}"
        used.add(slug)
        conference = canon_conference(raw.get("conference") or "FBS Independents")
        logos = raw.get("logos") or []
        teams.append(
            {
                "id": slug,
                "school": school,
                "mascot": raw.get("mascot") or "",
                "abbreviation": raw.get("abbreviation") or school[:3].upper(),
                "conference": conference,
                "tier": tier_for(conference, fmt),
                "color": f"#{str(raw.get('color') or '333333').lstrip('#')}",
                "alternateColor": f"#{str(raw.get('alternateColor') or 'ffffff').lstrip('#')}",
                "logo": logos[0] if logos else "",
                "alternateNames": raw.get("alternateNames") or [],
                "cfbdName": school,
            }
        )
    by_name = {team["cfbdName"]: team for team in teams}
    games = []
    for season_type in ("regular", "postseason"):
        for raw in pull("/games", year=year, seasonType=season_type, division="fbs"):
            home_name = raw.get("homeTeam") or raw.get("home_team")
            away_name = raw.get("awayTeam") or raw.get("away_team")
            home = by_name.get(home_name)
            away = by_name.get(away_name)
            home_points = raw.get("homePoints", raw.get("home_points"))
            away_points = raw.get("awayPoints", raw.get("away_points"))
            notes = raw.get("notes") or ""
            games.append(
                {
                    "id": str(raw.get("id")),
                    "week": raw.get("week") or 0,
                    "seasonType": "postseason" if season_type == "postseason" else "regular",
                    "startDate": raw.get("startDate") or raw.get("start_date") or "",
                    "homeId": home["id"] if home else slugify(home_name or "home"),
                    "awayId": away["id"] if away else slugify(away_name or "away"),
                    "homeName": home["school"] if home else (home_name or "Home"),
                    "awayName": away["school"] if away else (away_name or "Away"),
                    "homePoints": home_points,
                    "awayPoints": away_points,
                    "completed": bool(raw.get("completed")) or home_points is not None,
                    "conferenceGame": bool(raw.get("conferenceGame", raw.get("conference_game"))),
                    "championship": "championship" in str(notes).lower(),
                    "neutralSite": bool(raw.get("neutralSite", raw.get("neutral_site"))),
                    "venue": raw.get("venue"),
                    "spread": None,
                    "homeFbs": home is not None,
                    "awayFbs": away is not None,
                }
            )
    polls = pull("/rankings", year=year, seasonType="regular")
    cfp_rows = []
    latest = None
    for poll in polls:
        for item in poll.get("polls") or []:
            if "Playoff" in item.get("poll", "") or item.get("poll") in {"CFP", "Playoff Committee Rankings"}:
                latest = item
    if latest:
        for row in latest.get("ranks") or []:
            team = by_name.get(row.get("school"))
            if team:
                cfp_rows.append({"teamId": team["id"], "rank": row.get("rank")})
    stats_raw: dict[str, dict] = {team["id"]: {} for team in teams}
    for row in pull("/stats/season", year=year):
        team = by_name.get(row.get("team"))
        if not team:
            continue
        stats_raw[team["id"]][row.get("statName")] = row.get("statValue")
    # Map the long CFBD names onto the keys the rest of the builder expects.
    normalized: dict[str, dict] = {}
    for team in teams:
        raw = stats_raw[team["id"]]
        games_played = raw.get("games") or 0
        def pg(key):
            value = raw.get(key)
            return None if value is None or not games_played else value / games_played
        normalized[team["id"]] = {
            "gamesPlayed": games_played,
            "totalPointsPerGame": pg("points"),
            "yardsPerGame": pg("totalYards"),
            "netPassingYardsPerGame": pg("netPassingYards"),
            "rushingYardsPerGame": pg("rushingYards"),
            "yardsPerRushAttempt": None if not raw.get("rushingAttempts") else raw.get("rushingYards", 0) / raw["rushingAttempts"],
            "thirdDownConvPct": None if not raw.get("thirdDowns") else raw.get("thirdDownConversions", 0) / raw["thirdDowns"] * 100,
            "fourthDownConvPct": None if not raw.get("fourthDowns") else raw.get("fourthDownConversions", 0) / raw["fourthDowns"] * 100,
            "totalGiveaways": raw.get("turnovers"),
            "totalTakeaways": raw.get("turnoversOpponent"),
            "possessionTimeSeconds": raw.get("possessionTime"),
            "totalPenalties": raw.get("penalties"),
            "sacks": raw.get("sacks"),
            "tacklesForLoss": raw.get("tacklesForLoss"),
        }
    elo_rows = pull("/ratings/elo", year=year)
    elo = {}
    for row in elo_rows:
        team = by_name.get(row.get("team"))
        if team and row.get("elo") is not None:
            elo[team["id"]] = row["elo"]
    return {
        "provider": "cfbd",
        "eloSource": "cfbd",
        "teams": teams,
        "games": games,
        "cfp": cfp_rows,
        "elo": elo or None,
        "stats": normalized,
        "week": max((game["week"] for game in games if game["completed"]), default=0),
        "rankingLabel": "CFP committee rankings",
    }


def main() -> None:
    fmt = load_json(ROOT / "config" / "cfp-format.json")
    ranking = load_json(ROOT / "config" / "ranking.json")
    aliases = load_json(ROOT / "config" / "aliases.json")
    catalog = load_json(ROOT / "config" / "stat-catalog.json")
    env_file = ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.startswith("CFBD_API_KEY=") and not os.environ.get("CFBD_API_KEY"):
                os.environ["CFBD_API_KEY"] = line.split("=", 1)[1].strip().strip('"').strip("'")
    key = os.environ.get("CFBD_API_KEY", "").strip()
    if key:
        print("Using College Football Data.")
        bundle = fetch_cfbd(fmt, key)
    else:
        print("No CFBD_API_KEY. Using the public ESPN feed and a computed Elo rating.")
        bundle = fetch_espn(fmt)
    from scripts.validate import validate_dir
    import shutil

    staging = ROOT / "data" / "raw" / "staging"
    if staging.exists():
        shutil.rmtree(staging)
    build_outputs(bundle, fmt, ranking, aliases, catalog, dest=staging)
    validate_dir(staging)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    for path in staging.glob("*.json"):
        shutil.copy(path, PUBLIC / path.name)


if __name__ == "__main__":
    main()
