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
  {
    id: "wr-2026-week2-roundup",
    date: "Sep 22, 2026",
    title: "Week 2 Roundup - CUMBACK SZN",
    body: `Good day fellas. Thanks for honoring me to provide these Shabba Ranks for this week. Strap in for this one. Let's get right into it:

1. Connor "let me call my mortgage guy and see if you're good to Venmo Amanda" Keeley taking home high score of the week by a cunt hair to Nate, kudos son. An exceptional triumph to an opponent openly mocking his mom, Kt should have to bend the knee and sing for Keeley in jester attire this week as well as order shirts for his entire family that say "Property of Connor Keeley". Honestly an exceptionally average game less Travis Swift, New Angland, and whipped Waddle. All while not playing puka too! Guys a visionary in decision making. KTs team was looking nice going down the line until you got to Egbuka and then the bed got shitted. Good on ya key, next week you got Big V but the v is for victory. Is it ok to Venmo you or will a flag be raised and you lose the house?

2. Nasty Nate - Allen and ceedee absolutely sounding off this week for a combined 76 and some change. Put an absolute spanking on Spencer who I'm sure isn't hanging around I-480 with saquan putting up 3 points and a questionable health status. Actually as i take another pass at the numbies, outside ceedee and Allen, and the panthers D(ONG), your team was exceptionally average as well, and i can say that bc my team is leaned over a urinal pissing on their shoes in a public bathroom right now. UPDATE: my team did the pissing on someone else's shoes. Next week, got the Nicotine Nightmare in kerner.

3. Jesse Smith-Njigba: well, well, well, well, well, well, WELL.  Rooka rike we're gonna be meeting again in 12 very short weeks. I've never seen such a false sense of despair up until 8:20 last night, thinking his team was going to go under on a week he's playing a Josh downs and Jaylen Warren flexed opposition after getting a 22.5 point lead with Kincaid on Thursday. It was so cool to check my phone every 3 hours as i drove home from Wisonsin to see how I was doing Sunday. My guy was flopping his dong left and right watching his score rise, no doubt. I'd say good luck without Caleb Williams but I'm sure your team will be injury free and fine for the rest of the year. Guy had a 159-78 lead going into Monday, numerous provocative name changes, and the taste of victory marinating right before his eyes. The joy i had this morning is indescribable. Then the reading back of texts, I was longstroking my shit before I even got outta bed. I had previously thought we should all concede and vote Jesse to just win the league because kudos your team is nice and whatever. Looked like an undefeated year But now He's been defeated and he can Tua'on these nuts. Next week is the bareback brigade. Lather up my little gimpy.

4. The Knight of Nicotine - I know my boy woke up and praised JT for dropping a cool 30. Must be sick having a running back going back to back weeks dropping 25+. Receiving core was also going dummy putting up above average digits. Kerner's a sneaky man when it comes to drafting above average teams and should not be taken lightly, so opponents beware. It would be fair to say that the boy was leaking all over the silver slurpers. Only for the Slurpers to be there mouths agape waiting for that sweet dribbling leak of nicotine pod to fill his hole. Next week is N8. Special shout out to Oakley.

5. Former Burger Brigand ZG - one of the lowest scoring dub I've seen in a matchup in a long time (less CV this week). If you ask me, dubs a dub no matter what and if it moves you one less inch away from burgers, it's good. Amon Ra has entered the chat, dropped his shorts, sought Preston out, and proceeded to Cleveland steamer his chest. I bet you this week you're not wanting to hurt yourself after Brandon Aubrey dropped a sweet 16. But i bet you wanna hurt yourself now, both as manager and fan, that Jayden Daniel's brokedadid his elbow. Idk if anyone else saw that but golly, that shit did not look good and I'd be surprised if he comes back anytime soon. Write to Amon ra this week and tell him thank you. Next week you got LAshymane la flare

6. KT - My guy picked the wrong name for his opponent in week 2. Thought you were clever, eh? Peps got that ass beat in a vengeful way from key baby this past week. I'll be the first to say, as I scanned your team on the left side of the board going down the matchup line, you'd think you'd have won. But you didn't. Played the wrong tight end but it wouldn't have mattered. You have a spicy team and i can see you going far but we'll see on that. You have the Silver Slurpers next week in an even matchup. The last time i saw you two match up something was in a Toyota Corolla on Woodsdale Lane with Jeezy on in the background.

7. CV and the Bareback Boys - Commish, another below average scorecard here. I know my guys just happy to be one win removed from burgers and as I said, dubs a dub. On paper, your team's a bucket. Upon execution, it's another thing. Best thing you for goin right now aside from the win is the win you got in the other league. And speaking of executions, goodbye Alec Pierce, hello waiver wire. Perhaps your on paper team will keep pushing. I appreciate your reassurance in that it is only week 2 as I confided in you the mistakes i have made drafting this year. I wish I had meaner things to say because people love seeing the Commish on a spit. You got my little gimp next week and I'm confident his name will change multiple times.

8. Silver Slurpers - OG Burger Prince. How nice was it to watch another man suffer the suffering you endured? Sweet I bet. Shoutout to generational pain. Welcome to 0-2 brother, back in the gutter you go. Can't be out in the light too long now. No chance for you this week going up against a sneaky man's well drafted team. There's still hope in Jamar and Lamar (Jamar javar lamarvison lamar). Even in skatebo who I'm not that high on. I have a feeling there was something about him you just really liked. I can't put my finger on it but he just seems different than all the other running backs in this league except for that Christian Macaffery fella. You got Peps this week.

9. 9/21 Post: Burgers pending - in light of recent name changes from my prior opponent, this seemed acceptable. I've been having truly bad dreams of burgers and find myself occasionally doing the math on how I'd approach the punishment. Dark clouds surround me as we exit week 2. Don't draft the city of LA i guess. Hoping that my Rams squad buck the fuck up. I'd be on sewerside watch if i didn't have Trey McBride but what's currently happening isn't too far off from the feeling. You know it's bad when you get excited to start a soon to be stud wide receiver on an exponentially failing team (Denzel Boston). With my luck, he'll get hurt or have negative points next week. And if i wasn't on watch this week, I'll be in several pieces and splatters along Canal Road shortly (Google where it's at in Cleveland). I'm realizing selfishly that my report is the grimmest, most thought out, and really a cry for help and venting this week but you all put me in charge of doing it. I'll turn it around, you'll all see. They'll be chanting for me like they chanted for Bruce Wayne as he climbed his way out of the prison hole on Batman 3. We rise. This week i got McFucked, aka Mr. 12 and 12, aka Snikklez. A battle of burgers

9/22 UPDATE: From the ashes of Burgers Pending rose LAshymane. SMELLS LIKE A WHOLE LOTTA BITCH IN HERE. What an absolute blessing to see at 6:15 am. I had been watching the game a bit before snoozing playing Zelda, but Jesse I hope you watched every ounce of that game. I hope you watched to the point where I crossed 159.8 points, and CONTINUED to watch in hopes of a fumble or pick. I hope you watched until Stafford began to kneel and lose .1 points each time (which is something i think we should get corrected if possible bc if that fucked me over I'd have committed 11 atrocities for everyone just being a participant in the league). I think it needs to be said, Davante Adams is still a very, very bad man. Stafford can still sling pigskin. And Blake Corums gotta get the fuck out of this rotation. Williams can play the whole game just fine. Sorry for being so self centered on this weeks post but you guys gave me the pen to write with. On top of all this fantasy joy, my bets hit too. Had nothing but faith in the Rams with my Davante two touchdown, and Stafford over two td + Davante and Kyren anytime tutty's. Now, am I high on my team? Right now, I feel like I'm smoking a formaldehyde blunt but instead of weed it's acid tabs, that high. Otherwise, meh kinda. As long as Puka Nacuas biting, antisemitic ass is sidelined. Maybe Sean Mcvays twitchy ass will keep going to Davante as long as he's open. Week 2 has made a monster. I'm back up and I'm coming for all of you. Time to wear out ZG's tired ass, quarterback-less team. Everyone hit the wire hard on QB so he can't have any.

10. Only Felons - What can I say about your team that hasn't already been said about Afghanistan? They're worn out and depleted. In a similar light, they also prefer domestic violence like Josh Jacobs. Mf's back got blown the fuck out. I haven't seen a fucking like this since I was a youth and googled what bukkake was. Mr. RB University and domestic violence advocate, you've gotta get the boys in check otherwise it's a long season and the burger equations start spawning. I seent em before so I know. Your four starting RB's combining for 28 points ain't it. Granted you faced a lethal combo in Lamb and Allen, those RB's must be better. Not that I can say much myself. I hope you can formulate a plan as you read this on your back, feet up, ass powdered, between your two lovely children, as Bridget changes all three of your diapers. Next week you got the reigning champ, PBiscuit.

11. Chadmania - Preston "Well actually Mr. Commissioner…" Brickner aka Burgermania. Starting out 0-2, welcome to the soup brother. As a veteran hater, it brings me absolute joy to see the guy I lost to last year in the ship start out 0-2. I know you as an absolute pot stirrer love to see this type of hate so it'll fuel that tiny little fire in your tiny little heart. Awful choice drafting Quinshon (I also did this in another league). Gotta be tough to have a "nice" team and put up sub average numbies. Let's see how good Diggs is with Marcus Mariotta or whoever is next elbow up. You got the Carpet Czar this week.

12. Big motherfuckin V -ictory - I'm not sure the name stands for several reasons. 1 being you lost, 2 being big v i don't think is very big anymore. The last time i saw her at Spencer's house 8 years ago i reintroduced myself bc i didn't recognize her. Anyway, as i wrote this you're on par to hit a SUB NINETY SCORE. Has this happened before? If only there was a repository of this leagues history somewhere that we could check. Fuck, that'd have been a cool idea. I imagine it's as tough to draft at 1 as it is at 12. Despite Gibbs putting up a below avg score for himself, your teams lookin beat tf up. No Nico, plus you got Jakobi Meyers and DK starting. Oh lawd. Gonzalez had DK's ass in a blender and kept hitting "pulse" til there was no consistency left. Maybe that old man quarterback will be better next week. UPDATE - mf didn't even break 80. EIGHTY! Change your name in fantasy and in real life. Week 3, you're at least projected to win and you have this weeks high scorer, Connor Pratt.

I wish all of you (in terms of fantasy sports only) nothing but the absolute worst going forward this season. I'm sure these ill wishes will not bite me in the ass and in 15 weeks not have me contemplating Burgercide. Wonderful week ahead, Browns won Sunday so we all really won no matter whatever punishments face us all. Go Browns, Roll Tribe, Let em Know, fuck Ohio state.

Zaddy out. ✊🏽✊🏽✊🏽`,
  },
  {
    id: "wr-2026-week1-power-rankings",
    date: "Sep 15, 2026",
    title: "🍆 Power Rankings Week 1 💦",
    body: `Here she blows

**Highest Points $25 Week 1 = Tua Many Fish 196.86**

1. Jesse - Damn dog, ChatGPT drafted you the best team in the league for Week (I know how much you use ChatGPT in ur daily life hoe). Nail Fingerpainting Williams combined with 45 year old Derrick Henry, D. Swift, JSN and Parker Washington to diabolically blow Preston's back out. If this squad stays healthy and the Bears offense isn't fraudulent, we all might be fucked. Week 2 matchup = Lash

2. Tozzi - Jahmyr is a fucking cheat code. 29 carries… dudes carrying the load that your squad just blew all over Lash this week. I think your team is real solid - and I believe in Tuten. Only question marks for me - Herbert really actually may just not be that guy and where the fuck was Colston Loveland this week? Week 2 matchup = CV

3. ZG - Holy fuck. I didn't know you had it in you to assemble a solid fantasy football team. Like a rising phoenix from the ashes of pounds of overcooked burnt McDouble meat, it seems you have yourself a squad. I have no real notes other than your starting lineup is rock solid if they stay healthy + your bench is nonexistent. Once you get Brock back your team is scary. Week 2 matchup = PB

4. Schec - Josh Allen cheat code. You arguably have assembled the best recieving core in the league. For as sus as your RB room is, if Rhamondre keeps putting up decent points you should be all set. Question marks for your squad - how long is Zay out for? Is the Steelers defense really that good or did they just play the Breakfast Bungalow All Stars this week? If you need a RB down the road hit my line. Week 2 Matchup = Weeno

5. PB - Interesting to not see the entire Cinci offense on your squad this year. Put up 150+ but still unfortunately got smacked around by Jesse's AI crafted team. RIP AJ Brown (I drafted him in the 2nd in another league so I feel your pain). How will Quinshon play this year? Will he be able to understand the play calls coming from QB1 Tyler Castrillo in the huddle? Week 2 matchup = ZG

6. Kerner - Solid backs, solid WRs and I love the Mike Evans flex. I also think he will continue to eat this year. I also heard that you AI analytics'd your way through the draft. I'm happy for you. I hope your whole team doesn't collectively get AIDS and all die in separate plane crashes. Is Deebo making your starting lineup next week? Week 2 matchup =   Magoo

7. KT - Secured the dub this week. Is Kenneth Walker really that boy? CMC bound to put up more points than 13 on a weekly basis and you have one of the most solid benches in the league. I still think Marvin Harrison is fraudulent and anyone who drafted Fannin might be questioning that after we saw the talent level of our QB1 in Cleveland this weekend. Week 2 matchup = Keysta baby

8. Magoo - What an ass week for your hitters Ja'Marr and Mr. Chicken Pickens. That's not sustainable - these guys will hoop this year… maybe. Questions for your squad this year - will Lamar's back/pussy start to bother him again this year? How long until Skatt CTEs himself into drinking jello out of a straw in an assisted living home? Is Kittle officially cooked? Week 2 matchup = Kerner

9. Spencer - Your team doesn't really excite me at all - but is nice knowing JJettas might actually have a competent QB throwing him the ball this year. Even if Kyler is Radio'd, Carson got that thang on 'em. It looks like there is hope that Josh Jacobs actually will play football this year.. maybe. Looks like you can sexually assault and DV any woman you want in the NFL as long as the video footage ain't released. Week 2 matchup = Schec

10. Keeley - Your team actually put up decent points this week, so maybe not a dogwater week, but that roster is looking highly suspicious. I told you Kyler is not it, I don't care if you like to play with his lil ass on Madden. Jalen Coker coked out for you this week. Looks like Ashton Jeanty actually may be a legit RB1.. or maybe they just played Miami who I heard lost to a 18u Women's Australian Football team in the offseason. Good luck Key - I hope you don't actually lose this year, because I know how much you'd cum your shorts to have some time alone in a McArnolds just smacking doubles. Week 2 matchup = KT

11. Lash - Here's a positive, at least you didn't put up 87pts like I did - you broke 100 and that's respectable. Some big question marks though - Omarion Hampton/the Chargers offense??? Devonta Adams too nappy? Josh Downs actually has downs? You should totally start Denzel Boston next week - heard he's really built great relationship with his delusional rapist QB since being drafted. Week 2 matchup = Jesse

12. CV - I ate a double cheeseburger w/ my Big Mac at the airport today to prepare myself for what it might feel like if I have to eat 14-16 more double cheeseburgers in a 24hr period. I am not motivated by $$ in this league - I am motivated by not having to inject burgers. Whole team looking like a fresh pair of shiny red clown shoes after week 1. Week 2 matchup = Tozzi`,
  },
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
