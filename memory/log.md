# Session log

Newest entry on top. A few lines is enough: what we decided, what we changed, what is next.

## 2026-11-08 (standings ties)

- Conference pages broke ties by the order in the file. The American page listed North Texas (6-2, 4-0) above UTSA (7-1, 4-0). The ACC listed Louisville (5-3, 4-2) above SMU (6-2, 4-2). The same conference record now keeps the better overall record first. Checked the American and ACC pages at 320px.

## 2026-11-08 (team color on charts)

- Southern Miss gold was nearly the same color as the light bar track. The bars, the offense line, and the team's scatter dot now mix the team color with the text color. In light mode that gold becomes a darker gold. In dark mode App State's black bar becomes a gray you can see on the dark track. Alabama's bar stays crimson.

## 2026-11-08 (game EPA list)

- Alabama's page now lists Week 6 vs Georgia as offense 0.202 and defense 0.227. Turning garbage time on changes Week 1 vs East Carolina from 0.364 to 0.240 on offense. Checked at 320px. The page does not scroll sideways.

## 2026-11-08 (team schedule)

- Alabama's schedule now says Loss 17–20 for Georgia and Win 48–10 for East Carolina. LSU, still to be played, says Upcoming. Checked at 320px and on a wide screen. The page does not scroll sideways.

## 2026-11-08 (matchup names)

- On a 320px screen, “Florida International offense” and “Jacksonville State defense” were cut off in the matchup cards. They now wrap onto a second line. Nothing scrolls sideways, and the edge is still named.

## 2026-11-08 (kickoff windows)

- The schedule menu now says prime time is 5 PM until 9, and afternoon is noon until 5. Week 10 prime time is 26 games, including Boise State at 5:00, New Mexico at Nevada at 8:00, and West Virginia at Texas Tech at 8:30. Night is the 3 games at 9:15 and 9:30, including TCU at Arizona.

## 2026-11-08 (advanced edge)

