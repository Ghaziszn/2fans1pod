# Session log

Newest entry on top. A few lines is enough: what we decided, what we changed, what is next.

## 2026-11-08 (contender list)

- Week 10 was still hiding teams who can win their league, behind a September cap. From week 6 on, those teams are on the main list. Illinois is back on the Big Ten list.

## 2026-11-08 (rank gaps)

- The matchup rank-gap chart was one short box, so the stat names sat on top of each other. Each stat now has its own row. On the Iron Bowl, Alabama’s better ranks go right in green and Auburn’s go left in red. A phone can scroll the chart sideways.

## 2026-11-06 (unblock the pull request)

- Brought this branch up to date with main. The only new commit on main was the 2026-11-04 ESPN season update, and it conflicted in four data files.
- Kept this branch's College Football Data versions of games, rankings, season, and team stats. No application code conflicted.
- The daily data job stays turned off until this pull request is on main. The lasting Vercel address still needs `npx vercel login`.

## 2026-11-05 (title ties)

- A clear conference leader was lumped in with the teams tied for second, so the page asked who won a title that was not tied. The question now stays on a real three-or-more tie. The made-up title game is labeled Projected.

## 2026-11-05 (phone menu)

- Under 768px the nav is a full-screen list. The header blur was trapping that list inside the bar, so the menu now sits beside the header and covers the page. Tapping Schedule closes it. At a wide width the text links return.

## 2026-11-05 (check)

- Browser check on the current season: Ole Miss wins out rewrote the sentence and the share link. Search for “bama” opened Alabama. The Iron Bowl title is still Iron Bowl. A filled contact form shows the missing Web3Forms key message.

## 2026-11-05 (export)

- Rebuilt the static site. 186 pages exported, including Alabama's ratings and the schedule. 10 playoff tests and 24 Python tests passed. Vercel CLI is still logged out, so the lasting address is unchanged.

## 2026-11-05 (team page)

- Team pages now show SP+, SRS, FPI, talent, returning production, and the head coach, plus percentile bars, an EPA scatter, and a game-by-game EPA line. The garbage-time switch moves the charts. SP+ schedule strength is blank in the feed, so that card says not posted. FPI rank 1 was checked as the hardest schedule.
- The season file now says College Football Data. Alabama's defensive yards stayed 330.4 and red zone stayed 88.2. 138 teams kept both. The games feed was filtered to FBS sides because `division` is ignored.
- The GitHub secret is stored. The daily job is paused so the older script on GitHub cannot replace these files before this code is pushed.

## 2026-11-04 (schedule)

- Added a Schedule tab. It opens on the current week and lists every game that week, grouped by day, with logos, the score or the line, and a link to the matchup. Filters: Top 25, one conference, and a kickoff window. They stack.
- The bracket step now says seeds 1–4 pick bowl sites later. The tree still shows pairings only. Existing tests passed: 9 Vitest, 11 Python.
- Each filled playoff game has a link under the tree that opens the matchup calculator. Tapping a team in the tree still picks the winner.
- A matchup that is not a prebuilt rivalry now titles the page with the two schools. Texas vs New Mexico shows that heading and tab title. The Iron Bowl page still uses its rivalry name.
- A static export finished with 186 pages, including /schedule/. The local preview on port 3000 stayed up. The export was written beside it, then copied into out/.
- Prime time on the schedule now includes 8:00 and 8:30 PM kickoffs. The night menu says “9 PM and later.” Week 10 prime time includes New Mexico at Nevada at 8:00 PM. Night is the 9:15 and 9:30 games.
- Rebuilt the static export after that label change. 186 pages again, and the preview on port 3000 came back after a brief error during the build.
- Every other game skips unnamed bowls and placeholder opponents such as “TBD at Washington State.” Real remaining games, including FCS opponents, stay. Opened that list in the browser: weeks 10–13, and flipping Florida State wrote the share link.
- The ranking what-if now uses regular-season games only. A postseason loss does not move a team. 10 playoff tests passed.
- Schedule rows for the current Cleatz board show bet % and handle % for the spread, moneyline, and total. 49 games matched. A small parser test passed.
- 2026-11-05 — CFBD advanced stats are saved twice, with and without garbage time. The header switch defaults to excluded. The account is the free tier, so weather is still locked.

## 2026-11-04 (share picture)

- Share now saves a picture of the whole bracket, both sides and the championship, and Download saves that same PNG.
- The shared picture now has a small 2fans1pod logo and name in the bottom right, clear of the teams.

## 2026-11-04 (bracket tree)

- Replaced the bracket drawing. It is one tree at every width: first-round games on the outside, elbow lines into the quarterfinals, semifinals, and a championship in the center. Each team is one short row. A phone scrolls the same tree sideways.
- Picking Boise State sends them into Alabama’s quarterfinal. The lasting Vercel address is still waiting on `npx vercel login`.
- Existing tests passed after the two-sided bracket: 9 Vitest playoff tests and 11 Python tests.

## 2026-11-03 (vercel and bracket)

