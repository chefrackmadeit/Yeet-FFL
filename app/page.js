import Link from "next/link";
import { getLeague, getStandings, getSeasonChain, getRosters, getUsers, usersById, teamName } from "@/lib/sleeper";

export const dynamic = "force-dynamic";

async function getReigningChampion() {
  const chain = await getSeasonChain();
  // Most recent completed season with a recorded champion.
  for (const s of chain) {
    if (s.championRosterId) {
      const [rosters, users] = await Promise.all([
        getRosters(s.leagueId),
        getUsers(s.leagueId),
      ]);
      const uById = usersById(users);
      const champ = rosters.find(
        (r) => String(r.roster_id) === String(s.championRosterId)
      );
      if (champ) {
        const u = uById[champ.owner_id];
        return { season: s.season, team: teamName(u), manager: u?.display_name };
      }
    }
  }
  return null;
}

export default async function HomePage() {
  const [league, standings, champion] = await Promise.all([
    getLeague(),
    getStandings(),
    getReigningChampion(),
  ]);

  const top = standings.slice(0, 5);

  return (
    <>
      <section className="hero">
        <h1>{league.name}</h1>
        <p>
          {league.season} season · {league.total_rosters} teams · updated live
          from Sleeper
        </p>
      </section>

      {champion && (
        <div className="card champion">
          <div className="label">Reigning Champion — {champion.season}</div>
          <div className="value">
            <span className="trophy">🏆</span> {champion.team}
          </div>
          <div className="sub">Manager: {champion.manager}</div>
        </div>
      )}

      <h2>Top of the Standings</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="rank">#</th>
              <th>Team</th>
              <th className="num">W</th>
              <th className="num">L</th>
              <th className="num">PF</th>
            </tr>
          </thead>
          <tbody>
            {top.map((r) => (
              <tr key={r.rosterId}>
                <td className="rank">{r.rank}</td>
                <td>
                  <div className="team-cell">
                    {r.avatar && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="avatar" src={r.avatar} alt="" />
                    )}
                    <div>
                      <div>{r.team}</div>
                      <div className="sub">{r.manager}</div>
                    </div>
                  </div>
                </td>
                <td className="num">{r.wins}</td>
                <td className="num">{r.losses}</td>
                <td className="num">{r.pointsFor.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 16 }}>
        <Link href="/standings">See full standings →</Link>
      </p>
    </>
  );
}
