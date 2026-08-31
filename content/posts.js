// ===========================================================================
// POSTS — Weekly Review & YEET News Network
// ---------------------------------------------------------------------------
// These are the dropdowns on the homepage that you post into manually.
// Add a post by copying a template below into the MATCHING array — order in the
// array doesn't matter, the site auto-sorts posts newest-first by their date.
// Each post is itself a collapsible accordion: the site shows just the headline
// + date, and readers click the headline to expand the full article (with its
// reactions + links). Keeps the sections clean and scannable.
//
// FIELDS:
//   id    — a UNIQUE, PERMANENT tag for the post. This is what stores the
//           post's reactions, so never reuse or change it once posted.
//           e.g. "wr-2026-week1" or "ynn-2026-01".
//   title — the HEADLINE. This is the clickable text that expands the post.
//   date  — display date shown under the headline. e.g. "Sep 9, 2026".
//   body  — the post text. Put a blank line between paragraphs. You can also
//           drop links right in the text: [click here](https://example.com)
//           or just paste a full https://... URL. They open in a new tab.
//   links — (optional) an array of { label, url } shown as buttons under the
//           post — perfect for a PDF or Google Doc. e.g.
//           links: [{ label: "Read the recap (PDF)", url: "/my-file.pdf" }]
//           (Put PDFs in the /public folder; link them as "/filename.pdf".)
//
// After editing: Commit + Push in GitHub Desktop. The site updates itself.
//
// NOTE TO CLAUDE: whenever Mike hands over a manual post, confirm BOTH (1) which
// dropdown it belongs in — Weekly Review (weeklyReview) or YEET News Network
// (yeetNews) — and (2) what the HEADLINE (clickable title) should be, before
// adding it. Give each post a unique, permanent id.
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
    id: "ynn-2026-way-too-early",
    date: "Aug 31, 2026",
    title: "The way too early projection",
    body: `Good Morning Yeeters - Recapping yesterdays draft with some way to early predictions below but first, let me recap some other shit. Another year for commish CV, long may he reign, 10,000 more years supreme leader! They tried to tear him down but couldn't, he made heart and body a stone that the league could not remove. Keeper has been voted a NAY this year, better luck next year keeper boys. Stay tuned to the groupchat all day September 2nd as ZG takes on the long awaited, highly anticipated, health concern that is our league punishment, Burgers. Don't go fucking mental when the fries are done and beeping every 15 seconds. Alright, enjoy this Claude generated way too early report.

With Love, Treasurer Ling.

**THE WAY TOO EARLY PROJECTION** — 1 means you're cooking, 12 means preheat the grill.

**1. Chadamania (prestonbrick)** — Bijan Robinson AND A.J. Brown to open is filthy, and stealing Rashee Rice in the 3rd is highway robbery. Quinshon Judkins gives him a rookie RB2 with league-winner juice. The dirt: this whole juggernaut is one Bijan hamstring from being the Rachaad White Experience, and if Rashee Rice catches the suspension everyone's bracing for, your WR depth is a creaky Stefon Diggs still limping out of a blown-out knee. Frontrunner roster, glass jaw.

**2. Nicotine Leech (fantussy69)** — Zero weak spots — Jonathan Taylor, DeVonta, Garrett Wilson, Mike Evans and Sam LaPorta is the cleanest lineup in the league, and Chase Brown as your RB2 is a straight-up steal. But peek behind the curtain: if Jonathan Taylor so much as sneezes you're trotting out Rico Dowdle and MarShawn Lloyd, who couldn't stay healthy in a padded room, and Mike Evans is old enough to remember dial-up. One injury and this Ferrari is up on cinder blocks.

**3. Planet Girth (ProjectW)** — Saquon and Justin Jefferson is a top-2-pick parlay that just prints money, and then he had the stones to grab Josh Jacobs in the 3rd. Three RB1 bodies is greedy. Downside: after Jefferson your receiving corps is Jameson Williams — a target-share coin flip who's one quiet game from the bench — and two rookies you had to Google. Enjoy jamming four running backs into your lineup every week because you have to. A gorgeous 2015 roster build.

**4. Preston Wasnt There Again (mtozzi54)** — Gibbs at 1.01 is the correct pick, and Nico Collins plus Malik Nabers is a legit WR1/WR1 stack. Adding DK Metcalf on top is just rude. The ugly truth: behind Gibbs your entire backfield is Bhayshul Tuten, Jordan Mason and Tyrone Tracy — a witness-protection lineup of guys you'll be dropping by Week 4. Gibbs misses one game and the whole season detonates, and every receiver you own is a boom-or-bust migraine. Enjoy the 4-point weeks.

**5. Mcfucked (Zgezzy)** — Our reigning Burger King quietly built a monster: Amon-Ra, Brock Bowers and Jayden Daniels is a championship spine, and Bucky Irving + Montgomery is a real backfield. The catch: your WR2 is a coin flip between a raw rookie in Rome Odunze and a washed-up Darnell Mooney, and your ground game is David Montgomery splitting a committee with the whole city of Detroit. Loaded at the top, thinner than the fry oil underneath.

**6. Nabers thnk im sellindope (LeBronicus)** — Ja'Marr Chase at 1.03 is the best receiver in football, and Breece Hall plus Lamar Jackson gives him a nasty ceiling. George Pickens is a spicy WR2. The issue: this thing gets grim in a hurry. After Breece your running backs are rookie Cam Skattebo and RJ Harvey, and your WR3 is Quentin Johnston — a man who drops wide-open passes like they're on fire. One Breece Hall tweak and the entire house folds.

**7. Carol's Peps (kyletwarek)** — Christian McCaffrey at 1.05 is the highest-ceiling pick in the whole draft, and Olave / Egbuka / McLaurin is a deep, sneaky-good receiver room. The obvious problem: your first two picks are Christian McCaffrey and Kenneth Walker — two running backs sharing one functioning hamstring and a combined mountain of missed games. You didn't draft a backfield, you drafted a hospital wing. Keep the team trainer on speed dial.

**8. Glizzard Wizards (UncleZaddy4)** — Trey McBride is a cheat code at tight end and a Hampton / Kyren / Jaylen Warren backfield is deep as hell, with McConkey and Davante for steady targets. The mean part: your RB1 is an unproven rookie in Omarion Hampton, your WR1 is an ancient Davante Adams running on fumes and spite, and your QB is Matthew Stafford's crumbling back. This man built the entire website and still drafted a roster held together by Icy Hot and AARP cards — then ranked himself 8th, which is charitable. (Hi.)

**9. Tua Many Fish (ImAnAngler)** — JSN is a stud and Tee Higgins gives him a real 1-2 on the outside, plus Caleb Williams has year-2 breakout written all over him. The concern: your backfield is a genuine crime scene — an ancient Derrick Henry one carry from the glue factory and D'Andre Swift, who's been fantasy quicksand his entire career. When Henry hits the wall around Thanksgiving, your whole season slams into it with him.

**10. A&A ARMY (1ActionBronson1)** — Puka Nacua is a top-5 receiver and the rookie-RB lottery tickets — Jeanty, Jeremiyah Love, TreVeyon Henderson — all carry league-winner upside. The bad news: you bet an entire season on three rookie running backs, a geriatric Travis Kelce, and an Alvin Kamara running on fumes. That's not a roster, it's a degenerate gambling problem in cleats. Two of those rookies faceplant in October — and they will — and you're toast.

**11. The Space Browns (Nschechter)** — CeeDee, Drake London, Zay Flowers and Josh Allen might be the best WR-QB core in the league — on paper it's terrifying. In reality, you forgot running backs are a position. Rhamondre Stevenson, a perpetually-broken J.K. Dobbins, and Kenny goddamn Gainwell is your entire ground game — you'll be flexing a kicker at RB2 by Week 6. All those weapons and nobody to hand it off to. A genuine masterpiece of self-sabotage.

**12. Richmond Barebacks (civil8)** — Cook, Achane and Javonte is honestly one of the best backfields anybody drafted, no notes, and Brian Robinson deep is nice insurance. But our supreme leader forgot the forward pass is legal: your WR1 is a rookie in Tetairoa McMillan, your WR2 is Chris Godwin's surgically-rebuilt ankle, and your emotional-support tight end is Kyle Pitts, who has one usable season in five years and has personally gutted every man to ever roster him. All those running backs and not a soul to throw it to. 10,000 years of THAT? Woof.

**👑 PREDICTED CHAMPION: Chadamania (prestonbrick).** Congrats in advance, prestonbrick. My rigorous analysis — a solid eight seconds of staring at your roster — says Chadamania is the best team in the league, so you'll probably waltz to the title, and won't that be thrilling for absolutely no one. Bijan, A.J. Brown and Rashee Rice, a murderer's row assembled for the sole purpose of making the rest of us miserable. Can't wait to watch you win it and be so, so humble about it. Riveting television.

**🍔 PREDICTED BURGER: Richmond Barebacks (civil8).** And our dear supreme leader — the projection is not kind, chief. A genuinely elite backfield with nobody to throw it to and Kyle Pitts as your security blanket has you sprinting face-first toward the grill THIS season. What an arc that'd be: 10,000 years supreme, first-ballot Burger. Eat shit, commish. We love you.`,
  },
  {
    id: "ynn-2026-draft-day",
    date: "Aug 6, 2026",
    title: "This Time is Nigh",
    body: `Fellas - As discussed in the Group Chat, mark those calendars for August 30th at 7:30 PM.

Clevelander's, lets do our best to make it to the draft spot. Get your families, duties, and other things you got going on taken care of so we can be together. Would love to see PB, Key, Nate, and KT this year for gluttony. Unofficially we are doing Mexican dinner - Open to other thoughts and Ideas. I am happy to provide Barbacoa. Let's not forget beverages, cannabis, vapes, cigarettes(?) either.

Honestly, just sending this post because work is exceptionally slow for me today and I like using this thing, it's fun and I am excited to see things update week to week.

Everyone have a good weekend, stay safe.

Glizz Wiz`,
  },
  {
    id: "ynn-2026-welcome",
    date: "Jul 23, 2026",
    title: "Welcome to the Revolution",
    body: `Welcome Honkies.

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
