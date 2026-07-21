import { getLeague, getStandings } from "@/lib/sleeper";

export const dynamic = "force-dynamic";

export const metadata = { title: "Standings · YEET FFL" };

export default async function StandingsPage() {
  const [league, standings] = await Promise.all([getLeague(), getStandings()]);

  return (
    <>
      <h2>{league.season} Standings</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="rank">#</th>
              <th>Team</th>
              <th className="num">W</th>
              <th className="num">L</th>
              <th className="num">T</th>
              <th className="num">PF</th>
              <th className="num">PA</th>
              <th>Streak</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((r) => (
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
                <td className="num">{r.ties}</td>
                <td className="num">{r.pointsFor.toFixed(1)}</td>
                <td className="num">{r.pointsAgainst.toFixed(1)}</td>
                <td>
                  {r.streak && (
                    <span
                      className={
                        "pill " + (r.streak.endsWith("W") ? "win" : "loss")
                      }
                    >
                      {r.streak}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="sub" style={{ marginTop: 12 }}>
        PF = points for · PA = points against. Sorted by wins, then points for.
      </p>
    </>
  );
}
