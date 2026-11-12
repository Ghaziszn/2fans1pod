import json
import unittest
from pathlib import Path

from scripts.build_season import rivalry_search_rows

ROOT = Path(__file__).resolve().parents[2]


class RivalrySearchTests(unittest.TestCase):
    def test_named_rivalry_points_at_its_matchup_page(self):
        teams = [{"id": "alabama", "school": "Alabama"}, {"id": "auburn", "school": "Auburn"}]
        rows = rivalry_search_rows(teams, [{"name": "Iron Bowl", "home": "Alabama", "away": "Auburn"}])
        self.assertEqual(rows[0]["href"], "/matchup/alabama-vs-auburn/")
        self.assertEqual(rows[0]["name"], "Iron Bowl")
        self.assertIn("Auburn Alabama", rows[0]["aliases"])

    def test_skips_a_school_that_is_not_in_the_season(self):
        teams = [{"id": "alabama", "school": "Alabama"}]
        rows = rivalry_search_rows(teams, [{"name": "Iron Bowl", "home": "Alabama", "away": "Auburn"}])
        self.assertEqual(rows, [])

    def test_published_index_includes_every_configured_rivalry(self):
        teams = json.loads((ROOT / "public" / "data" / "teams.json").read_text())
        rivalries = json.loads((ROOT / "config" / "rivalries.json").read_text())
        expected = {row["href"] for row in rivalry_search_rows(teams, rivalries)}
        published = json.loads((ROOT / "public" / "data" / "search-index.json").read_text())
        found = {row["href"] for row in published if row["type"] == "rivalry"}
        self.assertEqual(found, expected)
        self.assertEqual(len(expected), len(rivalries))
