# YEET FFL

A fantasy football site for the YEET league, built with [Next.js](https://nextjs.org)
and powered live by the free, public [Sleeper API](https://docs.sleeper.com) —
no API keys, no manual data entry.

## What's here so far

- **Home** — league title, reigning champion, and a top-5 standings snapshot
- **Standings** — full standings (W/L/T, points for/against, current streak)
- **Matchups** — last week's results in season; latest scored week in the offseason
- **History** — champions by season and an all-time records table across every season

All data is pulled from Sleeper at request time and cached for an hour.

## Getting it online (one-time)

You don't need to run anything on your computer. Vercel builds and hosts it:

1. In **GitHub Desktop**, click **Commit to main**, then **Push origin**. This
   sends these files to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project**.
3. Connect your GitHub account if asked, find the **Yeet-FFL** repo, click **Import**.
4. Leave all settings as-is and click **Deploy**. Vercel auto-detects Next.js.
5. After ~1 minute you'll get a live URL. Done.

From now on, every time you **Commit + Push** in GitHub Desktop, Vercel
automatically rebuilds and updates the live site.

## Seasons roll over automatically

The site is **not** pinned to a single season. On every load it asks Sleeper
for the newest YEET league belonging to a fixed manager account
(UncleZaddy4), so when the 2026 season (and every future season) starts, the
site switches to it on its own — no code changes, no redeploy needed. Past
seasons keep chaining backward onto the History page.

If Sleeper is ever unreachable, it safely falls back to the 2025 league so the
site never goes blank. The anchor account and fallback live at the top of
`lib/sleeper.js` (`USER_ID` and `LEAGUE_ID`) if they ever need changing.

## Running locally (optional, advanced)

If you ever want to preview on your own computer:

```bash
npm install
npm run dev
```

Then open http://localhost:3000.
