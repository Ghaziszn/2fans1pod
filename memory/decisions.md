# Decisions

Settled choices. Add a new one at the top. Do not delete old ones; mark them replaced if we change our mind.

## 2026-11-08 (current week)

- **The schedule row scrolls so the selected week is on screen.** On a phone, week 10 was selected but only weeks 1 through 3 were visible. Choosing another week scrolls that button into view too.

## 2026-11-08 (who got in)

- **When a pick changes the field, the sentence names who came in and who fell out.** Tennessee winning out says Tennessee is the 10th seed and Notre Dame fell out. A conference winner seeded 5th or lower still leads the sentence. If nobody new enters, the sentence stays on the last team in and the first team out.

## 2026-11-08 (long team names)

- **On a phone, the team name sits under the logo.** A long name such as Florida International stays on the page instead of pushing it sideways. From the small-tablet width up, the logo and the name sit in a row again.

## 2026-11-08 (favorite outline)

- **An outline is the favorite. A filled W or L is a pick you made.** Wins out fills the games it sets, because those are picks.

## 2026-11-08 (share link and footer)

- **The share step shows the link, and a shared link wins over the bracket saved on the device.** Copy still uses the clipboard when the browser allows it.
- **A social link stays hidden until its address is real.** Placeholder addresses are not shown in the footer.

## 2026-11-08 (rivalry search)

- **Search includes named rivalries.** Iron Bowl, Egg Bowl, and The Game open their matchup pages. A nickname such as bama still finds the team first. The next data build keeps these rows.

## 2026-11-08 (bracket site)

- **On a phone, the site line is about this game and the next line is about the next game.** A first-round upset says "This game is at Alabama." and "Next: Boise State plays Indiana." Later rounds say the bowl site is not chosen yet.

## 2026-11-08 (bracket out)

- **On a phone, the team that loses a playoff game is labeled Out.** The winner still says Moves on, or Champion in the title game. A top-four bye is still listed in the Byes line above the quarterfinals.

## 2026-11-08 (rivalry name either way)

- **The rivalry name shows no matter which team is on the left.** `/matchup/auburn-vs-alabama/` says Iron Bowl, same as `/matchup/alabama-vs-auburn/`. A pair that is not a named rivalry keeps the two school names.

## 2026-11-08 (rivalry links)

- **A link to a known rivalry uses that rivalry's page.** The schedule and team pages open the Iron Bowl and The Game, even when the home team is flipped. Any other pair keeps the game's home and away order.

## 2026-11-08 (played matchup)

- **A matchup that has already been played says who won.** Alabama vs Georgia says Georgia beat Alabama, 20–17, and that the line was Alabama -2.5. A future game still shows the consensus line. A pair with no game still says no line is posted.

## 2026-11-08 (standings ties)

- **When two teams share a conference record, the better overall record is listed first.** UTSA (7-1, 4-0) sits above North Texas (6-2, 4-0). If the overall records match too, the higher simulator rank is listed first. This is not an official tiebreaker.

## 2026-11-08 (team color on charts)

- **A light or black team color is mixed with the text color on charts.** Southern Miss gold stays visible on the beige bar track. App State black stays visible on the dark track. Alabama stays crimson.

## 2026-11-08 (game EPA list)

- **Each team page lists EPA game by game under the chart.** The line stays. The list names the opponent, so a phone can read it without hovering. It follows the garbage-time switch.

## 2026-11-08 (team schedule)

- **A played game on a team page says Win, Loss, or Tie.** The team's points come first. A game still to be played says Upcoming.

## 2026-11-08 (matchup names)

- **On a phone, a matchup label can use two lines.** “Florida International offense” stays whole. The numbers and the edge stay under the names.

## 2026-11-08 (kickoff windows)

- **Prime time runs from 5 PM until 9 PM Central.** That includes 8:00 and 8:30 kickoffs. Night starts at 9 PM. Afternoon ends when prime time starts.

## 2026-11-08 (advanced edge)

- **An advanced matchup row names the team with the better rank.** Green is that side. The rank already points the right way, including defense and havoc. Turning garbage time on still changes the numbers.

## 2026-11-08 (tap size)

- **A desktop bracket row is 44px tall.** The connecting lines still meet the middle of each team. The phone cards stay larger. The ranking drag handle and the copy-link button are 44px as well.

## 2026-11-08 (any matchup)

- **An unlisted pair opens the calculator on the local server.** The published site already does this through Vercel. Rivalry pages stay real pages. A name that is not a team still asks you to pick two teams.

