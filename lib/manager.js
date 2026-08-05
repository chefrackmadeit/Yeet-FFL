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
  getNflState,
  regularSeasonDone,
  usersById,
  teamName,
  avatarUrl,
  pts,
  isExcludedManager,
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
// totalTeams = number of rosters that season (varies, e.g. 10 vs 12).
async function computePlacements(leagueId, playoffTeams, totalTeams) {
  const [winners, losers] = await Promise.all([
    getBracket(leagueId, "winners_bracket"),
    getBracket(leagueId, "losers_bracket"),
  ]);
  const place = {};
  const N = Number(totalTeams) || (Number(playoffTeams) || 6) * 2;

  // Winners bracket: p=1 winner is champion (1st), its loser 2nd, etc.
  for (const m of winners) {
    if (m.p == null || m.w == null || m.l == null) continue;
    place[m.w] = m.p;
    place[m.l] = m.p + 1;
  }
  // Losers bracket is a TOILET BOWL — winning it means you finished LAST.
  // p=1 winner => last (Nth), its loser => N-1; p=3 => N-2 / N-3; etc.
  for (const m of losers) {
    if (m.p == null || m.w == null || m.l == null) continue;
    place[m.w] = N - (m.p - 1);
    place[m.l] = N - m.p;
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

// Draft order (user -> slot) and all picks for a league's draft.
async function getDraft(leagueId) {
  const dRes = await fetch(`${BASE}/league/${leagueId}/drafts`, {
    next: { revalidate: 86400 },
  });
  if (!dRes.ok) return { slotByUser: {}, picks: [] };
  const drafts = await dRes.json();
  const d = drafts?.[0];
  if (!d) return { slotByUser: {}, picks: [] };
  const pRes = await fetch(`${BASE}/draft/${d.draft_id}/picks`, {
    next: { revalidate: 86400 },
  });
  const picks = pRes.ok ? await pRes.json() : [];
  return { slotByUser: d.draft_order || {}, picks };
}

// ---- Main builder -------------------------------------------------------
export async function buildManagerProfile(userId, startId) {
  if (isExcludedManager(userId, null)) return null; // former manager
  const [chain, players] = await Promise.all([
    getSeasonChain(startId),
    getPlayers(),
  ]);

  let identity = null;
  const seasons = [];
  const draftPerYear = [];
  const tendency = {}; // round -> { position -> count }
  let maxRound = 0;
  const playerRows = []; // { playerId, name, position, year, acq, starts, points, best }
  const h2h = {}; // opponentUserId -> head-to-head aggregate

  for (const s of chain) {
    const leagueId = s.leagueId;
    const league = s.league;
    const [users, rosters] = await Promise.all([
      getUsers(leagueId),
      getRosters(leagueId),
    ]);
    const uById = usersById(users);
    const rosterUser = {};
    for (const r of rosters) rosterUser[r.roster_id] = r.owner_id;
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
    const playoffStart = Number(league.settings?.playoff_week_start) || 15;
    const lastWeek =
      Number(league.settings?.last_scored_leg) ||
      Number(league.settings?.leg) ||
      17;
    const weeks = Array.from({ length: lastWeek }, (_, i) => i + 1);

    const [weekData, txData, draft, placements, mainBracket] = await Promise.all([
      Promise.all(weeks.map((w) => getMatchups(w, leagueId).catch(() => []))),
      Promise.all(weeks.map((w) => getTransactions(w, leagueId).catch(() => []))),
      getDraft(leagueId),
      computePlacements(leagueId, league.settings?.playoff_teams, league.total_rosters),
      mainBracketRosters(leagueId),
    ]);

    // draft picks + tendencies for this manager
    const draftedSet = new Set();
    const myPicks = [];
    for (const pk of draft.picks) {
      const mine =
        String(pk.roster_id) === String(rosterId) ||
        String(pk.picked_by) === String(userId);
      if (!mine) continue;
      draftedSet.add(String(pk.player_id));
      const pos = playerPosition(players, pk.player_id);
      myPicks.push({ round: pk.round, player: playerName(players, pk.player_id), position: pos });
      tendency[pk.round] = tendency[pk.round] || {};
      tendency[pk.round][pos] = (tendency[pk.round][pos] || 0) + 1;
      if (pk.round > maxRound) maxRound = pk.round;
    }
    myPicks.sort((a, b) => a.round - b.round);
    const slot = draft.slotByUser?.[String(userId)] ?? null;
    draftPerYear.push({ season: s.season, slot, picks: myPicks });

    // matchup pass — game scores, opponent points, player points + starts
    const played = [];
    const pAgg = {}; // pid -> { points, best, starts }
    let paHigh = -1, paHighWeek = null;
    weekData.forEach((ms, idx) => {
      const mine = ms.find((m) => m.roster_id === rosterId);
      if (!mine || mine.matchup_id == null) return;
      played.push({ week: idx + 1, points: mine.points || 0 });
      const opp = ms.find(
        (m) => m.matchup_id === mine.matchup_id && m.roster_id !== rosterId
      );
      const oppPts = opp?.points || 0;
      if (oppPts > paHigh) { paHigh = oppPts; paHighWeek = idx + 1; }

      // head-to-head vs this opponent (regular season, and MAIN-bracket playoffs only)
      if (opp) {
        const oppUid = rosterUser[opp.roster_id];
        const oppName = uById[oppUid]?.display_name;
        if (oppUid && !isExcludedManager(oppUid, oppName)) {
          const isReg = idx + 1 < playoffStart;
          // playoff games only count if BOTH teams made the winners bracket
          // (excludes consolation / toilet-bowl matchups)
          const countable =
            isReg ||
            (mainBracket.has(rosterId) && mainBracket.has(opp.roster_id));
          if (countable) {
            const h =
              h2h[oppUid] ||
              (h2h[oppUid] = {
                userId: oppUid,
                name: oppName || "Unknown",
                team: teamName(uById[oppUid]),
                avatar: avatarUrl(uById[oppUid]),
                reg: { games: 0, wins: 0, losses: 0, ties: 0, pf: 0, pa: 0 },
                ply: { games: 0, wins: 0, losses: 0, ties: 0, pf: 0, pa: 0 },
              });
            const mp = mine.points || 0;
            const bucket = isReg ? h.reg : h.ply;
            bucket.games++; bucket.pf += mp; bucket.pa += oppPts;
            if (mp > oppPts) bucket.wins++;
            else if (mp < oppPts) bucket.losses++;
            else bucket.ties++;
          }
        }
      }
      const starters = new Set((mine.starters || []).map(String));
      for (const [pid, val] of Object.entries(mine.players_points || {})) {
        const a = pAgg[pid] || (pAgg[pid] = { points: 0, best: -Infinity, starts: 0 });
        a.points += val;
        if (val > a.best) a.best = val;
        if (starters.has(String(pid))) a.starts += 1;
      }
    });
    if (paHigh < 0) paHigh = 0;

    // waiver / free-agent pickups this season
    let waivers = 0;
    for (const txs of txData) {
      for (const t of txs || []) {
        if (t.status !== "complete") continue;
        if (t.type !== "waiver" && t.type !== "free_agent") continue;
        if (!t.adds) continue;
        if ((t.roster_ids || []).some((rid) => rid === rosterId)) waivers += 1;
      }
    }

    // per-player rows for this season
    for (const [pid, a] of Object.entries(pAgg)) {
      playerRows.push({
        playerId: pid,
        name: playerName(players, pid),
        position: playerPosition(players, pid),
        year: s.season,
        acq: draftedSet.has(String(pid)) ? "draft" : "wire",
        starts: a.starts,
        points: a.points,
        best: a.best === -Infinity ? 0 : a.best,
      });
    }

    const place = placements[rosterId] ?? null;
    const playoffTeams = Number(league.settings?.playoff_teams) || 6;

    const playedGames = played.length;
    let high = 0, highWeek = null, low = 0, lowWeek = null;
    if (playedGames) {
      let hi = played[0], lo = played[0];
      for (const p of played) {
        if (p.points > hi.points) hi = p;
        if (p.points < lo.points) lo = p;
      }
      high = hi.points; highWeek = hi.week;
      low = lo.points; lowWeek = lo.week;
    }
    const regGames = (set.wins || 0) + (set.losses || 0) + (set.ties || 0);
    const pf = pts(set.fpts, set.fpts_decimal);
    const pa = pts(set.fpts_against, set.fpts_against_decimal);

    seasons.push({
      season: s.season,
      place,
      playoffTeams,
      madePlayoffs: place != null && place <= playoffTeams,
      wins: set.wins || 0,
      losses: set.losses || 0,
      ties: set.ties || 0,
      pf,
      pa,
      ppg: regGames ? pf / regGames : 0,
      waivers,
      high,
      highWeek,
      low,
      lowWeek,
      paHigh,
      paHighWeek,
      slot,
      games: regGames,
      playedGames,
    });
  }

  if (!identity) return null; // unknown manager

  // ---- All-time aggregates ----
  const allTime = {
    wins: 0,
    losses: 0,
    ties: 0,
    totalPoints: 0,
    totalPointsAgainst: 0,
    highestGame: 0,
    highestGameSeason: null,
    highestGameWeek: null,
    lowestGame: Infinity,
    lowestGameSeason: null,
    lowestGameWeek: null,
    highestAgainst: 0,
    highestAgainstSeason: null,
    highestAgainstWeek: null,
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
    allTime.totalPointsAgainst += s.pa;
    if (s.playedGames && s.high > allTime.highestGame) {
      allTime.highestGame = s.high;
      allTime.highestGameSeason = s.season;
      allTime.highestGameWeek = s.highWeek;
    }
    if (s.playedGames && s.low < allTime.lowestGame) {
      allTime.lowestGame = s.low;
      allTime.lowestGameSeason = s.season;
      allTime.lowestGameWeek = s.lowWeek;
    }
    if (s.playedGames && s.paHigh > allTime.highestAgainst) {
      allTime.highestAgainst = s.paHigh;
      allTime.highestAgainstSeason = s.season;
      allTime.highestAgainstWeek = s.paHighWeek;
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
  allTime.avgPoints = g ? allTime.totalPoints / g : 0;

  const h2hDerive = (b) => ({
    games: b.games,
    wins: b.wins,
    losses: b.losses,
    winPct: b.games ? b.wins / b.games : 0,
    tpf: b.pf,
    tpa: b.pa,
    apf: b.games ? b.pf / b.games : 0,
    apa: b.games ? b.pa / b.games : 0,
  });
  const h2hRows = Object.values(h2h)
    .filter((h) => String(h.userId) !== String(userId))
    .map((h) => ({
      userId: h.userId,
      team: h.team,
      name: h.name,
      avatar: h.avatar,
      reg: h2hDerive(h.reg),
      ply: h2hDerive(h.ply),
    }))
    .sort((a, b) => a.team.localeCompare(b.team));

  return {
    ...identity,
    allTime,
    seasons,
    draft: { perYear: draftPerYear, tendency, maxRound },
    players: playerRows,
    h2h: h2hRows,
  };
}

// ---------------------------------------------------------------------------
// Owners directory: one summary row per manager for the /owners cards —
// all-time record, win%, PPG, and finish medals (1st/2nd/3rd/last counts).
// ---------------------------------------------------------------------------
export async function buildOwners(startId = LEAGUE_ID) {
  const chain = await getSeasonChain(startId);
  const nflState = await getNflState();
  const currentLeagueId = chain[0]?.leagueId;
  const m = {};
  for (const s of chain) {
    const [users, rosters] = await Promise.all([
      getUsers(s.leagueId),
      getRosters(s.leagueId),
    ]);
    const uById = usersById(users);
    const placements = await computePlacements(
      s.leagueId,
      s.league.settings?.playoff_teams,
      s.league.total_rosters
    );
    const rosterToUser = {};
    for (const r of rosters) {
      rosterToUser[r.roster_id] = r.owner_id;
      const u = uById[r.owner_id];
      if (!u) continue;
      const rec =
        m[u.user_id] ||
        (m[u.user_id] = {
          userId: u.user_id,
          name: u.display_name,
          team: teamName(u),
          avatar: avatarUrl(u),
          wins: 0, losses: 0, ties: 0, pf: 0, games: 0,
          champYears: [], secondYears: [], thirdYears: [], lastYears: [],
          maxPF: null, maxPA: null,
        });
      const set = r.settings || {};
      const gp = (set.wins || 0) + (set.losses || 0) + (set.ties || 0);
      rec.wins += set.wins || 0;
      rec.losses += set.losses || 0;
      rec.ties += set.ties || 0;
      rec.pf += pts(set.fpts, set.fpts_decimal);
      rec.games += gp;
      const place = placements[r.roster_id];
      if (place === 1) rec.champYears.push(s.season);
      else if (place === 2) rec.secondYears.push(s.season);
      else if (place === 3) rec.thirdYears.push(s.season);
    }

    // burger = worst regular-season record (fewest wins, then fewest points)
    const worst = [...rosters]
      .filter((r) => !isExcludedManager(rosterToUser[r.roster_id], null))
      .sort((a, b) => {
        const aw = a.settings?.wins || 0, bw = b.settings?.wins || 0;
        if (aw !== bw) return aw - bw;
        return pts(a.settings?.fpts, a.settings?.fpts_decimal) - pts(b.settings?.fpts, b.settings?.fpts_decimal);
      })[0];
    // Only count a last-place "burger" once the regular season has finished
    // (so the in-progress current season doesn't hand anyone a burger early).
    const regDone = regularSeasonDone(s.league, nflState, s.leagueId === currentLeagueId);
    if (worst && regDone) {
      const wu = m[rosterToUser[worst.roster_id]];
      if (wu) wu.lastYears.push(s.season);
    }

    // single-game Points For / Points Against records (with year + week)
    const lastWeek =
      Number(s.league.settings?.last_scored_leg) ||
      Number(s.league.settings?.leg) || 17;
    const weeks = Array.from({ length: lastWeek }, (_, i) => i + 1);
    const weekData = await Promise.all(
      weeks.map((w) => getMatchups(w, s.leagueId).catch(() => []))
    );
    const bump = (me, opp, week) => {
      const rec = m[rosterToUser[me.roster_id]];
      if (!rec) return;
      const pf = me.points || 0, pa = opp.points || 0;
      if (!rec.maxPF || pf > rec.maxPF.value) rec.maxPF = { value: pf, year: s.season, week };
      if (!rec.maxPA || pa > rec.maxPA.value) rec.maxPA = { value: pa, year: s.season, week };
    };
    weekData.forEach((ms, idx) => {
      const groups = {};
      for (const mm of ms) {
        if (mm.matchup_id == null) continue;
        (groups[mm.matchup_id] = groups[mm.matchup_id] || []).push(mm);
      }
      for (const pair of Object.values(groups)) {
        if (pair.length !== 2) continue;
        bump(pair[0], pair[1], idx + 1);
        bump(pair[1], pair[0], idx + 1);
      }
    });
  }
  return Object.values(m)
    .filter((r) => !isExcludedManager(r.userId, r.name))
    .map((r) => ({
      ...r,
      winPct: r.games ? r.wins / r.games : 0,
      ppg: r.games ? r.pf / r.games : 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
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
  const currentLeagueId = chain[0]?.leagueId; // newest season
  const managers = {}; // userId -> identity (most recent)
  const stats = {}; // userId -> { current, all }  (both REGULAR season only)

  const blank = () => ({
    games: 0, wins: 0, losses: 0, ties: 0,
    pointsFor: 0, bestWin: 0, worstLoss: 0, waivers: 0,
  });
  const slot = (uid) => (stats[uid] || (stats[uid] = { current: blank(), all: blank() }));

  for (const s of chain) {
    const leagueId = s.leagueId;
    const isCurrent = leagueId === currentLeagueId;
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
      if (u && !managers[u.user_id] && !isExcludedManager(u.user_id, u.display_name)) {
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

    // matchup results — REGULAR SEASON weeks only
    weekData.forEach((ms, idx) => {
      if (idx + 1 >= playoffStart) return; // skip playoff weeks
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
        if (isCurrent) apply(st.current);
      };
      for (const pair of Object.values(groups)) {
        if (pair.length !== 2) continue;
        record(pair[0], pair[1]);
        record(pair[1], pair[0]);
      }
    });

    // waiver / free-agent moves — REGULAR SEASON weeks only
    txData.forEach((txs, idx) => {
      if (idx + 1 >= playoffStart) return;
      for (const t of txs || []) {
        if (t.status !== "complete") continue;
        if (t.type !== "waiver" && t.type !== "free_agent") continue;
        if (!t.adds) continue; // count pickups only, not pure drops
        for (const rid of t.roster_ids || []) {
          const uid = rosterToUser[rid];
          if (!uid) continue;
          const st = slot(uid);
          st.all.waivers++;
          if (isCurrent) st.current.waivers++;
        }
      }
    });
  }

  for (const uid in stats) {
    for (const key of ["current", "all"]) {
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
  const [chain, players, nflState] = await Promise.all([
    getSeasonChain(startId),
    getPlayers(),
    getNflState(),
  ]);
  const currentLeagueId = chain[0]?.leagueId;

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
    const rUser = {}, rTeam = {}, rMgr = {}, rAvatar = {}, rRec = {};
    for (const r of rosters) {
      const u = uById[r.owner_id];
      rUser[r.roster_id] = r.owner_id;
      rTeam[r.roster_id] = teamName(u);
      rMgr[r.roster_id] = u?.display_name || "Unknown";
      rAvatar[r.roster_id] = avatarUrl(u);
      const st = r.settings || {};
      rRec[r.roster_id] = `${st.wins || 0}-${st.losses || 0}${st.ties ? "-" + st.ties : ""}`;
      if (u && !managers[u.user_id] && !isExcludedManager(u.user_id, u.display_name)) {
        managers[u.user_id] = {
          userId: u.user_id,
          name: u.display_name,
          team: teamName(u),
          avatar: avatarUrl(u),
        };
      }
    }

    const excluded = new Set(
      rosters
        .filter((r) => isExcludedManager(rUser[r.roster_id], rMgr[r.roster_id]))
        .map((r) => r.roster_id)
    );

    const playoffStart = Number(league.settings?.playoff_week_start) || 15;
    const lastWeek =
      Number(league.settings?.last_scored_leg) ||
      Number(league.settings?.leg) || 17;
    const playoffTeams = Number(league.settings?.playoff_teams) || 6;
    const [placements, madePlayoffs] = await Promise.all([
      computePlacements(leagueId, playoffTeams, league.total_rosters),
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
          if (excluded.has(rid)) continue;
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
        if (margin > 0 && !excluded.has(win.roster_id) && !excluded.has(lose.roster_id) && (!rec.largestMargin || margin > rec.largestMargin.margin))
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

        if (isReg && !excluded.has(a.roster_id) && !excluded.has(b.roster_id)) {
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
      if (excluded.has(Number(rid))) continue;
      if (!rec.mostWaivers || wc[rid] > rec.mostWaivers.count)
        rec.mostWaivers = { count: wc[rid], manager: rMgr[rid], team: rTeam[rid], userId: rUser[rid], year };
    }

    for (const rid in seq) {
      if (excluded.has(Number(rid))) continue;
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
      if (excluded.has(Number(rid))) continue;
      const x = reg[rid];
      if (!x.games) continue;
      const wp = x.wins / x.games;
      if (!rec.bestRegSeason || wp > rec.bestRegSeason.winPct)
        rec.bestRegSeason = { winPct: wp, wins: x.wins, losses: x.losses, ties: x.ties, manager: rMgr[rid], team: rTeam[rid], userId: rUser[rid], year };
    }

    const mkRows = (o, onlyPlayoff) =>
      rosters
        .filter((r) => !excluded.has(r.roster_id))
        .map((r) => {
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

    // champion from playoffs (place 1); burger = worst REGULAR-season record
    const champRid = Object.entries(placements).find(([, p]) => p === 1)?.[0];
    const worstRoster = [...rosters]
      .filter((r) => !excluded.has(r.roster_id))
      .sort((a, b) => {
        const aw = a.settings?.wins || 0, bw = b.settings?.wins || 0;
        if (aw !== bw) return aw - bw;
        return pts(a.settings?.fpts, a.settings?.fpts_decimal) - pts(b.settings?.fpts, b.settings?.fpts_decimal);
      })[0];
    // Suppress the burger until the regular season is complete.
    const regDone = regularSeasonDone(league, nflState, leagueId === currentLeagueId);
    const lastRid = regDone ? worstRoster?.roster_id : null;
    champions.push({
      year,
      champion: champRid ? { team: rTeam[champRid], manager: rMgr[champRid], userId: rUser[champRid] } : null,
      last: lastRid
        ? { team: rTeam[lastRid], manager: rMgr[lastRid], userId: rUser[lastRid], record: rRec[lastRid] }
        : null,
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
