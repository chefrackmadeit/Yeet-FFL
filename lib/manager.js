// ---------------------------------------------------------------------------
// Manager profile builder — aggregates a single manager's full league history
// from Sleeper: all-time stats, per-season table, and players rostered.
// ---------------------------------------------------------------------------

import {
  getLeague,
  getUsers,
  getRosters,
  getMatchups,
  getSeasonChain,
  usersById,
  teamName,
  avatarUrl,
  pts,
} from "./sleeper";

const BASE = "https://api.sleeper.app/v1";

// ---- Players dictionary (large ~5MB file) -------------------------------
// Cached in module memory so a warm server reuses it instead of re-downloading.
let _players = null;
let _playersTs = 0;
const PLAYERS_TTL = 1000 * 60 * 60 * 24; // 24h

async function getPlayers() {
  if (_players && Date.now() - _playersTs < PLAYERS_TTL) return _players;
  const res = await fetch(`${BASE}/players/nfl`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return _players || {};
  _players = await res.json();
  _playersTs = Date.now();
  return _players;
}

function playerName(players, pid) {
  const p = players[pid];
  if (!p) return pid;
  if (p.full_name) return p.full_name;
  const n = `${p.first_name || ""} ${p.last_name || ""}`.trim();
  return n || pid;
}

function playerPosition(players, pid) {
  const p = players[pid];
  if (p && p.position) return p.position;
  // Team defenses use the team abbreviation as the id (non-numeric).
  if (/[A-Za-z]/.test(pid)) return "DEF";
  return "?";
}

// ---- Playoff placements from the brackets -------------------------------
async function getBracket(leagueId, type) {
  const res = await fetch(`${BASE}/league/${leagueId}/${type}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  return res.json();
}

// Roster ids that appear in the main (winners) playoff bracket — i.e. teams
// that actually made the playoffs (consolation/losers bracket excluded).
async function mainBracketRosters(leagueId) {
  const wb = await getBracket(leagueId, "winners_bracket");
  const set = new Set();
  for (const m of wb) {
    for (const k of ["t1", "t2", "w", "l"]) {
      if (typeof m[k] === "number") set.add(m[k]);
    }
  }
  return set;
}

// Returns { roster_id: finalPlace } using placement ("p") matches.
async function computePlacements(leagueId, playoffTeams) {
  const [winners, losers] = await Promise.all([
    getBracket(leagueId, "winners_bracket"),
    getBracket(leagueId, "losers_bracket"),
  ]);
  const place = {};
  const teams = Number(playoffTeams) || 6;

  for (const m of winners) {
    if (m.p == null || m.w == null || m.l == null) continue;
    place[m.w] = m.p; // winner takes the better (lower) place
    place[m.l] = m.p + 1;
  }
  for (const m of losers) {
    if (m.p == null || m.w == null || m.l == null) continue;
    place[m.w] = teams + m.p; // consolation places start after the playoff teams
    place[m.l] = teams + m.p + 1;
  }
  return place;
}

// ---- Draft rounds -------------------------------------------------------
async function getDraftRoundMap(leagueId, rosterId, userId) {
  const dRes = await fetch(`${BASE}/league/${leagueId}/drafts`, {
    next: { revalidate: 86400 },
  });
  if (!dRes.ok) return {};
  const drafts = await dRes.json();
  const draftId = drafts?.[0]?.draft_id;
  if (!draftId) return {};

  const pRes = await fetch(`${BASE}/draft/${draftId}/picks`, {
    next: { revalidate: 86400 },
  });
  if (!pRes.ok) return {};
  const picks = await pRes.json();

  const map = {};
  for (const pk of picks) {
    const byRoster = String(pk.roster_id) === String(rosterId);
    const byUser = String(pk.picked_by) === String(userId);
    if (byRoster || byUser) map[pk.player_id] = pk.round;
  }
  return map;
}

// ---- Main builder -------------------------------------------------------
export async function buildManagerProfile(userId, startId) {
  const [chain, players] = await Promise.all([
    getSeasonChain(startId),
    getPlayers(),
  ]);

  let identity = null;
  const seasons = [];

  for (const s of chain) {
    const leagueId = s.leagueId;
    const league = s.league;
    const [users, rosters] = await Promise.all([
      getUsers(leagueId),
      getRosters(leagueId),
    ]);
    const uById = usersById(users);
    const roster = rosters.find(
      (r) => String(r.owner_id) === String(userId)
    );
    if (!roster) continue; // manager wasn't in this season

    const user = uById[userId];
    if (!identity && user) {
      identity = {
        userId,
        name: user.display_name,
        team: teamName(user),
        avatar: avatarUrl(user),
      };
    }

    const set = roster.settings || {};
    const rosterId = roster.roster_id;
    const lastWeek =
      Number(league.settings?.last_scored_leg) ||
      Number(league.settings?.leg) ||
      17;

    // Fetch every scored week in parallel.
    const weeks = Array.from({ length: lastWeek }, (_, i) => i + 1);
    const weekData = await Promise.all(
      weeks.map((w) => getMatchups(w, leagueId).catch(() => []))
    );

    const played = []; // { week, points }
    const playerAgg = {}; // pid -> { points, best }
    weekData.forEach((ms, idx) => {
      const mine = ms.find((m) => m.roster_id === rosterId);
      if (!mine || mine.matchup_id == null) return;
      played.push({ week: idx + 1, points: mine.points || 0 });
      const pp = mine.players_points || {};
      for (const [pid, val] of Object.entries(pp)) {
        const a = playerAgg[pid] || (playerAgg[pid] = { points: 0, best: -Infinity });
        a.points += val;
        if (val > a.best) a.best = val;
      }
    });
    const weeklyScores = played.map((p) => p.points);

    const [placements, draftMap] = await Promise.all([
      computePlacements(leagueId, league.settings?.playoff_teams),
      getDraftRoundMap(leagueId, rosterId, userId),
    ]);
    const place = placements[rosterId] ?? null;
    const playoffTeams = Number(league.settings?.playoff_teams) || 6;

    const games = played.length;
    let high = 0, highWeek = null, low = 0, lowWeek = null;
    if (games) {
      let hi = played[0], lo = played[0];
      for (const p of played) {
        if (p.points > hi.points) hi = p;
        if (p.points < lo.points) lo = p;
      }
      high = hi.points; highWeek = hi.week;
      low = lo.points; lowWeek = lo.week;
    }
    const total = weeklyScores.reduce((x, y) => x + y, 0);
    const avg = games ? total / games : 0;

    const playersList = Object.entries(playerAgg)
      .map(([pid, a]) => ({
        id: pid,
        name: playerName(players, pid),
        position: playerPosition(players, pid),
        total: a.points,
        best: a.best === -Infinity ? 0 : a.best,
        round: draftMap[pid] ?? null,
      }))
      .sort((a, b) => b.total - a.total);

    seasons.push({
      season: s.season,
      place,
      playoffTeams,
      madePlayoffs: place != null && place <= playoffTeams,
      wins: set.wins || 0,
      losses: set.losses || 0,
      ties: set.ties || 0,
      pf: pts(set.fpts, set.fpts_decimal),
      pa: pts(set.fpts_against, set.fpts_against_decimal),
      high,
      highWeek,
      low,
      lowWeek,
      avg,
      games,
      players: playersList,
    });
  }

  if (!identity) return null; // unknown manager

  // ---- All-time aggregates ----
  const allTime = {
    wins: 0,
    losses: 0,
    ties: 0,
    totalPoints: 0,
    highestGame: 0,
    highestGameSeason: null,
    highestGameWeek: null,
    lowestGame: Infinity,
    lowestGameSeason: null,
    lowestGameWeek: null,
    playoffAppearances: 0,
    playoffYears: [],
    bestPlace: null,
    bestPlaceSeason: null,
    seasonsPlayed: seasons.length,
    seasonSpan: "",
  };
  for (const s of seasons) {
    allTime.wins += s.wins;
    allTime.losses += s.losses;
    allTime.ties += s.ties;
    allTime.totalPoints += s.pf;
    if (s.games && s.high > allTime.highestGame) {
      allTime.highestGame = s.high;
      allTime.highestGameSeason = s.season;
      allTime.highestGameWeek = s.highWeek;
    }
    if (s.games && s.low < allTime.lowestGame) {
      allTime.lowestGame = s.low;
      allTime.lowestGameSeason = s.season;
      allTime.lowestGameWeek = s.lowWeek;
    }
    if (s.madePlayoffs) {
      allTime.playoffAppearances += 1;
      allTime.playoffYears.push(s.season);
    }
    if (s.place != null && (allTime.bestPlace == null || s.place < allTime.bestPlace)) {
      allTime.bestPlace = s.place;
      allTime.bestPlaceSeason = s.season;
    }
  }
  if (allTime.lowestGame === Infinity) allTime.lowestGame = 0;

  // Season span (seasons are newest-first) and sorted playoff years.
  const yrs = seasons.map((s) => s.season);
  allTime.seasonSpan =
    yrs.length === 0
      ? ""
      : yrs.length === 1
      ? yrs[0]
      : `${yrs[yrs.length - 1]}–${yrs[0]}`;
  allTime.playoffYears.sort();
  const g = allTime.wins + allTime.losses + allTime.ties;
  allTime.winPct = g ? allTime.wins / g : 0;

  return { ...identity, allTime, seasons };
}

// ---------------------------------------------------------------------------
// Head-to-head: league-wide per-manager stats, split into regular-season and
// all-time (regular + playoffs). Computed once from matchup + transaction
// history so any two managers can be compared.
// ---------------------------------------------------------------------------
async function getTransactions(week, leagueId) {
  const res = await fetch(`${BASE}/league/${leagueId}/transactions/${week}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function buildHeadToHeadData(startId = LEAGUE_ID) {
  const chain = await getSeasonChain(startId);
  const managers = {}; // userId -> identity (most recent)
  const stats = {}; // userId -> { regular, all }

  const blank = () => ({
    games: 0, wins: 0, losses: 0, ties: 0,
    pointsFor: 0, bestWin: 0, worstLoss: 0, waivers: 0,
  });
  const slot = (uid) => (stats[uid] || (stats[uid] = { regular: blank(), all: blank() }));

  for (const s of chain) {
    const leagueId = s.leagueId;
    const league = s.league;
    const [users, rosters] = await Promise.all([
      getUsers(leagueId),
      getRosters(leagueId),
    ]);
    const uById = usersById(users);
    const rosterToUser = {};
    for (const r of rosters) {
      rosterToUser[r.roster_id] = r.owner_id;
      const u = uById[r.owner_id];
      if (u && !managers[u.user_id]) {
        managers[u.user_id] = {
          userId: u.user_id,
          name: u.display_name,
          team: teamName(u),
          avatar: avatarUrl(u),
        };
      }
    }

    const playoffStart = Number(league.settings?.playoff_week_start) || 15;
    const lastWeek =
      Number(league.settings?.last_scored_leg) ||
      Number(league.settings?.leg) || 17;
    const weeks = Array.from({ length: lastWeek }, (_, i) => i + 1);

    const [weekData, txData] = await Promise.all([
      Promise.all(weeks.map((w) => getMatchups(w, leagueId).catch(() => []))),
      Promise.all(weeks.map((w) => getTransactions(w, leagueId).catch(() => []))),
    ]);

    // matchup results
    weekData.forEach((ms, idx) => {
      const isReg = idx + 1 < playoffStart;
      const groups = {};
      for (const m of ms) {
        if (m.matchup_id == null) continue;
        (groups[m.matchup_id] = groups[m.matchup_id] || []).push(m);
      }
      const record = (me, opp) => {
        const uid = rosterToUser[me.roster_id];
        if (!uid) return;
        const margin = (me.points || 0) - (opp.points || 0);
        const apply = (b) => {
          b.games++;
          b.pointsFor += me.points || 0;
          if (margin > 0) b.wins++;
          else if (margin < 0) b.losses++;
          else b.ties++;
          if (margin > b.bestWin) b.bestWin = margin;
          if (-margin > b.worstLoss) b.worstLoss = -margin;
        };
        const st = slot(uid);
        apply(st.all);
        if (isReg) apply(st.regular);
      };
      for (const pair of Object.values(groups)) {
        if (pair.length !== 2) continue;
        record(pair[0], pair[1]);
        record(pair[1], pair[0]);
      }
    });

    // waiver / free-agent moves
    txData.forEach((txs, idx) => {
      const isReg = idx + 1 < playoffStart;
      for (const t of txs || []) {
        if (t.status !== "complete") continue;
        if (t.type !== "waiver" && t.type !== "free_agent") continue;
        if (!t.adds) continue; // count pickups only, not pure drops
        for (const rid of t.roster_ids || []) {
          const uid = rosterToUser[rid];
          if (!uid) continue;
          const st = slot(uid);
          st.all.waivers++;
          if (isReg) st.regular.waivers++;
        }
      }
    });
  }

  for (const uid in stats) {
    for (const key of ["regular", "all"]) {
      const b = stats[uid][key];
      b.winPct = b.games ? b.wins / b.games : 0;
      b.avgPoints = b.games ? b.pointsFor / b.games : 0;
    }
  }

  const managerList = Object.values(managers).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  return { managers: managerList, stats };
}

// ---------------------------------------------------------------------------
// The Archives: one big pass over all seasons producing the Record Book,
// per-year regular/playoff stats, schedules, champions, and all-time totals.
// ---------------------------------------------------------------------------
export async function buildArchives(startId = LEAGUE_ID) {
  const [chain, players] = await Promise.all([
    getSeasonChain(startId),
    getPlayers(),
  ]);

  const managers = {};
  const perYear = {};
  const champions = [];
  const rec = {
    bestRegSeason: null,
    highestGame: null,
    lowestGame: null,
    largestMargin: null,
    bestPlayer: null,
    mostWaivers: null,
    bestWinStreak: null,
    worstLossStreak: null,
  };

  for (const s of chain) {
    const leagueId = s.leagueId;
    const league = s.league;
    const year = s.season;
    const [users, rosters] = await Promise.all([
      getUsers(leagueId),
      getRosters(leagueId),
    ]);
    const uById = usersById(users);
    const rUser = {}, rTeam = {}, rMgr = {}, rAvatar = {};
    for (const r of rosters) {
      const u = uById[r.owner_id];
      rUser[r.roster_id] = r.owner_id;
      rTeam[r.roster_id] = teamName(u);
      rMgr[r.roster_id] = u?.display_name || "Unknown";
      rAvatar[r.roster_id] = avatarUrl(u);
      if (u && !managers[u.user_id]) {
        managers[u.user_id] = {
          userId: u.user_id,
          name: u.display_name,
          team: teamName(u),
          avatar: avatarUrl(u),
        };
      }
    }

    const playoffStart = Number(league.settings?.playoff_week_start) || 15;
    const lastWeek =
      Number(league.settings?.last_scored_leg) ||
      Number(league.settings?.leg) || 17;
    const playoffTeams = Number(league.settings?.playoff_teams) || 6;
    const [placements, madePlayoffs] = await Promise.all([
      computePlacements(leagueId, playoffTeams),
      mainBracketRosters(leagueId),
    ]);

    const weeks = Array.from({ length: lastWeek }, (_, i) => i + 1);
    const [weekData, txData] = await Promise.all([
      Promise.all(weeks.map((w) => getMatchups(w, leagueId).catch(() => []))),
      Promise.all(weeks.map((w) => getTransactions(w, leagueId).catch(() => []))),
    ]);

    const reg = {}, ply = {}, seq = {}, wc = {}, schedule = {};
    const acc = (o, rid) =>
      o[rid] || (o[rid] = { games: 0, wins: 0, losses: 0, ties: 0, pf: 0, pa: 0, high: null, low: null });

    weekData.forEach((ms, idx) => {
      const week = idx + 1;
      const isReg = week < playoffStart;
      const groups = {};
      for (const m of ms) {
        if (m.matchup_id == null) continue;
        (groups[m.matchup_id] = groups[m.matchup_id] || []).push(m);
      }
      for (const pair of Object.values(groups)) {
        if (pair.length !== 2) continue;
        const [a, b] = pair;
        for (const m of pair) {
          const rid = m.roster_id, pts = m.points || 0;
          if (!rec.highestGame || pts > rec.highestGame.value)
            rec.highestGame = { value: pts, manager: rMgr[rid], team: rTeam[rid], userId: rUser[rid], year, week };
          if (!rec.lowestGame || pts < rec.lowestGame.value)
            rec.lowestGame = { value: pts, manager: rMgr[rid], team: rTeam[rid], userId: rUser[rid], year, week };
          for (const [pid, val] of Object.entries(m.players_points || {})) {
            if (!rec.bestPlayer || val > rec.bestPlayer.points)
              rec.bestPlayer = { points: val, player: playerName(players, pid), position: playerPosition(players, pid), manager: rMgr[rid], team: rTeam[rid], userId: rUser[rid], year, week };
          }
        }
        const aP = a.points || 0, bP = b.points || 0;
        const win = aP >= bP ? a : b, lose = aP >= bP ? b : a;
        const margin = Math.abs(aP - bP);
        if (margin > 0 && (!rec.largestMargin || margin > rec.largestMargin.margin))
          rec.largestMargin = { margin, winnerTeam: rTeam[win.roster_id], loserTeam: rTeam[lose.roster_id], winnerScore: Math.max(aP, bP), loserScore: Math.min(aP, bP), year, week };

        const play = (me, opp) => {
          const rid = me.roster_id, mp = me.points || 0, op = opp.points || 0;
          const x = acc(isReg ? reg : ply, rid);
          x.games++; x.pf += mp; x.pa += op;
          const r = mp > op ? "W" : mp < op ? "L" : "T";
          if (r === "W") x.wins++; else if (r === "L") x.losses++; else x.ties++;
          if (x.high == null || mp > x.high) x.high = mp;
          if (x.low == null || mp < x.low) x.low = mp;
          (seq[rid] = seq[rid] || []).push(r);
        };
        play(a, b); play(b, a);

        if (isReg) {
          (schedule[week] = schedule[week] || []).push({
            teamA: rTeam[a.roster_id], scoreA: aP,
            teamB: rTeam[b.roster_id], scoreB: bP,
          });
        }
      }
    });

    txData.forEach((txs) => {
      for (const t of txs || []) {
        if (t.status !== "complete") continue;
        if (t.type !== "waiver" && t.type !== "free_agent") continue;
        if (!t.adds) continue;
        for (const rid of t.roster_ids || []) wc[rid] = (wc[rid] || 0) + 1;
      }
    });
    for (const rid in wc) {
      if (!rec.mostWaivers || wc[rid] > rec.mostWaivers.count)
        rec.mostWaivers = { count: wc[rid], manager: rMgr[rid], team: rTeam[rid], userId: rUser[rid], year };
    }

    for (const rid in seq) {
      let cw = 0, mw = 0, cl = 0, ml = 0;
      for (const r of seq[rid]) {
        if (r === "W") { cw++; mw = Math.max(mw, cw); cl = 0; }
        else if (r === "L") { cl++; ml = Math.max(ml, cl); cw = 0; }
        else { cw = 0; cl = 0; }
      }
      if (!rec.bestWinStreak || mw > rec.bestWinStreak.len)
        rec.bestWinStreak = { len: mw, manager: rMgr[rid], team: rTeam[rid], userId: rUser[rid], year };
      if (!rec.worstLossStreak || ml > rec.worstLossStreak.len)
        rec.worstLossStreak = { len: ml, manager: rMgr[rid], team: rTeam[rid], userId: rUser[rid], year };
    }

    for (const rid in reg) {
      const x = reg[rid];
      if (!x.games) continue;
      const wp = x.wins / x.games;
      if (!rec.bestRegSeason || wp > rec.bestRegSeason.winPct)
        rec.bestRegSeason = { winPct: wp, wins: x.wins, losses: x.losses, ties: x.ties, manager: rMgr[rid], team: rTeam[rid], userId: rUser[rid], year };
    }

    const mkRows = (o, onlyPlayoff) =>
      rosters.map((r) => {
        const rid = r.roster_id, x = o[rid];
        const base = { userId: rUser[rid], team: rTeam[rid], manager: rMgr[rid], avatar: rAvatar[rid] };
        if (onlyPlayoff && !madePlayoffs.has(rid)) return { ...base, na: true };
        if (!x || !x.games) return { ...base, na: !!onlyPlayoff, games: 0, wins: 0, losses: 0, ties: 0, winPct: 0, pf: 0, pa: 0, avg: 0, high: 0, low: 0 };
        return { ...base, na: false, games: x.games, wins: x.wins, losses: x.losses, ties: x.ties, winPct: x.wins / x.games, pf: x.pf, pa: x.pa, avg: x.pf / x.games, high: x.high || 0, low: x.low || 0 };
      });

    perYear[year] = {
      regular: mkRows(reg, false),
      playoff: mkRows(ply, true),
      schedule,
      regularWeeks: Object.keys(schedule).map(Number).sort((a, b) => a - b),
    };

    // champion / last place from placements
    const champRid = Object.entries(placements).find(([, p]) => p === 1)?.[0];
    const lastRid = Object.entries(placements).sort((a, b) => b[1] - a[1])[0]?.[0];
    champions.push({
      year,
      champion: champRid ? { team: rTeam[champRid], manager: rMgr[champRid], userId: rUser[champRid] } : null,
      last: lastRid ? { team: rTeam[lastRid], manager: rMgr[lastRid], userId: rUser[lastRid] } : null,
    });
  }

  const aggregate = (which) => {
    const m = {};
    for (const year in perYear) {
      for (const row of perYear[year][which]) {
        if (row.na) continue;
        const t = m[row.userId] || (m[row.userId] = { userId: row.userId, team: row.team, manager: row.manager, avatar: row.avatar, games: 0, wins: 0, losses: 0, ties: 0, pf: 0, pa: 0, high: 0, low: null });
        t.games += row.games || 0; t.wins += row.wins || 0; t.losses += row.losses || 0; t.ties += row.ties || 0; t.pf += row.pf || 0; t.pa += row.pa || 0;
        if ((row.high || 0) > t.high) t.high = row.high || 0;
        if (row.low != null && row.games && (t.low == null || row.low < t.low)) t.low = row.low;
      }
    }
    return Object.values(m).map((t) => ({ ...t, low: t.low == null ? 0 : t.low, winPct: t.games ? t.wins / t.games : 0, avg: t.games ? t.pf / t.games : 0 }));
  };

  return {
    seasons: chain.map((s) => s.season),
    managers: Object.values(managers).sort((a, b) => a.name.localeCompare(b.name)),
    recordBook: rec,
    champions,
    perYear,
    allTime: { regular: aggregate("regular"), playoff: aggregate("playoff") },
  };
}

// Ordinal helper (1 -> 1st, 2 -> 2nd, ...)
export function ordinal(n) {
  if (n == null) return "—";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