- The Iron Bowl advanced table now says who has the better rank. Alabama leads EPA per play on offense, 0.257 (#18) to Auburn’s 0.108 (#83). Auburn leads explosiveness on defense, #43 to #115. Turning garbage time on changes Alabama’s offensive EPA from 0.257 to 0.246. On a phone the same explosiveness card says Auburn, and the names are not cut off.

## 2026-11-08 (tap size)

- Desktop bracket rows are now 44px. The line between UCLA and Ohio State still meets the middle of each name. The page does not scroll sideways at 1400px wide. On a phone the cards stay 64px, and tapping Boise State still sends them on to play Indiana. The drag handle and Copy link are 44px.

## 2026-11-08 (any matchup)

- Picking Wake Forest and Navy on the matchup page opened that pair and said no line is posted. TCU vs Arizona showed Arizona -7.5. The Iron Bowl page still marks the game. A static build still writes 186 pages, and TCU vs Arizona is not one of the prebuilt files.

## 2026-11-08 (search and phone names)

- The search button now says Ctrl K on Windows and Linux, and ⌘K on a Mac. On a 1024px screen the header still fits, Ctrl+K opened the search box, and Escape closed it.
- Phone bracket names wrap instead of ending in an ellipsis. Florida International still fits on one line at 320px wide. Tapping Boise State in the first round sent them on to play Indiana.

## 2026-11-08 (top 25 filter)

- Before a committee poll exists, the schedule Top 25 button now uses the first 25 teams in the Elo order, so an August week is not empty. With this week's poll, week 10 still shows 16 games, including TCU at Arizona, and hides Ohio at Akron.

## 2026-11-08 (contact send)

- Sending used to clear the form after the request, but the page had already dropped its handle, so a successful note could be reported as a failure. The form now keeps its own handle and clears only when the inbox says yes. Five unit tests passed. In the browser, a missing key still says the form is not connected and leaves the name in the box. A filled company field still says “Message sent.”

## 2026-11-08 (rank gaps)

- The Iron Bowl chart now shows the full “Total yards per game (offense)” label on two lines. Checked at 320, 390, and 1280. None of the 23 labels run off the left edge or into the next label. The page does not scroll sideways. All 23 bars are still drawn.

## 2026-11-08 (team page on a phone)

- At 320px, Mississippi State’s opponents were squeezed to about 23px wide. UL Monroe now reads in full, and the page does not scroll sideways. Returning production fits on its card. At 768px the schedule is one row again and the ratings go back to two columns.

## 2026-11-08 (official bracket)

- A finished regular season now opens on the bracket and says “This is the official field.” A changed result drops that sentence. The unit test covers both. This week’s live page still opens on step 1, Season, with Boise State as the 12th seed. The bracket is not on that first screen.

## 2026-11-08 (help notes)

- Opened every help note on Alabama’s phone page. All 36 stayed inside the screen, including FPI on the right-hand card. The rankings note on the simulator stayed inside too. A tap outside closed it, and Escape closed it. On a wide Iron Bowl page the schedule-strength note opened beside the label.

## 2026-11-08 (header fit)

- At 768px the header was about 130px wider than the screen, so the theme button sat off the right edge. The links now sit closer together there, and Search is an icon until 1024px, where the word Search and ⌘K return. Checked 390, 768, 900, and 1024. The icon still opens search. The phone menu still lists every page. Nothing scrolls sideways.

## 2026-11-08 (in and out)

- On a phone, Boise State’s name was cut off by “Group of Six bid.” The reason now sits under the school. All 12 names fit, and the page does not scroll sideways. A wide screen still keeps the reason beside the name. The homepage tab now says Playoff Simulator · 2fans1pod.

## 2026-11-08 (empty poll)

- The data check now accepts an empty committee list when the season file says the order is Elo. It still rejects an empty list that claims to be the committee. The live files still have 25 ranked teams. The Python tests passed, including that case.

## 2026-11-08 (search)

- Ctrl+K opened search. “bama” listed Alabama first. “sec” listed the SEC conference first, instead of every SEC team.

## 2026-11-08 (share titles)

- Alabama, the Iron Bowl, the rankings, the schedule, contact, and the SEC page each now put their own title and description on the share tags. The share picture is still the logo.

## 2026-11-08 (schedule rows)

- Week 10 on a phone reads 6:00 PM, 28–20, Ohio, at, Akron. None of the visible school names are cut off. A wide screen still shows the game on one row.

## 2026-11-08 (team ranks)

- Alabama’s national ranks on a phone show points per game as offense 38.2 (#12) and defense 21.2 (#44) on one card. The page does not scroll sideways. A wide screen still shows the table.

## 2026-11-08 (phone stats)

- The Iron Bowl on a phone shows stat cards instead of a sideways table. One card reads FPI schedule rank, Alabama #7, Auburn #2, edge Auburn. The page does not scroll sideways. A wide screen still shows the table.

## 2026-11-08 (no poll yet)

- The rankings page now says the top 25 is the committee poll and that the data was checked on 2026-11-05. Miami is still first. The homepage still says teams outside the top 25 use Elo, because a poll is published. The empty-poll sentence is covered by a unit test.

## 2026-11-08 (any matchup)

- `/matchup/wake-forest-vs-navy/` is not a prebuilt rivalry. It opened as Wake Forest vs Navy. The Iron Bowl page still opened under its own name.

## 2026-11-08 (title ties)

- The MAC is tied four ways. The page named Toledo, Western Michigan, Ohio, and Buffalo, and used Toledo until a pick. Choosing Toledo against Ohio, with Ohio winning, showed that projected game and marked the loss.

## 2026-11-08 (slot motion)

- Picking Ohio State in the first round put them in the quarterfinal, and that row slid in from the right. With reduced motion on, the same pick changed the slot and did not slide. Alabama’s percentile bars use a 180ms grow.

## 2026-11-08 (ranking shuffle)

- The rankings list now says “Ordered by you” after a drag or a nudge. Simulate replays that shuffle. On a fresh visit the button is quiet. After moving Georgia and Miami, the replay slid them back into the new order.

## 2026-11-08 (round buttons)

- The First / Quarters / Semis / Title buttons were sliding 10 pixels under the header. They now sit flush under it, and the title game stays below the buttons.

## 2026-11-08 (bowl sites)

- A quarterfinal was labeled as if it were at a team’s stadium. The first round still says “at Alabama.” The quarterfinal and the title now say “Bowl site not chosen.”

## 2026-11-08 (phone round labels)

- Tapping Boise State now says they play Indiana. The next round opens on that game: Indiana is the bye and still the favorite, and Boise State is marked Advanced. A shared link still beats the scenario saved on the device.

## 2026-11-08 (phone play)

- A phone now plays one round at a time. First round shows four games. Tapping Boise State says they play Indiana. Quarters shows Boise State in that game. The title card names the champion. A wide window still shows the tree.

## 2026-11-08 (scoring offense)

- Every team's scoring offense was blank. It is now the average of the scores already on the schedule. Alabama's page shows 38.2 points per game, 12th, next to 21.2 allowed, 44th.

## 2026-11-08 (neutral site)

- Army–Navy was marked Away. The Army page now says Neutral for Week 15, TCU’s Dublin game says Neutral, and Army’s simulator row says Neutral next to Navy.

## 2026-11-08 (phone bracket)

- A phone was still a sideways tree. It is now a list: Miami, Georgia, Utah, and Indiana show as byes, then each game is a card. Tapping Boise State carried them to the title. Tapping the first-round favorite again put Miami back on top. A wide window still shows the tree.

## 2026-11-08 (title pick)

- Winning out with Alabama was erasing a Kentucky win in the projected SEC title. Kentucky still shows W after Alabama wins out, and Georgia shows L. The every-other-game list now uses the same winner as the simulator.

## 2026-11-08 (wins out)

- If Alabama and Auburn both won out, the higher rank kept the Iron Bowl. The team clicked later now wins that game. Auburn’s row shows W and Alabama’s shows L.

## 2026-11-08 (kickoff time)

- Future games with no kickoff were stored as 05:00 UTC. The schedule treated that as 11 PM the night before. Those games now say TBD and stay on the date in the feed.

## 2026-11-08 (any matchup)

- A pair that is not a saved rivalry page was showing the first two teams, then jumping to the names in the address. It now waits and opens the pair from the address. A missing page still says it was not found.

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