## 2026-11-08 (search shortcut)

- **The search hint matches the keyboard.** A Mac shows ⌘K. Windows and Linux show Ctrl K. Either shortcut opens search.

## 2026-11-08 (phone bracket names)

- **A school name on the phone bracket wraps onto another line.** The desktop tree still uses one short row, because those rows are part of the connecting lines.

## 2026-11-08 (top 25 filter)

- **The schedule Top 25 button uses the committee list when one exists.** When that list is empty, it uses the first 25 teams in the site order, which is Elo. An empty committee list used to hide every game. The button still says Top 25.

## 2026-11-08 (contact send)

- **The contact form clears the fields only after the inbox accepts the note.** A missing key, a refused note, or a lost connection leaves what you typed. A hidden company field still pretends the note was sent and does not call the inbox.

## 2026-11-08 (rank gaps)

- **Rank-gap labels wrap onto a second line.** A name such as “Total yards per game (offense)” stays readable. The bars still fit the phone width.

## 2026-11-08 (team page on a phone)

- **A team’s schedule stacks on a narrow phone.** The week, the place, and the score sit on one line. The opponent’s name gets the next line, so it is not cut down to a few letters.
- **Rating cards are one column on a phone.** A label such as Returning production fits beside its help icon. Two columns start on a wider screen.

## 2026-11-08 (official bracket)

- **Once every regular-season game is played, the homepage opens on the bracket.** The sentence says it is the official field until you change a result. Changing a result still updates the sentence. While games remain, the page opens on the season step, as it does now.

## 2026-11-08 (help notes)

- **A help note stays on the screen.** The note opens under the icon, and slides left or up when it would run off the edge. Escape or a tap outside still closes it.

## 2026-11-08 (header fit)

- **The top bar fits a tablet.** From a tablet width up to a laptop, the links sit closer together and Search is an icon. On a wider screen the word Search and the ⌘K hint come back. A phone still uses the full-screen menu.

## 2026-11-08 (in and out)

- **On a phone, each playoff team’s reason sits under the school name.** A long reason such as Group of Six bid no longer cuts off the name. A wider screen keeps the reason on the same row.
- **The homepage browser tab reads “Playoff Simulator · 2fans1pod.”** The site name is part of that tab, same as the other pages.

## 2026-11-08 (empty poll)

- **A season with no committee poll can be published when the label says the order is Elo.** The data check still refuses an empty poll that is labeled as the committee. That keeps a broken download from replacing a real top 25.

## 2026-11-08 (search)

- **Search matches names and nicknames, not the small conference label on every team.** Typing SEC opens the conference. Typing bama still opens Alabama.

## 2026-11-08 (share titles)

- **Each page’s share title and description match that page.** A link to Alabama says Alabama, not only the site name. The picture stays the logo on the dark background.

## 2026-11-08 (schedule rows)

- **On a phone, a schedule game stacks the two teams.** The kickoff and the score sit on the first line. A wider screen keeps both teams on one row.

## 2026-11-08 (team ranks)

- **A team page lists national ranks as cards on a phone.** Offense and defense are both on the card. The table stays on a wider screen.

## 2026-11-08 (phone stats)

- **On a phone, each matchup stat is its own card.** Both teams and the edge are on the card. The wide table stays on a wider screen. The rank-gap chart fits the phone width.

## 2026-11-08 (no poll yet)

- **Before the committee releases a poll, the order is Elo and the page says so.** It does not call that list a committee ranking. When a poll exists, the rankings page names it and says when the data was checked. That checked date is not labeled as the poll date. The next data run includes the poll week in the name when College Football Data provides it.

## 2026-11-08 (any matchup)

- **A pair that is not a prebuilt rivalry still opens the calculator.** The site address keeps the trailing slash, so Vercel is told to serve the calculator shell for both `/matchup/some-pair` and `/matchup/some-pair/`. A rivalry page that was built ahead of time stays its own page.

## 2026-11-08 (title ties)

- **Three or more teams tied for a conference title ask who plays and who wins.** Until you pick, the higher-ranked tied team is used so the bracket can still be drawn. The page says it is not an official tiebreaker. Two teams still just play the projected game.

## 2026-11-08 (slot motion)

- **A team slides into a bracket slot when they arrive there.** The move is 180ms. Reduced motion skips it.
- **The team-page percentile bars grow from the left.** Same 180ms, and reduced motion skips that too.

