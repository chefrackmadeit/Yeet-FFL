// ---------------------------------------------------------------------------
// Sleeper API data layer
// ---------------------------------------------------------------------------
// The Sleeper API is public and read-only (no key needed). Docs: docs.sleeper.com
// To point this site at a different league (e.g. a new season), change LEAGUE_ID.
// ---------------------------------------------------------------------------

export const LEAGUE_ID = "1255585509246259200"; // YEET FFL (current)

const BASE = "https://api.sleeper.app/v1";

// Fetch helper. Cached for 1 hour so we don't hammer the API on every request.
async function get(path) {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Sleeper API ${path} -> ${res.status}`);
  return res.json();
}

export const getNflState = () => get("/state/nfl");
export const getLeague = (id = LEAGUE_ID) => get(`/league/${id}`);
export const getUsers = (id = LEAGUE_ID) => get(`/league/${id}/users`);
export const getRosters = (id = LEAGUE_ID) => get(`/league/${id}/rosters`);
export const getMatchups = (week, id = LEAGUE_ID) =>
  get(`/league/${id}/matchups/${week}`);

// Combine Sleeper's separate integer + decimal point fields into one number.
export function pts(whole, decimal) {
  return Number(whole || 0) + Number(decimal || 0) / 100;
}

// Turn a users array into a quick lookup by user_id.
export function usersById(users) {
  const map = {};
  for (const u of users) map[u.user_id] = u;
  return map;
}

// A friendly team name for a user (falls back to their handle).
export function teamName(user) {
  return user?.metadata?.team_name || user?.display_name || "Unknown Team";
}

// Full avatar URL for a user, or null.
export function avatarUrl(user) {
  const a = user?.metadata?.avatar;
  if (a) return a; // already a full URL
  if (user?.avatar) return `https://sleepercdn.com/avatars/thumbs/${user.avatar}`;
  return null;
}

// ---------------------------------------------------------------------------
// Standings: merge rosters + users, sort by wins then points-for.
// ---------------------------------------------------------------------------
export async function getStandings(id = LEAGUE_ID) {
  const [rosters, users] = await Promise.all([getRosters(id), getUsers(id)]);
  const uById = usersById(users);

  const rows = rosters.map((r) => {
    const user = uById[r.owner_id];
    const s = r.settings || {};
    return {
      rosterId: r.roster_id,
      team: teamName(user),
      manager: user?.display_name || "Unknown",
      avatar: avatarUrl(user),
      wins: s.wins || 0,
      losses: s.losses || 0,
      ties: s.ties || 0,
      pointsFor: pts(s.fpts, s.fpts_decimal),
      pointsAgainst: pts(s.fpts_against, s.fpts_against_decimal),
      streak: r.metadata?.streak || "",
    };
  });

  rows.sort((a, b) => b.wins - a.wins || b.pointsFor - a.pointsFor);
  rows.forEach((row, i) => (row.rank = i + 1));
  return rows;
}

// ---------------------------------------------------------------------------
// Season history: follow previous_league_id back through every past season.
// Returns newest-first: [{ season, leagueId, league, championRosterId }]
// ---------------------------------------------------------------------------
export async function getSeasonChain(id = LEAGUE_ID) {
  const chain = [];
  let currentId = id;
  // Guard against unexpected loops.
  for (let i = 0; i < 30 && currentId; i++) {
    const league = await getLeague(currentId);
    chain.push({
      season: league.season,
      leagueId: currentId,
      league,
      championRosterId: league.metadata?.latest_league_winner_roster_id || null,
    });
    currentId = league.previous_league_id;
  }
  return chain;
}

// ---------------------------------------------------------------------------
// All-time records: aggregate wins/losses/points across every season, keyed
// by user_id (so it follows a manager even if their team name changes).
// ---------------------------------------------------------------------------
export async function getAllTimeStats() {
  const chain = await getSeasonChain();

  const managers = {}; // user_id -> aggregate
  const seasons = []; // per-season summary (champion, etc.)

  for (const { season, leagueId, championRosterId } of chain) {
    const [rosters, users] = await Promise.all([
      getRosters(leagueId),
      getUsers(leagueId),
    ]);
    const uById = usersById(users);

    let champion = null;
    for (const r of rosters) {
      const s = r.settings || {};
      const user = uById[r.owner_id];
      if (!user) continue;

      const m =
        managers[user.user_id] ||
        (managers[user.user_id] = {
          userId: user.user_id,
          name: user.display_name,
          team: teamName(user),
          avatar: avatarUrl(user),
          wins: 0,
          losses: 0,
          ties: 0,
          pointsFor: 0,
          seasons: 0,
          titles: 0,
        });

      m.wins += s.wins || 0;
      m.losses += s.losses || 0;
      m.ties += s.ties || 0;
      m.pointsFor += pts(s.fpts, s.fpts_decimal);
      m.seasons += 1;
      // Keep the most recent team name / avatar (chain is newest-first).
      if (m.seasons === 1) {
        m.team = teamName(user);
        m.avatar = avatarUrl(user);
      }

      if (String(r.roster_id) === String(championRosterId)) {
        champion = { team: teamName(user), manager: user.display_name };
        m.titles += 1;
      }
    }

    seasons.push({ season, leagueId, champion });
  }

  const table = Object.values(managers).sort(
    (a, b) => b.wins - a.wins || b.pointsFor - a.pointsFor
  );
  table.forEach((row) => {
    const games = row.wins + row.losses + row.ties;
    row.winPct = games ? row.wins / games : 0;
  });

  return { table, seasons };
}
