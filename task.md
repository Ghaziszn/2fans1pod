# Tasks

This is the working to-do list for 2fans1pod. The full reasoning lives in [PLAN.md](PLAN.md).

How we use this file:

- Do the first unchecked item under **Now**. Then stop and explain it before the next one.
- Check an item by changing `[ ]` to `[x]` and adding the date.
- If a task splits or a new one appears, add it here the same day.
- Finished groups move under **Done** so the top of the file stays short.

## Now

The site code has not been started. Next step is only the first item, after you say to build.

- [ ] Create the public GitHub repo, `.gitignore`, and `.env.example`. Pause and explain.
- [ ] Create the Next.js app shell: header, footer, light/dark theme, empty homepage. Pause and explain.
- [ ] Deploy that empty shell to Vercel’s free plan. Pause and explain.
- [ ] Write the first Python data script and commit the first real JSON files. Pause and explain.

## Phase 1, after the shell is live

- [ ] Design system: two fonts, spacing, light and dark colors, accent color from the logo, motion that respects reduced motion, tap-to-open help icons.
- [ ] Data pipeline: CFBD fetch, logos, Elo, lines, ATS, red-zone scrape, strength of schedule, national ranks, JSON schemas, validation, GitHub Action that commits only valid JSON.
- [ ] Playoff simulator: rest-of-season what-if, contender chips, Wins out, every other game still pickable, live bracket, In/Out sentence, champion follows results, drag-and-drop with up/down buttons, playoff play-through, share links, tests.
- [ ] Matchup calculator: precomputed national ranks, offense-vs-defense view, one chart, helper icons, pretty share URLs, rewrite for pairs we did not prebuild.
- [ ] SEO pages and search: every FBS team, every conference, CFP rankings this week, sitemap, robots.txt, structured data, fuzzy search, Cmd/Ctrl+K.
- [ ] Contact page: Web3Forms, honeypot, clear success and error messages.
- [ ] Browser check on a phone width, a foldable width, a tablet, a laptop, and a wide desktop, in light and dark.

## Later, do not build yet

- [ ] Phase 2: advanced stats, multi-year recruiting, multi-year transfer portal, Coaching Power Index from the Excel file.
- [ ] Phase 3: news feed. Bots may only open pull requests that edit `content/news/`. Scores stay in the data scripts.
- [ ] Phase 4: your own prediction model, published as JSON.
- [ ] Branch protection on `main`: pull requests required, force-push blocked, bypass only for the data-update Action.
- [ ] Custom domain, when you have one. One field in config updates the share links and sitemap.

## Done

- [x] 2026-11-03 — Write the Phase 1 plan, including the rest-of-season simulator.
- [x] 2026-11-03 — Save the plan and the memory files in the project. No site code yet.
