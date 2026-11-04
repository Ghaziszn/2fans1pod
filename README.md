# 2fans1pod

A free college football site. The homepage is a rest-of-season playoff simulator: change the games that have not been played yet and the ranking, the field, and the bracket update.

## What is here

- The simulator, header, footer, theme toggle, and search are in the app.
- Season numbers live in `public/data`. Python scripts in `scripts/` build those files.
- Team pages, the matchup calculator, the contact form, and the Vercel deploy are not finished yet.

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
