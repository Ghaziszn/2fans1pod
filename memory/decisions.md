# Decisions

Settled choices. Add a new one at the top. Do not delete old ones; mark them replaced if we change our mind.

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
