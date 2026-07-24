// ===========================================================================
// POSTS — Weekly Review & YEET News Network
// ---------------------------------------------------------------------------
// These are the two dropdowns on the homepage that you post into manually.
// Add a post by copying a template below into the MATCHING array. Newest posts
// go at the TOP. Each post shows inside its dropdown with its own reaction bar
// (up/down votes + emojis + a "who reacted" hover).
//
// FIELDS:
//   id    — a UNIQUE, PERMANENT tag for the post. This is what stores the
//           post's reactions, so never reuse or change it once posted.
//           e.g. "wr-2026-week1" or "ynn-2026-01".
//   date  — display date, any format. e.g. "Sep 9, 2026".
//   title — the headline (shown in bold).
//   body  — the post text. Put a blank line between paragraphs.
//
// After editing: Commit + Push in GitHub Desktop. The site updates itself.
//
// NOTE TO CLAUDE: whenever Mike hands over a manual post, confirm which
// dropdown it belongs in — Weekly Review (weeklyReview) or YEET News Network
// (yeetNews) — before adding it, and give it a unique, permanent id.
// ===========================================================================

// 📝 WEEKLY REVIEW — recap of the week that just finished. Newest first.
export const weeklyReview = [
  // {
  //   id: "wr-2026-week1",
  //   date: "Sep 9, 2026",
  //   title: "Week 1 Review",
  //   body: `Your writeup goes here.
  //
  // A second paragraph goes here.`,
  // },
];

// 📡 YEET NEWS NETWORK — league news, trades, rumors, hot takes. Newest first.
export const yeetNews = [
  // {
  //   id: "ynn-2026-01",
  //   date: "Sep 9, 2026",
  //   title: "BREAKING: ...",
  //   body: `The story goes here.`,
  // },
];
