# Session log

Newest entry on top. A few lines is enough: what we decided, what we changed, what is next.

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
