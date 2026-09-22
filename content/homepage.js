// ===========================================================================
// EDITABLE HOMEPAGE CONTENT
// ---------------------------------------------------------------------------
// This is the file to change each week (e.g. every Tuesday). Just edit the text
// between the backticks below, then Commit + Push in GitHub Desktop. The site
// updates automatically. You can use multiple paragraphs — separate them with a
// blank line, and each becomes its own paragraph on the page.
// ===========================================================================

// "Weekly Recap" — your writeup of the week that just finished.
export const weeklyRecap = `No news yet but the season is near`;

// "Weekly Preview" — intro blurb shown above the matchup previews/odds.
// During the season the Tuesday task can drop a short summary here.
export const weeklyPreview = `Matchups are coming`;

// "Yeet News Network" — manually-curated league news. Give Claude the raw
// notes and it will write this up; then edit the text below and push.
export const yeetNewsNetwork = `Nothing new except this site which is sick as hell`;

// Optional per-matchup blurbs for the CURRENT week's Weekly Preview, keyed by
// "week:matchupId" (e.g. "3:5"). The live preview reads whichever week is
// current. When a new week starts, move the finished week's blurbs down into
// previewArchive below so they live on as a collapsible historical post.
export const matchupBlurbs = {
  "3:1": `A pure coin flip — OnlyFelons (proj 127) vs Chadamania (proj 126), separated by a single lousy point. ProjectW rode Patrick Mahomes (29) in Week 2 but watched Saquon Barkley shit the bed for a limp 3.0. Preston got 21.7 out of Stefon Diggs, though DJ Moore somehow posted NEGATIVE 0.1 — you have to genuinely try to score less than nothing. Dead heat; whoever keeps their busts benched wins.`,

  "3:2": `Nicotine Leech (proj 137.8) are heavy chalk over the Space Browns (proj 117.5). Jonathan Taylor (29.2) keeps running downhill like he owes the mob money for fantussy69, while Rico Dowdle (6.4) did jack. Nate's Browns got a monster 40.8 from Josh Allen but J.K. Dobbins face-planted at 3.6 — and a 117 projection says the magic's run dry. Leech by a comfortable mile.`,

  "3:3": `Bend over, Zgezzy. LAshymane (proj 124) are a massive favorite over Mcfucked (proj 93.4) — yes, ninety-three, our reigning Burger King is projected like it's still last season. UncleZaddy4's Davante Adams went absolutely nuclear for 39.5 in Week 2 (Ladd McConkey's 6.5 the only dud), while ZG leaned on Amon-Ra (35.2) and got a pathetic 4.4 out of David Montgomery. This isn't a matchup, it's a scheduled public execution — grab a chair.`,

  "3:4": `Silver Slurpers (proj 136.1) have the edge on Carol's Peps (proj 124.1). Ja'Marr Chase (26.5) finally woke the fuck up for LeBronicus, though Wan'Dale Robinson coughed up a sad 1.9. KT got 29.8 from Dak Prescott but Dallas Goedert mailed in a 1.4 that should get a man cut on sight. Slurpers favored — Carol's Peps need their dead weight to show a pulse.`,

  "3:5": `Our supreme leader's Richmond Barebacks (proj 131.4) are favored over Lash's good lil gimp boi (proj 122.9). Brock Purdy (28.5) carried civil8 while Alec Pierce stunk up the joint at 2.1. ImAnAngler got a league-best 42.5 from Jaxon Smith-Njigba but Luther Burden (6.2) was a wet paper bag. civil8 by a nose — the gimp boi needs more than one hero to survive.`,

  "3:6": `Coin flip to close it out — Big V….ictory (proj 128.2) vs Whipped & Waddled (proj 126.2). mtozzi rode Jahmyr Gibbs (23.3) but still cratered to a league-worst 77.4 as Malik Nabers managed a putrid 1.1. Bronson dropped a league-high 163 behind Travis Kelce (25.1), with only Brian Thomas (7) lagging. Toss-up on paper, but Bronson's the hotter team — mtozzi better pray his studs wake up.`,
};

// ---------------------------------------------------------------------------
// PREVIEW ARCHIVE — finished weeks, kept as collapsible historical posts under
// the live preview. Newest first. Each entry: { week, title, date, matchups }
// where matchups is the list of that week's blurbs (in matchup order). When a
// week wraps, paste its matchupBlurbs values here as a new entry at the top.
// ---------------------------------------------------------------------------
export const previewArchive = [
  {
    week: 2,
    title: "Week 2 Preview",
    date: "Sep 15, 2026",
    matchups: [
      `A dead-even coin flip: Space Browns (proj 123.4) vs OnlyFelons (proj 123.3), split by a measly tenth of a point. Josh Allen (35.7 last week) keeps Nate's shit humming, while J.K. Dobbins pissing out a limp 3.6 is the dead weight to bench before it stinks up the joint. ProjectW ride Justin Jefferson (31.2) committing felonies, but Jake Ferguson played tight end like he was balls-deep in witness protection (2.6). Flip a fucking coin.`,
      `Chadamania (proj 130.9) are heavy chalk to curb-stomp Mcfucked (proj 113.8), and ZG's sorry-ass lineup is doing him zero favors. Bijan Robinson (31.3) carries Preston, with A.J. Brown flopping to a limp-dick 5.6 the only wart. Zgezzy leaned on Amon-Ra St. Brown (28.7) last week but Rome Odunze (7.2) did sweet fuck-all, and 113 projected ain't beating a JV squad. Preston by a mile — enjoy the L, you burnt-McDouble-ass franchise.`,
      `Nicotine Leech (proj 133.5) are about to bend the Silver Slurpers (proj 124.9) clean over. Jonathan Taylor (25.1) runs downhill like he owes the mob money, while Rico Dowdle (4.1) was a soggy fucking nothingburger. LeBronicus has Lamar (25), but Ja'Marr Chase — the alleged best receiver alive — pissed out a putrid 3.2 that oughta be tattooed on his forehead as a warning to others. Leech takes it and it ain't close.`,
      `Toss-up of the week: Glizzard Wizards (proj 125.5) a razor-thin favorite over Tua Many Fish (proj 124.0). Trey McBride (24.5) anchors UncleZaddy4 while Matthew Stafford's crumbling back wheezed out a pathetic 5.1 like the geriatric fuck he is. Jesse rode Caleb Williams (37.3) to a monster last week, but Tee Higgins jerking off for 8.9 kept him mortal. This one's a knife fight in a phone booth — bring a rag.`,
      `Carol's Peps (proj 130.0) hold the edge on Whipped & Waddled (proj 124.8). Kenneth Walker (34.1) hit warp speed for KT while Terry McLaurin (3.4) was a ghost who forgot to show the fuck up. Bronson's got rookie Ashton Jeanty (32.7) balling out, but Kyler Murray shitting out a 0.6 — a starting QB under a single goddamn point — is a fireable offense. Peps favored; bench the corpses, Bronson.`,
      `Sean (proj 133.4) are favored over the Richmond Barebacks (proj 128.8), way closer than the commish deserves. Jahmyr Gibbs (33.6) is a cheat code for mtozzi, though Colston Loveland pulled a fat goose egg. civil8 got Javonte Williams (24.2), but Kyle Pitts scored a clean, majestic ZERO, exactly as the prophecy foretold. mtozzi by a nose — preheat the grill and lube up the spatula, chief.`,
    ],
  },
];
