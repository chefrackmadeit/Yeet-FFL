// Server component: builds the Weekly Preview — a short blurb + fun odds for
// each of the upcoming week's matchups. In the offseason it shows the intro
// text ("Matchups are coming"). Projections come from each team's CURRENT set
// lineup (with a best-lineup fallback if a manager hasn't set one), so the
// odds reflect the upcoming week and update themselves as lineups change.

import {
  getCurrentLeagueId,
  getNflState,
  getLeague,
  getUsers,
  getRosters,
  getMatchups,
  getWeekProjections,
  projectionMaps,
  teamProjection,
  usersById,
  teamName,
} from "@/lib/sleeper";
import { winProbability, americanOdds } from "@/lib/odds";
import { weeklyPreview, matchupBlurbs } from "@/content/homepage";
import ReactionBar from "./ReactionBar";

function paras(text) {
  return String(text)
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default async function WeeklyPreview() {
  const id = await getCurrentLeagueId();
  const [state, league] = await Promise.all([getNflState(), getLeague(id)]);
  const week = Number(state.week) || 0;
  const inSeason =
    week > 0 && state.season_type !== "off" && league.status !== "complete";

  if (!inSeason) {
    return (
      <>
        {paras(weeklyPreview).map((p, i) => (
          <p key={i} style={{ margin: i === 0 ? "0 0 10px" : "10px 0" }}>
            {p}
          </p>
        ))}
      </>
    );
  }

  const [users, rosters, matchups, projections] = await Promise.all([
    getUsers(id),
    getRosters(id),
    getMatchups(week, id),
    getWeekProjections(league.season, week).catch(() => []),
  ]);

  const uById = usersById(users);
  const { pts, pos } = projectionMaps(projections, league.scoring_settings?.rec ?? 0);

  // roster_id -> { team, projected points for the week }
  const info = {};
  for (const r of rosters) {
    info[r.roster_id] = {
      team: teamName(uById[r.owner_id]),
      proj: teamProjection(r, pts, pos, league.roster_positions),
    };
  }

  // group matchup entries into pairs
  const groups = {};
  for (const m of matchups) {
    if (m.matchup_id == null) continue;
    (groups[m.matchup_id] = groups[m.matchup_id] || []).push(m.roster_id);
  }

  const games = Object.entries(groups)
    .filter(([, ids]) => ids.length === 2)
    .map(([mid, ids]) => {
      const A = info[ids[0]] || { team: "TBD", proj: 0 };
      const B = info[ids[1]] || { team: "TBD", proj: 0 };
      // higher projection listed first
      const [hi, lo] = A.proj >= B.proj ? [A, B] : [B, A];
      const pHi = winProbability(hi.proj, lo.proj);
      const blurb = matchupBlurbs[`${week}:${mid}`];
      return { mid, hi, lo, pHi, pLo: 1 - pHi, blurb };
    });

  if (!games.length) {
    return <p style={{ margin: 0 }}>{weeklyPreview}</p>;
  }

  return (
    <>
      <p className="sub" style={{ marginTop: 0 }}>
        Week {week} · projected from set lineups · odds are just for fun.
      </p>
      {games.map((g) => (
        <div className="preview-card" key={g.mid}>
          <div className="preview-desc">
            {g.blurb ||
              `${g.hi.team} projects for ${g.hi.proj.toFixed(1)} vs ${g.lo.team} at ${g.lo.proj.toFixed(1)} — ${g.hi.team} favored.`}
          </div>
          <div className="preview-odds">
            <div className="odds-side">
              <span className="odds-team">{g.hi.team}</span>
              <span className="odds-proj muted">Proj {g.hi.proj.toFixed(1)}</span>
              <span className="odds-line">{americanOdds(g.pHi)}</span>
            </div>
            <div className="odds-vs">vs</div>
            <div className="odds-side">
              <span className="odds-team">{g.lo.team}</span>
              <span className="odds-proj muted">Proj {g.lo.proj.toFixed(1)}</span>
              <span className="odds-line">{americanOdds(g.pLo)}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Emotes + comments for the week's preview — same system as the Weekly
          Review / YEET News posts, keyed per NFL week so each week is its own
          thread (matches the preview's notification id). */}
      <div className="preview-reactions">
        <ReactionBar postId={`wp-week-${week}`} />
      </div>
    </>
  );
}
