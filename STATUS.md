# Where 2fans1pod is

This file is a handoff. It tells a new agent what is already built, what is still open, and what not to redo. The product plan is [PLAN.md](PLAN.md). The to-do list is [task.md](task.md). Settled choices are in [memory/decisions.md](memory/decisions.md). Do not reopen a choice in that file unless Brandon asks.

Last updated: November 12, 2026 (Eastern).

## In one paragraph

Phase 1 is built and runs as a static Next.js site. The code is on an open pull request. It is not merged to `main`, and it is not on the lasting public address yet. Do not scaffold a new app. Do not start Phase 2, 3, or 4.

## Repo and pull request

- GitHub: `Ghaziszn/2fans1pod`
- Pull request: https://github.com/Ghaziszn/2fans1pod/pull/1
- Branch: `cursor/cloud-agent-1793903572936-j6wl0`
- Base branch: `main`
- `main` is behind this branch. This branch has the College Football Data season. `main` still has an older ESPN-based season in four data files.

## What Phase 1 already includes

- Design system: Barlow Condensed and IBM Plex Sans, light and dark themes, orange accent `#ef7516` in [config/site.json](config/site.json), 44px tap targets, 180ms motion that turns off when the device asks for reduced motion.
- Homepage playoff simulator: rest-of-season what-if, favorites win untouched games, conference and team picker, wins out, title ties, ranking list with drag and up/down buttons, phone bracket one round at a time, desktop bracket tree, share link, and a share picture.
- Schedule page, matchup calculator, 138 team pages, conference pages, rankings page, search, contact form, sitemap, and robots.
- Season data from College Football Data for 2026. 138 FBS teams. The saved file says week 10 and was written November 5, 2026. Advanced stats are stored with and without garbage time. The header switch defaults to excluded. Red zone and defensive yards are filled. Weather was skipped because the key is the free tier.
- Public betting splits on the schedule come from the Cleatz board. Lines and against-the-spread records are informational.

The last recorded static export was 186 pages on November 5, 2026. Later phone and simulator fixes are on this branch. They have not been deployed.

## What is not done

These are the only steps left before Phase 1 is closed. The first three need Brandon or a merge. An agent must not invent the missing values.

1. Publish the site. On Brandon's machine, run `npx vercel login`, then deploy this branch so the latest export is at https://2fans1pod.vercel.app. The site URL in config already points there. This environment is logged out of Vercel.
2. Merge pull request #1. Until that lands, `main` is the older site.
3. Turn the daily data job back on only after the merge. The workflow file is `.github/workflows/update-data.yml`. On GitHub the workflow is switched off by hand (`disabled_manually`). Leave it off while `main` still has the older script. The `CFBD_API_KEY` secret is already stored in GitHub. Do not copy that key into the repo.
4. Connect the contact form. It needs the show inbox email and `WEB3FORMS_ACCESS_KEY` in `.env` (gitignored). Until then, the page tells the visitor to try again later.
5. Real social links in [config/site.json](config/site.json): X, YouTube, Instagram, Spotify, and Apple Podcasts. Placeholder URLs contain `REPLACE_ME` and stay hidden in the footer.

## Do not build yet

- Rosters, multi-year recruiting, the transfer portal, and the Coaching Power Index. Advanced stats already shipped, so do not build those again.
- The news feed. A future news bot may only open pull requests that edit `content/news/`. Scores stay in the data scripts.
- A prediction model. Phase 4 adds it later, on the same matchup row that now shows the consensus line.
- Branch protection on `main`.
- A custom domain. One field in config updates share links and the sitemap when Brandon has a domain.
- Weather. It needs the paid College Football Data tier.

## Rules for any agent

- Brandon is a beginner coder. Explain a new file in plain language: what it is, why it exists, and what it does.
- Read [task.md](task.md), [memory/decisions.md](memory/decisions.md), and [memory/open-questions.md](memory/open-questions.md) before changing the site.
- Never put API keys, the Web3Forms key, or other secrets in git or in the memory files. Keys belong in `.env` and in GitHub Secrets.
- Do not port the old VSIN betting-splits scraper. Cleatz is the source for public bet and handle percentages.
- The homepage is a what-if for the rest of the season, not a picture of today's bracket. After the real field is set, the site opens on that bracket. What-if picks still work on top.
- There is no database, no accounts, and no analytics.

## Where the pieces live

- `app/` — pages. The homepage is the simulator.
- `components/` — header, footer, simulator, matchup, team pages, schedule.
- `lib/cfp/` — playoff math, share codes, and the unit tests.
- `config/` — hand-written settings. Scripts must not overwrite this folder.
- `public/data/` — the JSON the site ships with: teams, games, rankings, team stats, advanced stats, team profile, game EPA, betting splits, search index.
- `scripts/` — Python fetchers and the validator. Tests are in `scripts/tests/`.
- `content/news/` — empty on purpose.

## Questions still waiting on Brandon

- What email should listener, guest, and sponsor messages use?
- Should the contact page have a short note about listeners, guests, and sponsors, or only the form?
- What are the real social links?
- After Phase 1 is published, is the next build rosters, recruiting, and the transfer portal?
- Should a separate Grok bot be allowed to edit this repo, or should it only read it? News-only edits belong in `content/news/` by pull request. That path is not built yet.