## 2026-11-08 (ranking shuffle)

- **Dragging the list says “Ordered by you.”** Reset to formula puts the formula back in charge.
- **Simulate replays the last ranking shuffle.** It does not run a new scenario. The bracket is already using the current order. The button stays quiet until the order has moved once.

## 2026-11-08 (round buttons)

- **The phone round buttons stick just below the full header.** The header is taller than one row because of the garbage-time switch.

## 2026-11-08 (bowl sites)

- **Only the first round is at the higher seed’s home.** Quarterfinals, semifinals, and the title say the bowl site is not chosen.

## 2026-11-08 (phone round labels)

- **On a phone, a quarterfinal says Bye for seeds 1–4 and Advanced for the team that won a first-round game.** The 4-seed game is first, because that is the game the top first-round card feeds.

## 2026-11-08 (phone play)

- **On a phone, the bracket is one round at a time.** First, Quarters, Semis, and Title are buttons. Each team is a large tap. The wider screen still uses the connecting-line tree.

## 2026-11-08 (scoring offense)

- **Points per game on offense come from the scores in the schedule, same as points allowed.** The season feed left scoring offense blank.

## 2026-11-08 (neutral site)

- **A neutral-site game is labeled Neutral or vs, not Home or Away.** Army–Navy at MetLife is the remaining one.

## 2026-11-08 (phone bracket)

- **On a phone, the bracket is a vertical list: bye cards, then each game.** The connecting-line tree stays on wider screens.

## 2026-11-08 (title pick)

- **Wins out only writes the title-game winner when that team is one of the two teams playing.** A team outside the game keeps its own wins and leaves the championship pick you already made.

## 2026-11-08 (wins out)

- **Wins out means that team wins every remaining game, including a game against another team that also has wins out.** The team clicked later takes the shared game. A title-game pick for a team that is not in that game is ignored.

## 2026-11-08 (contender list)

- **The 8- and 5-team cap applies through week 5.** From week 6 on, every team that can still catch the conference leader is on the main list. The “Still alive” group is only for the early weeks.

## 2026-11-05 (title ties)

- **“Title is tied” only lists teams that share the best conference record, and only when three or more do.** A team a game back is not in that list. Two teams with the best record play the projected title game, and the higher rank wins it until the visitor flips that game. The row says Projected.

## 2026-11-05 (team page)

- **The free key is the one to keep using.** Weather stays skipped until the account is Tier 1.
- **SP+ schedule strength is blank** for 2025 and 2026. The field comes back, and every team is null, so it is not ranked and the card says not posted. The direction was not guessed.
- **FPI rank 1 is the strong end.** Schedule rank 1 is the hardest slate, remaining-schedule rank 1 is the hardest road left, and strength of record 1 is the most impressive record. Checked on this season: the SEC and Big Ten rank ahead of the MAC and Conference USA on all three.
- **The season file now says `cfbd`.** Red-zone percentages and defensive yards are still filled, and the build refuses to publish if either one drops below 120 teams. The games request's `division` parameter is ignored, so the script keeps a game only when one side is FBS.
- **The daily GitHub job is paused until this code is pushed.** The secret is stored in GitHub. The copy of the script already on GitHub would pull every division and replace the defensive numbers, so the scheduled job stays off.

## 2026-11-05

- **College Football Data key** lives only in `.env.local` and, for the daily job, in the GitHub secret `CFBD_API_KEY`. It is not written into the site or these notes.
- **The key on the account today is the free tier**, not Tier 1. Weather requests come back unauthorized. Advanced season stats do work.
- **Garbage time is excluded by default.** `?gt=1` includes it and the choice is remembered in the browser. Box-score totals always include every play.
- **Starting field position:** a lower number is better for the offense. Alabama's offense starts with about 67 yards to go, Kent State's with about 73. Defense wants the higher number.
- **The season file still says ESPN** for this step. Switching the whole season to CFBD would replace the red-zone and box-score defense numbers already on the site. That switch waits for a yes.

## 2026-11-04

- **Public betting splits** on the schedule come from the Cleatz college football board. Bet % is the share of tickets. Handle % is the share of dollars. The three markets are spread, moneyline, and total. This does not bring back the old VSIN scraper.

## 2026-11-03

