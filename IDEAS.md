# YEET FFL — Ideas & Backlog

A running list of features to revisit later.

## 🎨 Design conventions (keep consistent)
- **Tabs & week sub-tabs:** always use the shared `.tab-btn` / `.subtab`
  classes. They carry the standard styling and the **Claude-coral (#d97757)
  outline on hover** (desktop). All new tabbed sections should reuse these so
  the hover behavior stays consistent everywhere.
- Coral hover token lives in CSS as `var(--claude)`.

## 🔖 Reactions / voting on previews & recaps
**Bookmarked — revisit closer to the 2026 season.**

Add Reddit-style up/down votes and/or emoji reactions (👍 😂 🔥 etc.) to the
Weekly Preview, Weekly Recap, and YEET News Network posts.

Decisions from our discussion:
- **Recommended approach: no login.** Emoji + up/down reactions with a
  per-browser cookie to limit double-voting. Zero accounts, zero username or
  permission management for Mike.
- **Requires one new piece:** a small database + a save-a-vote endpoint (the
  site is currently read-only from Sleeper). Free tiers cover a league this
  size. This is the first feature that *writes* data, so it needs a database
  service connected in Vercel — pick the specific one when we build.
- **Optional later upgrade:** "pick who you are" identity from the Sleeper
  roster (no passwords), or a shared league password, if vote-gaming ever
  becomes an issue.
- **"Who reacted" hover bubble (wanted):** show a tooltip listing the names of
  who reacted with each emoji (Slack/Facebook style). This REQUIRES identity —
  each reaction stored as `{ post, emoji, managerName }` — so it needs the
  "pick your name from the Sleeper roster" tier, not the fully-anonymous one.
  Still no passwords/accounts to manage. Also enforces one reaction per person.
- **Skip:** full account system (usernames/passwords/permissions) — overkill
  for ~12 people and the only option that creates real management overhead.

### ✅ Decided approach
Magic-link email login via **Supabase** (one free service = auth + database;
Supabase sends the login emails itself, so NO separate email service needed).
- **Email allowlist:** Mike collects everyone's emails; only those can log in.
- **Auto-identity:** each email is pre-mapped to its Sleeper manager, so after
  login the site already knows who you are (no "pick your name" needed).
- **Stay signed in:** sessions auto-renew, so it's one-and-done per device
  (weeks/months) until sign-out or clearing browser data. New device = one
  fresh magic-link sign-in.

### Setup steps (do these WHEN READY — not yet)

**Mike's part:**
1. Collect every manager's name + email; send the list to Claude.
2. Create a free account at supabase.com → New Project (name e.g. "yeet-ffl",
   save the DB password, pick the closest region).
3. Supabase → Authentication → Providers → enable **Email / Magic Link**.
4. Supabase → Authentication → URL Configuration → set Site URL to the Vercel
   URL and add the callback redirect URLs (Claude gives exact values).
5. Supabase → Project Settings → API → copy **Project URL**, **anon key**,
   **service_role key**.
6. Vercel → Project → Settings → Environment Variables → add them as
   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
   SUPABASE_SERVICE_ROLE_KEY → redeploy.
7. Paste Claude's SQL snippet into Supabase → SQL Editor → Run (creates tables +
   seeds the email→manager allowlist).
8. Commit + Push, then test the magic link on the test post.

**Claude's part (code):**
- Reaction bar (emoji + up/down) + "who reacted" hover, wired to Supabase.
- Magic-link sign-in + /auth/callback route + long-lived session.
- Email→manager mapping so identity is automatic after login.
- A test post to demo now; applies to real weekly posts once the season starts.
- DB schema + the SQL seed snippet + exact env-var and redirect-URL values.

Note: first backend + login feature → expect more back-and-forth than the usual
"commit and push" (build → Mike sets up Supabase + Vercel keys → push → debug
together).

## 📬 Email alert when a member signs in
**Parked on 2026-07-24 — fully designed and built once, then backed out to
revisit later. Reactions/login are already LIVE; this is an add-on.**

Goal: Mike gets a real-time email the FIRST time each member ever signs in
(e.g. "🏈 New sign-in: civil8"). One email per person, no spam on repeat logins.
Reuses the existing Gmail SMTP account (the one that sends magic links) — no new
email service.

How it works:
- New table `public.first_signins` (user_id PK, email, manager_name, created_at),
  RLS: a signed-in user may insert only their own row.
- A client logger (`SignInLogger`, mounted in layout) does an upsert with
  `ignoreDuplicates` on sign-in → inserts a row ONLY the first time each person
  logs in (repeat logins = no-op = no email).
- A Supabase Database Webhook on `first_signins` INSERT → POST to
  `/api/notify-signin` (Next.js Node route) → sends Mike an email via nodemailer
  + Gmail SMTP. Secured with a shared `x-webhook-secret` header.

Config Mike needs (when we revive it):
1. Run `supabase/signin-notifications.sql` (creates the table + policy).
2. Vercel env vars (Production): GMAIL_USER, GMAIL_APP_PASSWORD, NOTIFY_EMAIL,
   SIGNIN_WEBHOOK_SECRET (a random string).
3. Commit + Push (ships route + logger + nodemailer dep).
4. Supabase → Database → Webhooks → new hook on public.first_signins, INSERT
   only, HTTP POST to https://yeet-ffl.vercel.app/api/notify-signin, add header
   x-webhook-secret matching the env var.

The code for all of this was written once (SignInLogger.js, api/notify-signin
route, the SQL, nodemailer dep, layout wiring) — can be rebuilt quickly from
this spec. Also considered: a private on-site "who's signed in" page as a
no-email alternative/backup.
