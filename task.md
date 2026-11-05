# Tasks

This is the working to-do list for 2fans1pod. The full reasoning lives in [PLAN.md](PLAN.md).

How we use this file:

- Work down **Now**. The full Phase 1 build stays in progress until this list is empty.
- Check an item by changing `[ ]` to `[x]` and adding the date.
- If a task splits or a new one appears, add it here the same day.
- Finished groups move under **Done** so the top of the file stays short.

## Now

The full Phase 1 build is in progress. Keep going through this list.

- [ ] Keep the site on a lasting Vercel address. The temporary preview from 2026-11-03 has expired. The static export in `out/` has 186 pages. Log in with `npx vercel login`, then deploy again so the project can use https://2fans1pod.vercel.app.

## Later, do not build yet

- [ ] Phase 2: advanced stats, multi-year recruiting, multi-year transfer portal, Coaching Power Index from the Excel file.
- [ ] Phase 3: news feed. Bots may only open pull requests that edit `content/news/`. Scores stay in the data scripts.
- [ ] Phase 4: your own prediction model, published as JSON.
- [ ] Branch protection on `main`: pull requests required, force-push blocked, bypass only for the data-update Action.
- [ ] Custom domain, when you have one. One field in config updates the share links and sitemap.

## Done

- [x] 2026-11-03 — Write the Phase 1 plan, including the rest-of-season simulator.
- [x] 2026-11-03 — Save the plan and the memory files in the project. No site code yet.
- [x] 2026-11-03 — Public repo, app shell, homepage simulator, and the ESPN season JSON for 138 teams.
- [x] 2026-11-03 — Matchup calculator, team pages, conference pages, rankings, contact form, sitemap, and robots. Static build generated 185 pages.
- [x] 2026-11-03 — JSON schemas checked by the validator, and a red-zone parser test that reads saved HTML.
- [x] 2026-11-03 — Closing lines on all 623 finished games, plus an against-the-spread record for every FBS team. Ranking and bracket motion is 180ms and turns off for reduced motion.
- [x] 2026-11-03 — Browser check: simulator pick changes the sentence and share link, “bama” finds Alabama, Iron Bowl and Texas–BYU both open, contact shows the missing-key error and the honeypot success. Phone, 700px, tablet, and wide layouts, in light and dark.
- [x] 2026-11-04 — Schedule tab lists every game by week, with logos, scores or lines, and a matchup link.
- [x] 2026-11-05 — Advanced stats from College Football Data, stored with and without garbage time. The header switch defaults to excluded.
- [x] 2026-11-05 — Team page ratings, schedule-strength card, percentile bars, EPA scatter, and game EPA line. Season file switched to College Football Data without dropping red zone or defensive yards.
- [x] 2026-11-03 — Logos and team colors on the bracket and scenario. Green for the better stat, red for the worse. Defensive yards filled from 623 box scores. A Miami loss writes the share link and drops Miami to the 8th seed. Phone width keeps the menu and the W/L rows.
