import json
import tempfile
import unittest
from pathlib import Path

from scripts.redzone import parse_score_pct
from scripts.validate import validate_dir

ROOT = Path(__file__).resolve().parents[2]
FIXTURE = Path(__file__).resolve().parent / "fixtures" / "redzone-split.html"


class RedZoneParseTests(unittest.TestCase):
    def test_reads_all_games_score_percent(self):
        self.assertEqual(parse_score_pct(FIXTURE.read_text()), 88.2)

    def test_missing_column_returns_nothing(self):
        self.assertIsNone(parse_score_pct("<table><tr><th>Split</th></tr><tr><td>All Games</td></tr></table>"))


class ValidatorTests(unittest.TestCase):
    def test_live_data_passes(self):
        validate_dir(ROOT / "public" / "data")

    def test_empty_file_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "season.json"
            target.write_text("")
            with self.assertRaises(SystemExit):
                validate_dir(Path(folder))

    def test_bad_shape_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            for name in ["season.json", "teams.json", "games.json", "conferences.json", "rankings.json", "team-stats.json", "search-index.json"]:
                (root / name).write_text(json.dumps({"not": "a valid season file"}))
            with self.assertRaises(SystemExit):
                validate_dir(root)


if __name__ == "__main__":
    unittest.main()