- **Rivalry pages to prebuild:** a starter set Brandon can edit later in `config/rivalries.json`. Iron Bowl (Alabama-Auburn), Auburn-Georgia, Red River (Texas-Oklahoma), Michigan-Ohio State, Army-Navy, Oregon-Washington, Florida-Georgia, Texas-Texas A&M, USC-Notre Dame, Florida-Florida State, Florida State-Miami, Georgia-Georgia Tech, Egg Bowl (Ole Miss-Mississippi State), Clemson-South Carolina, BYU-Utah, Oregon-Oregon State, UCLA-USC, Pitt-West Virginia, Iowa-Iowa State, Indiana-Purdue, Minnesota-Wisconsin, Michigan-Michigan State, Alabama-Tennessee, Bedlam (Oklahoma-Oklahoma State), Alabama-LSU. Any other pair still works from the calculator.
- **Betting line for now:** show the consensus line only when the two teams are scheduled to play each other. Otherwise the row says no line is posted. Phase 4 adds our own model line on that row, in the same spirit as davidsasser.com. The model is not built in Phase 1.
- **Public address:** the free Vercel address until the site feels finished. A custom domain is later, and one config field updates share links and the sitemap.
- **Wins out includes a projected conference championship.** Regular-season games are applied first. If the real championship game is not on the schedule yet, the simulator adds a projected title game between the top two teams in that scenario. Ties for those two spots use the higher rank, and the page labels it a projection. Wins out wins that game only when the team is one of the two participants. Both participants share one chip, so they cannot both win it. The real championship game replaces the projection as soon as it is on the schedule. Official tiebreaker rules are still not coded.
- **December default:** once the real playoff field is set, the site opens on that official bracket. What-if picks still work on top of it.
- **Early-season cap, confirmed:** 8 teams per Power conference and 5 per Group of Six conference, with a “show the rest” row. Later weeks show everyone still alive and ignore the cap.
- **Site name in the header:** `2fans1pod`. Browser tab titles use the same spelling. No spaced “2 Fans 1 Pod.”
- **Memory files are committed.** `PLAN.md`, `task.md`, `AGENTS.md`, and `memory/` go into Git with the code so a future session can read them. Still no secrets in those files.
- **GitHub repo, when we build:** new public repository named `2fans1pod` under the account `Ghaziszn`. Not created yet. Wait until Brandon says to build.
- **CFBD API key:** Brandon already has one. He will paste it into a local `.env` file himself when the data script needs it. Never ask him to paste the key in chat. Never commit it.
- **Memory files live in the repo.** `PLAN.md` is the product plan. `task.md` is the to-do list. `memory/` holds decisions, open questions, and the session log. `AGENTS.md` tells a future session to read those first.
- **The homepage is a rest-of-season what-if.** Every remaining game has a winner. Untouched games go to the higher-ranked team. The bracket, the ranking, and a one-sentence who’s-in / who’s-out answer update as soon as a result changes. Visitors can also drag rankings and play the bracket through the championship.
- **Who appears on the first screen.** Top 25, the bubble through 30, and anyone who can still tie or pass their conference leader. In September each Power conference shows at most 8 of those teams, with a “show the rest” row. Each Group of Six conference shows at most 5, same idea. Every other game is still pickable in a collapsed list.
- **Teams outside the CFP top 25** are ordered by CFBD Elo. The page says so.
- **Ranking formula v1.** One pass from the starting order. Each future loss costs 4 spots (`lossDropSpots` in config). A loss to a worse-ranked team drops you behind that team’s starting rank. Conference champs get no extra boost until that number is changed. The champion is whoever the scenario gives the best conference record; ties ask the visitor to pick. No tiebreaker code.
- **Automatic qualifiers ranked outside the top 12** seed at the bottom. This is a switch in `config/cfp-format.json`, on by default.
- **Notre Dame** is automatic only if ranked in the top 12, which leaves 6 at-large spots. **UConn** does not get that rule.
- **Bowl sites** are explained in one sentence and not built in v1.
- **Contact form** uses Web3Forms on the free tier, with a honeypot. Formspree is the backup if we outgrow it.
- **New public GitHub repo** named `2fans1pod`. The old Flask repo stays as a reference. Do not port the VSIN scraper.
- **Logo** comes from the old repo. Accent color is sampled from it before pages are styled. Team colors are stripes and bars only.
- **No database, no backend, no accounts, no analytics in Phase 1.** Static Next.js on Vercel’s free plan. Data is JSON committed by a GitHub Action. API keys stay in `.env` and GitHub Secrets.
- **Build pace.** One step at a time, with an explanation and a pause before the next step.