- `npx vercel whoami` still says logged out. The lasting https://2fans1pod.vercel.app address stays blocked until Brandon runs `npx vercel login`. No deploy was started.
- The wide bracket is already a connected tree with lines, logos, seeds, and school colors. At 390px the rounds stay a vertical list of cards. The layout was left as it is.
- The contact form, with no Web3Forms key, shows “The form is not connected yet” and does not send.

## 2026-11-03 (check)

- Rechecked the three-step simulator. Vitest still has 9 passing playoff tests. The Python checks still pass: 11 tests, 138 teams, 950 games, 25 ranked teams.
- Wins out on Wake Forest alone changes the sentence, the in/out strip, and the bracket: Wake Forest is the 11th seed. A Boston College win under Every other game is stored as a season pick. Advancing Boise State, then switching the 5–12 game to Texas, clears the later quarterfinal pick. Opening that share link with saved storage cleared restores the season pick, the wins-out, and the bracket pick. Search for “bama” opens the Alabama page.
- Nothing in the code needed a fix. A lasting Vercel address still needs `npx vercel login`.

## 2026-11-03 (visual pass)

- Bracket sits at the top, with logos and each team’s color. The scenario is a conference dropdown, then a team, then that team’s remaining games with W and L.
- Matchup rows color the better rank green and the worse rank red. Team headers use the school color and logo.
- Defensive yards, passing, rushing, and down conversions are now filled from all 623 finished box scores. Alabama allows 330.4 yards a game, ranked 40th.
- Team pages, rankings, and conference standings use the same logo and color mark. A production build exported 185 pages. The local site is on http://localhost:3000. A lasting Vercel address still needs `npx vercel login`.
- The simulator is now three steps: build the season, play a connected bracket, then Share. On a wide screen the bracket is a tree with logos and colors. On a phone the rounds stay stacked cards. A Boise State first-round pick is stored in the share link. The Share button says Copied after the link is copied. This browser has no Web Share menu.

## 2026-11-03 (pages)

- Added the matchup calculator, team pages, conference pages, CFP rankings, contact form, sitemap, robots, and the default share image.
- Rivalry pages are real HTML for all 25 pairs. Other pairs use the `/matchup/` shell plus the Vercel rewrite.
- Fonts are Barlow Condensed and IBM Plex Sans, loaded by Next so the browser does not call Google at view time.
- Vitest still passes: 9 playoff tests. The static `next build` is the check that every generated page compiles.
- JSON schemas now gate the data publish, and the red-zone parser is tested on a saved HTML table. Nine Python tests pass.
- Closing lines are saved for all 623 finished games. Every team now has an against-the-spread record. UCLA is 8-0 against the number in this file.
- Browser pass covered the simulator, search, both kinds of matchup, the contact form, phone through wide layouts, and light and dark.
- Anonymous Vercel preview is live at https://spry-fiddle-w4bo5m1.tmp.now and returned the Playoff Simulator page. It expires in about an hour. Claim it at https://vercel.com/claim-deployment?code=5e17aeab-abe4-45cb-be37-ca2ee6c01fbb
- The CLI is logged out, so the lasting https://2fans1pod.vercel.app address is not created yet. The latest code is still local and not pushed.

## 2026-11-03 (build checkpoint)

- App shell is in place: layout, header, footer, theme, search, and the homepage simulator.
- Season data is built for 138 FBS teams from ESPN because no `CFBD_API_KEY` was on this machine. Elo outside the top 25 is computed from results.
- Sun Belt division names now roll up to Sun Belt.
- Still to build: matchup calculator, team and conference pages, rankings page, contact form, sitemap, and the Vercel deploy.
- Tests already written: `npm test` for the playoff rules, `python -m unittest scripts.tests.test_compute` for strength of schedule.

## 2026-11-03

- Wrote the Phase 1 plan: static Next.js site, playoff simulator, matchup calculator, team and conference pages, free data pipeline.
- Changed the simulator into a rest-of-season what-if. Favorites win untouched games. Contenders are on the first screen. Every other game is still pickable. The bracket updates live.
- Saved the plan in the project as `PLAN.md`.
- Started the memory files: `task.md`, `memory/decisions.md`, `memory/open-questions.md`, this log, and `AGENTS.md`.
- No application code yet. Next, when Brandon says to build: GitHub repo, ignore rules, and `.env.example` only, then pause.
- Brandon confirmed: public repo `2fans1pod` under `Ghaziszn`, and he already has a CFBD API key. He will put the key in `.env` himself. The key was not pasted in chat.
- Header name is `2fans1pod`. The memory files will be committed with the code.
- Early-season board cap stays 8 Power / 5 Group of Six. In December the site opens on the official field, and what-ifs still work on top.
- Wins out includes a projected conference championship between the scenario’s top two, until the real game is scheduled. The first deploy uses the free Vercel address.
- Matchup lines for now are the sportsbook consensus, and only when the two teams play each other. A model line waits for Phase 4.
- Rivalry pages will use a starter set of 25 famous matchups, editable later. Any other pair still opens in the calculator.
