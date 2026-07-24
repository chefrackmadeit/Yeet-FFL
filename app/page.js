import {
  getLeague,
  getReigningAwards,
  getCurrentLeagueId,
  getSeasonStandingsSets,
} from "@/lib/sleeper";
import { attachTitleOdds } from "@/lib/odds";
import StandingsTabs from "./components/StandingsTabs";
import WeeklyPreview from "./components/WeeklyPreview";
import ReactionBar from "./components/ReactionBar";
import { weeklyRecap, yeetNewsNetwork } from "@/content/homepage";

export const dynamic = "force-dynamic";

// Split editable content into paragraphs on blank lines.
function paragraphs(text) {
  return String(text)
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function Prose({ text }) {
  return (
    <>
      {paragraphs(text).map((p, i) => (
        <p key={i} style={{ margin: i === 0 ? "0 0 10px" : "10px 0" }}>
          {p}
        </p>
      ))}
    </>
  );
}

export default async function HomePage() {
  const currentId = await getCurrentLeagueId();
  const [league, seasonSets, awards] = await Promise.all([
    getLeague(currentId),
    getSeasonStandingsSets(currentId),
    getReigningAwards(currentId),
  ]);

  // Attach for-fun league title odds to the current season's rows.
  const currentSet = seasonSets.find((s) => s.isCurrent);
  if (currentSet) attachTitleOdds(currentSet.rows);

  return (
    <>
      <section className="hero">
        <h1>{league.name}</h1>
        <p>
          {league.season} season · {league.total_rosters} teams · updated live
          from Sleeper
        </p>
        <a
          className="btn"
          href="https://docs.google.com/document/d/1iuEKRa91wx7Nz4L9vPwOgguym7tWBaDMGQwTvNIED1g/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          📖 League Rules
        </a>
      </section>

      {/* Test post — for trying out reactions during setup */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="label">🧪 Test Post</div>
        <p style={{ margin: "4px 0 12px" }}>
          A sandbox post for testing reactions. Sign in and try the votes and
          emojis below — hover a reaction to see who reacted.
        </p>
        <ReactionBar postId="test-post" />
      </div>

      {/* Weekly Recap — editable in content/homepage.js */}
      <details className="section recap">
        <summary>📰 Weekly Recap</summary>
        <div className="body">
          <Prose text={weeklyRecap} />
        </div>
      </details>

      {/* Weekly Preview — matchup blurbs + for-fun odds (live from Sleeper) */}
      <details className="section ynn">
        <summary>🔮 Weekly Preview</summary>
        <div className="body">
          <WeeklyPreview />
        </div>
      </details>

      {/* YEET News Network — manually-curated league news (content/homepage.js) */}
      <details className="section news">
        <summary>📡 YEET News Network</summary>
        <div className="body">
          <Prose text={yeetNewsNetwork} />
        </div>
      </details>

      {/* Reigning champion + last place */}
      <div className="grid">
        <div className="card award-champion">
          <div className="label">
            Reigning Champion{awards.season ? ` — ${awards.season}` : ""}
          </div>
          <div className="value">
            <span className="award-emoji">🏆</span>{" "}
            {awards.champion ? awards.champion.team : "—"}
          </div>
          {awards.champion && (
            <div className="sub">{awards.champion.manager}</div>
          )}
        </div>
        <div className="card award-loser">
          <div className="label">
            Burger Bound{awards.season ? ` — ${awards.season}` : ""}
          </div>
          <div className="value">
            <span className="award-emoji">🍔</span>{" "}
            {awards.loser ? awards.loser.team : "—"}
          </div>
          {awards.loser && <div className="sub">{awards.loser.manager}</div>}
        </div>
      </div>

      <h2>Standings</h2>
      <StandingsTabs sets={seasonSets} />
    </>
  );
}
