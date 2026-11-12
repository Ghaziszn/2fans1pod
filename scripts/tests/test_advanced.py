import unittest

from scripts.build_advanced import METRICS, build_side, combine, metric_value
from scripts.cfbd import BudgetStop


def row(name: str, offense_ppa: float, defense_ppa: float) -> dict:
    offense = {"ppa": offense_ppa, "successRate": 0.5, "explosiveness": 1, "stuffRate": 0.2, "lineYards": 3, "pointsPerOpportunity": 4, "havoc": {"total": 0.1}, "fieldPosition": {"averageStart": 70}, "standardDowns": {"ppa": 0.1}, "passingDowns": {"ppa": 0.2}, "rushingPlays": {"ppa": 0.1}, "passingPlays": {"ppa": 0.2}}
    defense = {"ppa": defense_ppa, "successRate": 0.4, "explosiveness": 1, "stuffRate": 0.2, "lineYards": 2, "pointsPerOpportunity": 3, "havoc": {"total": 0.2}, "fieldPosition": {"averageStart": 75}, "standardDowns": {"ppa": 0}, "passingDowns": {"ppa": 0}, "rushingPlays": {"ppa": 0}, "passingPlays": {"ppa": 0}}
    return {"team": name, "offense": offense, "defense": defense}


class AdvancedBuildTests(unittest.TestCase):
    def test_rates_become_percents_and_epa_stays_a_decimal(self):
        side = row("Alabama", 0.25, -0.01)["offense"]
        by_key = {metric["key"]: metric for metric in METRICS}
        self.assertAlmostEqual(metric_value(side, by_key["successRate"]), 50)
        self.assertAlmostEqual(metric_value(side, by_key["ppa"]), 0.25)

    def test_better_offense_epa_ranks_first_and_copies_stay_separate(self):
        teams = [{"id": "alabama", "school": "Alabama"}, {"id": "kent-state", "school": "Kent State"}]
        index = {"alabama": "alabama", "kent state": "kent-state", "kent-state": "kent-state"}
        no_gt, missed = build_side([row("Alabama", 0.3, 0.1), row("Kent State", -0.1, 0.2)], index)
        with_gt, _ = build_side([row("Alabama", 0.1, 0.2), row("Kent State", 0.4, -0.2)], index)
        self.assertEqual(missed, [])
        self.assertEqual(no_gt["alabama"]["offense"]["ppa"]["rank"], 1)
        self.assertEqual(no_gt["kent-state"]["offense"]["ppa"]["rank"], 2)
        combined = combine(no_gt, with_gt)
        self.assertEqual(combined["alabama"]["noGT"]["offense"]["ppa"]["rank"], 1)
        self.assertEqual(combined["alabama"]["withGT"]["offense"]["ppa"]["rank"], 2)

    def test_defense_epa_ranks_the_lower_number_first(self):
        index = {"alabama": "alabama", "kent state": "kent-state"}
        built, _ = build_side([row("Alabama", 0.2, -0.05), row("Kent State", 0.1, 0.2)], index)
        self.assertEqual(built["alabama"]["defense"]["ppa"]["rank"], 1)
        self.assertEqual(built["kent-state"]["defense"]["ppa"]["rank"], 2)

    def test_budget_stop_is_an_error_not_a_silent_fallback(self):
        self.assertTrue(issubclass(BudgetStop, SystemExit))


if __name__ == "__main__":
    unittest.main()
