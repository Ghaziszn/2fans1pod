# 2fans1pod

A free college football site. The homepage is a rest-of-season playoff simulator: change the games that have not been played yet and the ranking, the field, and the bracket update.

## What is here

- The simulator, matchup calculator, team pages, conference standings, CFP rankings, search, and contact form.
- Season numbers live in `public/data`. Python scripts in `scripts/` build those files.
- A lasting Vercel address still needs a login. A short-lived preview can be created with `npx vercel deploy --temporary`.

## Run it

```bash
npm install
npm run dev
```

Open the address Next prints, usually http://localhost:3000.

## Refresh the numbers

Copy `.env.example` to `.env` and put your CollegeFootballData.com key in `CFBD_API_KEY` if you have one. Do not commit `.env`.

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python scripts/run_all.py
```

If the key is missing, the script uses the public ESPN feed and says so in `public/data/season.json`.

## Tests

```bash
npm test
.venv/bin/python -m unittest scripts.tests.test_compute scripts.tests.test_validate
```
