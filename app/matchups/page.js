import {
  getLeague,
  getNflState,
  getMatchups,
  getRosters,
  getUsers,
  usersById,
  teamName,
  LEAGUE_ID,
} from "@/lib/sleeper";

export const dynamic = "force-dynamic";

export const metadata = { title: "Matchups · YEET FFL" };

// Build a list of head-to-head matchups for a given week.
async function buildWeek(week, leagueId = LEAGUE_ID) {
  const [matchups, rosters, users] = await Promise.all([
    getMatchups(week, leagueId),
    getRosters(leagueId),
    getUsers(leagueId),
  ]);
  const uById = usersById(users);
  const teamByRoster = {};
  for (const r of rosters) {
    teamByRoster[r.roster_id] = teamName(uById[r.owner_id]);
  }

  const groups = {};
  for (const m of matchups) {
    if (m.matchup_id == null) continue;
    (groups[m.matchup_id] = groups[m.matchup_id] || []).push({
      team: teamByRoster[m.roster_id] || `Roster ${m.roster_id}`,
      points: m.points || 0,
    });
  }

  return Object.values(groups).map((pair) => {
    pair.sort((a, b) => b.points - a.points);
    return pair;
  });
}

export default async function MatchupsPage() {
  const [league, state] = await Promise.all([getLeague(), getNflState()]);

  // Which week to show: live NFL week if in season, otherwise the last
  // scored week of this league (so the page is never empty in the offseason).
  const liveWeek = Number(state.week) || 0;
  const lastScored = Number(league.settings?.last_scored_leg) || 0;
  const week = liveWeek > 0 ? liveWeek : lastScored;
  const offseason = liveWeek === 0;

  let games = [];
  if (week > 0) {
    try {
      games = await buildWeek(week);
    } catch {
      games = [];
    }
  }

  return (
    <>
      <h2>
        {offseason ? "Latest Results" : "Matchups"} — Week {week || "—"}
      </h2>

      {offseason && (
        <div className="notice" style={{ marginBottom: 20 }}>
          It's the offseason. Showing the final scored week of the{" "}
          {league.season} season. Live weekly matchups and previews will appear
          here automatically once games kick off.
        </div>
      )}

      {games.length === 0 ? (
        <div className="notice">No matchup data available yet.</div>
      ) : (
        games.map((pair, i) => (
          <div className="matchup" key={i}>
            {pair.map((t, j) => (
              <div
                className={"matchup-row" + (j === 0 ? " winner" : "")}
                key={j}
              >
                <span>{t.team}</span>
                <span className="num">{t.points.toFixed(1)}</span>
              </div>
            ))}
          </div>
        ))
      )}
    </>
  );
}
