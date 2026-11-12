import unittest

from scripts.build_profile import (
    as_percent,
    fpi_rank1_is_toughest,
    game_series,
    lower_rank_favors_power,
    pick_coaches,
    sos_is_harder_when_higher,
)


class ProfileBuildTests(unittest.TestCase):
    def test_returning_fraction_becomes_a_percent(self):
        self.assertEqual(as_percent(0.62), 62.0)
        self.assertEqual(as_percent(62), 62.0)

    def test_higher_sp_sos_ranks_as_the_harder_schedule(self):
        pairs = [("SEC", 20, 8)] * 12 + [("Mid-American", 2, 1)] * 12
        self.assertTrue(sos_is_harder_when_higher(pairs))
        flipped = [("SEC", 20, 1)] * 12 + [("Mid-American", 2, 8)] * 12
        self.assertFalse(sos_is_harder_when_higher(flipped))

    def test_lower_fpi_rank_is_the_stronger_end_for_power_conferences(self):
        pairs = [("SEC", 10)] * 12 + [("Mid-American", 100)] * 12
        self.assertTrue(lower_rank_favors_power(pairs))
        flipped = [("SEC", 100)] * 12 + [("Conference USA", 10)] * 12
        self.assertFalse(lower_rank_favors_power(flipped))

    def test_fpi_rank_one_is_the_tougher_schedule_when_it_matches_sp(self):
        pairs = [(float(value), 30 - value) for value in range(40)]
        self.assertTrue(fpi_rank1_is_toughest(pairs))
        backwards = [(float(value), value) for value in range(40)]
        self.assertFalse(fpi_rank1_is_toughest(backwards))

    def test_coach_join_keeps_this_season_and_the_busier_row(self):
        index = {"alabama": "alabama"}
        rows = [
            {"year": 2025, "team": "Alabama", "firstName": "Nick", "lastName": "Saban", "games": 15},
            {"year": 2026, "team": "Alabama", "firstName": "Kalen", "lastName": "DeBoer", "games": 8},
            {"year": 2026, "team": "Alabama", "coach": {"firstName": "Someone", "lastName": "Else"}, "games": 2},
        ]
        self.assertEqual(pick_coaches(rows, index, 2026), {"alabama": "Kalen DeBoer"})

    def test_game_epa_is_ordered_by_week(self):
        index = {"alabama": "alabama"}
        rows = [
            {"team": "Alabama", "week": 3, "gameId": 3, "opponent": "Florida State", "offense": {"ppa": 0.2}, "defense": {"ppa": 0.1}},
            {"team": "Alabama", "week": 1, "gameId": 1, "opponent": "East Carolina", "offense": {"ppa": 0.4}, "defense": {"ppa": -0.05}},
        ]
        series = game_series(rows, index)
        self.assertEqual([game["week"] for game in series["alabama"]], [1, 3])
        self.assertEqual(series["alabama"][0]["offEpa"], 0.4)
        self.assertEqual(series["alabama"][0]["defEpa"], -0.05)


if __name__ == "__main__":
    unittest.main()
