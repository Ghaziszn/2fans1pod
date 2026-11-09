# Decisions

Settled choices. Add a new one at the top. Do not delete old ones; mark them replaced if we change our mind.

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
