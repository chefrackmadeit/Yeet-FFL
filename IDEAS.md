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
- **Skip:** full account system (usernames/passwords/permissions) — overkill
  for ~12 people and the only option that creates real management overhead.

Next step when ready: Claude picks a free database, wires reactions onto the
homepage post sections, and provides the Vercel setup steps.
