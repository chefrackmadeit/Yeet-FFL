import {
  getLeague,
  getStandings,
  getReigningAwards,
  getCurrentLeagueId,
} from "@/lib/sleeper";
import SortableStandings from "./components/SortableStandings";
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
  const [league, standings, awards] = await Promise.all([
    getLeague(currentId),
    getStandings(currentId),
    getReigningAwards(currentId),
  ]);

  return (
    <>
      <section className="hero">
        <h1>{league.name}</h1>
        <p>
          {league.season} season · {league.total_rosters} teams · updated live
          from Sleeper
        </p>
        <a className="btn" href="/YEET-FFL-Guidelines.pdf" target="_blank" rel="noopener noreferrer">
          📖 League Rules
        </a>
      </section>

      {/* Weekly Recap — editable in content/homepage.js */}
      <details className="section recap" open>
        <summary>📰 Weekly Recap</summary>
        <div className="body">
          <Prose text={weeklyRecap} />
        </div>
      </details>

      {/* Yeet News Network — editable in content/homepage.js */}
      <details className="section ynn" open>
        <summary>📡 Yeet News Network</summary>
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
      <SortableStandings rows={standings} />
      <p className="sub" style={{ marginTop: 12 }}>
        Click any column header to sort. PF = points for · PA = points against.
      </p>
    </>
  );
}
