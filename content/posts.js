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
    id: "ynn-2026-welcome",
    date: "Jul 23, 2026",
    title: "Welcome to the Hive, Peons",
    body: `Hello, Peons.

Welcome to the new home of all things YEET FFL (aside from the group chat).

Go ahead and take a big ole swig and drink it all in. This website is our new home base. Again, I will always stay to the group chat for comms but if you want information, this is our Hive.

We have weekly previews, reviews, and YEET News Network which has more meaning than football. We can post league life events. Really I can posts these things. That's something I should mention…

I am basically God in here. I make the changes, updates, posts, pushes, etc. (you're welcome) to make this fantasy, fantasy site a reality. This is my house. All you all have to do is walk in, take your shoes off, pants(?), and look around.

Anyway, consider it my gift to you. This shits fun as hell. Take a long while to dig through the capabilities here. The posts and stuff is a small social feature to a much larger archive of information and comparison.

Quick breakdown - I hope you've made it this far:

**Homepage:** You can figure that out

**Matchups:** This data is old by the time you see it. Pulled from 2025 because this season hasn't happened yet, which means when it does, data will update ~24 hours. Here we have a gambling feature based on weekly matchups. And if you want to be legitimate sick disgusting fucks, you can have a friendly with someone in the Head to Head comparison tool and bet on your own time and dime.

**Head to Head:** All Time and Regular Season comparison between two teams.

**Managers:** Strap the fuck in here, player cards for everyone showing historical data of all kinds. Go look and be curious and figure it out

**The Archives:** The ancient history of our league lives here

I am expecting only about 3 people to have made it this far. Lastly and most importantly fun - when posts come out you can upvote and emote to it. A fun way to react to weekly reviews.

That's it really - This was really more of a test post for me to test out the function of posting, reacting, and it going to the right place. Enjoy this treat, I have had a ton of fun making it.

Let's get this fantasy shit poppin again.`,
  },
];
