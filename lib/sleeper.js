// ---------------------------------------------------------------------------
// Sleeper API data layer
// ---------------------------------------------------------------------------
// The Sleeper API is public and read-only (no key needed). Docs: docs.sleeper.com
// To point this site at a different league (e.g. a new season), change LEAGUE_ID.
// ---------------------------------------------------------------------------

// Fallback / anchor league (the 2025 YEET FFL season). Used if the automatic
// current-season lookup ever fails, and as the reference point for identifying
// which of a user's leagues is the YEET league.
export const LEAGUE_ID = "1255585509246259200";
export const ANCHOR_LEAGUE_ID = LEAGUE_ID;

// The league auto-rollover is anchored to a manager who stays in the league
// every year, so the site always follows YEET FFL into each new season.
// UncleZaddy4 (Glizzard Wizards).
export const USER_ID = "993296992803647488";

// Former managers no longer in the league — hidden everywhere on the site.
const EXCLUDED_IDS = new Set([
  "993557703488221184", // nocon7
  "994770614504218624", // jojodacircusboy
]);
const EXCLUDED_NAMES = new Set(["nocon7", "jojodacircusboy"]);
export function isExcludedManager(userId, name) {
  return EXCLUDED_IDS.has(String(userId)) || (name != null && EXCLUDED_NAMES.has(name));
}

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

// All leagues a user is in for a given NFL season.
export const getUserLeagues = (season, userId = USER_ID) =>
  get(`/user/${userId}/leagues/nfl/${season}`);

// ---------------------------------------------------------------------------
// Auto-rollover: find the newest YEET league for our anchored user so the site
// follows the league into each new season with no code changes.
//   - In-season: returns the current season's league.
//   - Offseason (next season not created yet): returns the most recent season.
//   - On any failure: falls back to ANCHOR_LEAGUE_ID so the site never breaks.
// ---------------------------------------------------------------------------

// Does this league's season chain trace back to our known YEET league? This
// identifies the right league even if its name changes in a future season.
async function chainReachesAnchor(league) {
  let cur = league;
  for (let i = 0; i < 30 && cur; i++) {
    if (String(cur.league_id) === String(ANCHOR_LEAGUE_ID)) return true;
    if (!cur.previous_league_id) return false;
    try {
      cur = await getLeague(cur.previous_league_id);
    } catch {
      return false;
    }
  }
  return false;
}

// From a user's leagues for one season, pick the one that is YEET FFL.
async function pickYeetLeague(leagues) {
  if (!Array.isArray(leagues) || leagues.length === 0) return null;

  // 1) Direct match on the anchor id, or a direct child of it (next season).
  const direct = leagues.find(
    (l) =>
      String(l.league_id) === String(ANCHOR_LEAGUE_ID) ||
      String(l.previous_league_id) === String(ANCHOR_LEAGUE_ID)
  );
  if (direct) return direct;

  // 2) Unambiguous name match.
  const byName = leagues.filter(
    (l) => (l.name || "").trim().toUpperCase() === "YEET FFL"
  );
  if (byName.length === 1) return byName[0];

  // 3) Follow each candidate's chain back to the anchor (handles renames /
  //    seasons far in the future). Prefer name matches first if several exist.
  for (const l of byName.length ? byName : leagues) {
    if (await chainReachesAnchor(l)) return l;
  }
  return null;
}

export async function getCurrentLeagueId() {
  try {
    const state = await getNflState();
    // Try the current season first, then the previous one (covers the
    // offseason gap before the new league has been created).
    const seasons = [state.season, state.previous_season].filter(Boolean);
    for (const season of seasons) {
      let leagues = [];
      try {
        leagues = await getUserLeagues(season);
      } catch {
        leagues = [];
      }
      const match = await pickYeetLeague(leagues);
      if (match) return match.league_id;
    }
  } catch {
    // fall through to the anchor
  }
  return ANCHOR_LEAGUE_ID;
}

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
      userId: r.owner_id,
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

  rows.forEach((row) => {
    const games = row.wins + row.losses + row.ties;
    row.winPct = games ? row.wins / games : 0;
  });
  rows.sort((a, b) => b.wins - a.wins || b.pointsFor - a.pointsFor);
  rows.forEach((row, i) => (row.rank = i + 1));
  return rows;
}

// ---------------------------------------------------------------------------
// Standings for every season in the league history (newest first), each tagged
// with its champion roster and last-place roster for trophy/burger markers.
// ---------------------------------------------------------------------------
export async function getSeasonStandingsSets(startId = LEAGUE_ID) {
  const chain = await getSeasonChain(startId);
  const sets = [];
  for (const s of chain) {
    const rows = await getStandings(s.leagueId);
    sets.push({
      season: s.season,
      leagueId: s.leagueId,
      isCurrent: s.leagueId === chain[0].leagueId,
      champRosterId: s.championRosterId,
      loserRosterId: rows.length ? rows[rows.length - 1].rosterId : null,
      rows,
    });
  }
  return sets;
}

// ---------------------------------------------------------------------------
// Reigning awards: the champion and last-place ("Burger Bound") from the most
// recent COMPLETED season. Works in the offseason and mid-next-season alike.
// ---------------------------------------------------------------------------
export async function getReigningAwards(startId = LEAGUE_ID) {
  const chain = await getSeasonChain(startId);
  for (const s of chain) {
    if (!s.championRosterId) continue; // season not finished / no winner recorded
    const standings = await getStandings(s.leagueId);
    const champ = standings.find(
      (r) => String(r.rosterId) === String(s.championRosterId)
    );
    const loser = standings[standings.length - 1]; // worst record
    return {
      season: s.season,
      champion: champ
        ? { team: champ.team, manager: champ.manager, avatar: champ.avatar }
        : null,
      loser: loser
        ? { team: loser.team, manager: loser.manager, avatar: loser.avatar }
        : null,
    };
  }
  return { season: null, champion: null, loser: null };
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
export async function getAllTimeStats(startId = LEAGUE_ID) {
  const chain = await getSeasonChain(startId);

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
