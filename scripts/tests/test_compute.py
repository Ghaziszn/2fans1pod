import unittest

from scripts.compute import ats_records, cover_side, rank_values, record_without, strength_of_schedule, win_pct


class ScheduleTests(unittest.TestCase):
    def test_excludes_the_head_to_head_game(self):
        wins, losses = record_without(1, 1, beat_us=False)
        self.assertEqual((wins, losses), (1, 0))
        self.assertAlmostEqual(win_pct(wins, losses), 1.0)

    def test_fcs_counts_in_the_average(self):
        self.assertAlmostEqual(strength_of_schedule([1.0, 0.0, 0.4]), 1.4 / 3)

    def test_empty_schedule_has_no_rating(self):
        self.assertIsNone(strength_of_schedule([]))

    def test_home_favorite_needs_to_win_by_more_than_the_line(self):
        self.assertEqual(cover_side(27, 24, -3.5), "away")
        self.assertEqual(cover_side(31, 24, -3.5), "home")
        self.assertEqual(cover_side(27, 24, -3), "push")

    def test_ats_skips_games_without_a_line(self):
        records = ats_records(
            [
                {"completed": True, "homeId": "a", "awayId": "b", "homePoints": 31, "awayPoints": 24, "homeSpread": -3.5},
                {"completed": True, "homeId": "a", "awayId": "c", "homePoints": 10, "awayPoints": 7, "homeSpread": None},
            ]
        )
        self.assertEqual(records["a"], {"wins": 1, "losses": 0, "pushes": 0})
        self.assertEqual(records["b"], {"wins": 0, "losses": 1, "pushes": 0})
        self.assertNotIn("c", records)

    def test_ties_share_the_best_rank(self):
        ranks = rank_values([("a", 10.0), ("b", 10.0), ("c", 8.0)], higher_is_better=True)
        self.assertEqual(ranks["a"], 1)
        self.assertEqual(ranks["b"], 1)
        self.assertEqual(ranks["c"], 3)


if __name__ == "__main__":
    unittest.main()
