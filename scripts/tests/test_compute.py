import unittest

from scripts.compute import rank_values, record_without, strength_of_schedule, win_pct


class ScheduleTests(unittest.TestCase):
    def test_excludes_the_head_to_head_game(self):
        wins, losses = record_without(1, 1, beat_us=False)
        self.assertEqual((wins, losses), (1, 0))
        self.assertAlmostEqual(win_pct(wins, losses), 1.0)

    def test_fcs_counts_in_the_average(self):
        self.assertAlmostEqual(strength_of_schedule([1.0, 0.0, 0.4]), 1.4 / 3)

    def test_empty_schedule_has_no_rating(self):
        self.assertIsNone(strength_of_schedule([]))

    def test_ties_share_the_best_rank(self):
        ranks = rank_values([("a", 10.0), ("b", 10.0), ("c", 8.0)], higher_is_better=True)
        self.assertEqual(ranks["a"], 1)
        self.assertEqual(ranks["b"], 1)
        self.assertEqual(ranks["c"], 3)


if __name__ == "__main__":
    unittest.main()
