import unittest

from scripts.fetch_splits import attach, norm, parse_board, team_index

PAGE = """
<article class="cfbv2-game" data-cfbv2-date="2026-11-05">
  <details><summary>Full Game Intelligence — UTSA at Florida Atlantic</summary>
    <h3>UTSA at Florida Atlantic</h3>
    <p>Splits updated Nov. 4, 8:10 PM EST</p>
    <section><h4>Spread</h4>
      <div><strong>UTSA -7</strong><b>22%</b><b>51%</b></div>
      <div><strong>Florida Atlantic +7</strong><b>78%</b><b>49%</b></div>
    </section>
    <section><h4>Total</h4>
      <div><strong>Over 72.5</strong><b>62%</b><b>24%</b></div>
      <div><strong>Under 72.5</strong><b>38%</b><b>76%</b></div>
    </section>
    <section><h4>Moneyline</h4>
      <div><strong>UTSA</strong><b>85%</b><b>73%</b></div>
      <div><strong>Florida Atlantic</strong><b>15%</b><b>27%</b></div>
    </section>
  </details>
</article>
"""


class SplitParseTests(unittest.TestCase):
    def test_reads_bet_and_handle_for_each_market(self):
        label, board = parse_board(PAGE)
        self.assertEqual(label, "Nov. 4, 8:10 PM EST")
        self.assertEqual(board[0]["away"], "UTSA")
        self.assertEqual(board[0]["spread"]["sides"][0], {"label": "UTSA -7", "bet": 22, "handle": 51})
        self.assertEqual(board[0]["total"]["sides"][1]["handle"], 76)
        self.assertEqual(board[0]["moneyline"]["sides"][1]["bet"], 15)

    def test_matches_a_game_even_when_the_utc_date_rolls_over(self):
        _, board = parse_board(PAGE)
        teams = [{"id": "utsa", "school": "UTSA", "abbreviation": "UTSA", "alternateNames": []}, {"id": "florida-atlantic", "school": "Florida Atlantic", "abbreviation": "FAU", "alternateNames": []}]
        games = [
            {
                "id": "old",
                "seasonType": "regular",
                "awayId": "utsa",
                "homeId": "florida-atlantic",
                "startDate": "2026-09-01T00:00:00Z",
            },
            {
                "id": "this-week",
                "seasonType": "regular",
                "awayId": "utsa",
                "homeId": "florida-atlantic",
                "startDate": "2026-11-06T00:30:00Z",
            },
        ]
        matched, missed = attach(board, games, team_index(teams, {}))
        self.assertEqual(missed, [])
        self.assertIn("this-week", matched)
        self.assertNotIn("old", matched)

    def test_normalizes_punctuation(self):
        self.assertEqual(norm("Texas A&M"), "texas a and m")


if __name__ == "__main__":
    unittest.main()
