import {
  getCurrentLeagueId,
  getLeague,
  getStandings,
  getMatchups,
  getNflState,
} from "@/lib/sleeper";
import { winProbability, americanOdds, tenToWin } from "@/lib/odds";
import MatchupOdds from "@/app/components/MatchupOdds";

export const dynamic = "force-dynamic";

export const metadata = { title: "Matchups · YEET FFL" };

export default async function MatchupsPage() {
  const id = await getCurrentLeagueId();
  const [league, standings, state] = await Promise.all([
    getLeague(id),
    getStandings(id),
    getNflState(),
  ]);

  const lastWeek =
    Number(league.settings?.last_scored_leg) ||
    Number(league.settings?.leg) ||
    17;

  // team -> projected points (season average) + display info
  const info = {};
  for (const r of standings) {
    const g = r.wins + r.losses + r.ties;
    info[r.rosterId] = {
      team: r.team,
      avatar: r.avatar,
      proj: g ? r.pointsFor / g : 0,
    };
  }

  const nums = Array.from({ length: lastWeek }, (_, i) => i + 1);
  const allMs = await Promise.all(
    nums.map((w) => getMatchups(w, id).catch(() => []))
  );

  const weeks = allMs.map((ms, idx) => {
    const groups = {};
    for (const m of ms) {
      if (m.matchup_id == null) continue;
      (groups[m.matchup_id] = groups[m.matchup_id] || []).push(m);
    }
    const games = Object.values(groups)
      .filter((p) => p.length === 2)
      .map(([a, b]) => {
        const A = info[a.roster_id] || { team: "TBD", proj: 0, avatar: null };
        const B = info[b.roster_id] || { team: "TBD", proj: 0, avatar: null };
        const aPts = a.points || 0;
        const bPts = b.points || 0;
        const played = aPts > 0 || bPts > 0;
        const pA = winProbability(A.proj, B.proj);
        return {
          a: {
            team: A.team, avatar: A.avatar, proj: A.proj, score: aPts,
            ao: americanOdds(pA), win10: tenToWin(pA), winner: played && aPts > bPts,
          },
          b: {
            team: B.team, avatar: B.avatar, proj: B.proj, score: bPts,
            ao: americanOdds(1 - pA), win10: tenToWin(1 - pA), winner: played && bPts > aPts,
          },
          played,
        };
      });
    return { week: idx + 1, games };
  });

  const teams = standings.map((r) => ({
    rosterId: r.rosterId,
    team: r.team,
    avatar: r.avatar,
    proj: r.wins + r.losses + r.ties ? r.pointsFor / (r.wins + r.losses + r.ties) : 0,
  }));

  const liveWeek = Number(state.week) || 0;
  const inSeason =
    liveWeek > 0 && state.season_type !== "off" && league.status !== "complete";
  const scored = weeks.filter((w) => w.games.length > 0).map((w) => w.week);
  const defaultWeek =
    inSeason && liveWeek ? liveWeek : scored[scored.length - 1] || 1;

  return (
    <>
      <h2>Matchups</h2>
      <p className="sub" style={{ marginTop: -6, marginBottom: 16 }}>
        Week-by-week matchup odds · {league.season} season.
      </p>
      <MatchupOdds
        weeks={weeks}
        teams={teams}
        defaultWeek={defaultWeek}
        offseason={!inSeason}
        seasonLabel={league.season}
      />
    </>
  );
}
