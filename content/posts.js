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
//   body  — the post text. Put a blank line between paragraphs. You can also
//           drop links right in the text: [click here](https://example.com)
//           or just paste a full https://... URL. They open in a new tab.
//   href  — (optional) makes the whole TITLE a clickable link (new tab).
//   links — (optional) an array of { label, url } shown as buttons under the
//           post — perfect for a PDF or Google Doc. e.g.
//           links: [{ label: "Read the recap (PDF)", url: "/my-file.pdf" }]
//           (Put PDFs in the /public folder; link them as "/filename.pdf".)
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
  {
    id: "ynn-test-1",
    date: "Jul 23, 2026",
    title: "TEST: Notifications, reactions & links are live",
    href: "/YEET-FFL-Guidelines.pdf",
    body: `This is a live test post. The red bubble on the YEET News Network dropdown is counting it — open the dropdown and the bubble clears.

Links work three ways. The headline above is clickable (opens the league guidelines PDF in a new tab). You can also drop a link right in the text like [the Sleeper site](https://sleeper.com), or paste a bare URL such as https://sleeper.com and it becomes clickable automatically.

Try the reactions below too — vote it up/down and hit the "+" for more emojis.`,
    links: [
      { label: "Open the League Guidelines (PDF)", url: "/YEET-FFL-Guidelines.pdf" },
      { label: "League Rules (Google Doc)", url: "https://docs.google.com/document/d/1iuEKRa91wx7Nz4L9vPwOgguym7tWBaDMGQwTvNIED1g/edit?usp=sharing" },
    ],
  },
];
