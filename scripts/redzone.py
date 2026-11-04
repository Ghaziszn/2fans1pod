"""Scrape red-zone scoring percentages from cfbstats.com.

Saves after every team. A failed request keeps the last good file.
Run from the repo root: .venv/bin/python scripts/redzone.py
"""

from __future__ import annotations

import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "raw" / "redzone.json"
BASE = "https://cfbstats.com"
SLEEP = 1.0


def season_year() -> int:
    site = json.loads((ROOT / "config" / "site.json").read_text())
    return int(site["season"])


def load_existing() -> dict:
    if not OUT.exists():
        return {"scraped_at": None, "offense": {}, "defense": {}}
    try:
        data = json.loads(OUT.read_text())
    except json.JSONDecodeError:
        return {"scraped_at": None, "offense": {}, "defense": {}}
    data.setdefault("offense", {})
    data.setdefault("defense", {})
    return data


def save(data: dict) -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    data["scraped_at"] = datetime.now(timezone.utc).isoformat()
    tmp = OUT.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2))
    tmp.replace(OUT)


def team_links(year: int) -> list[tuple[str, str]]:
    url = f"{BASE}/{year}/team/index.html"
    response = requests.get(url, timeout=20)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    pattern = re.compile(rf"/{year}/team/\d+/")
    found: list[tuple[str, str]] = []
    seen: set[str] = set()
    for link in soup.find_all("a"):
        href = link.get("href") or ""
        if not pattern.search(href):
            continue
        name = link.get_text(strip=True)
        if not name or name in seen:
            continue
        seen.add(name)
        absolute = href if href.startswith("http") else BASE + href
        found.append((name, absolute))
    return found


def score_pct(team_url: str, side: str) -> float | None:
    url = team_url.replace("index.html", f"redzone/{side}/split.html")
    response = requests.get(url, timeout=20)
    if response.status_code != 200:
        return None
    soup = BeautifulSoup(response.text, "html.parser")
    table = soup.find("table")
    if not table:
        return None
    rows = table.find_all("tr")
    if len(rows) < 2:
        return None
    headers = [cell.get_text(strip=True) for cell in rows[0].find_all(["th", "td"])]
    if "Score %" not in headers:
        return None
    index = headers.index("Score %")
    for row in rows[1:]:
        cells = [cell.get_text(strip=True) for cell in row.find_all("td")]
        if not cells or cells[0] != "All Games":
            continue
        if index >= len(cells):
            return None
        try:
            return float(cells[index])
        except ValueError:
            return None
    return None


def main() -> None:
    year = season_year()
    data = load_existing()
    links = team_links(year)
    print(f"Red zone: {len(links)} teams for {year}")
    for index, (name, url) in enumerate(links, start=1):
        if name in data["offense"] and name in data["defense"]:
            continue
        try:
            offense = score_pct(url, "offense")
            time.sleep(SLEEP)
            defense = score_pct(url, "defense")
        except requests.RequestException as exc:
            print(f"  skip {name}: {exc}")
            time.sleep(SLEEP)
            continue
        if offense is not None:
            data["offense"][name] = offense
        if defense is not None:
            data["defense"][name] = defense
        if index % 10 == 0:
            save(data)
            print(f"  saved {index}/{len(links)}")
        time.sleep(SLEEP)
    save(data)
    print(f"Red zone saved. Offense {len(data['offense'])}, defense {len(data['defense'])}.")


if __name__ == "__main__":
    main()
