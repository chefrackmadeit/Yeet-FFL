import { getAllTimeStats } from "@/lib/sleeper";

export const dynamic = "force-dynamic";

export const metadata = { title: "History · YEET FFL" };

export default async function HistoryPage() {
  const { table, seasons } = await getAllTimeStats();

  return (
    <>
      <h2>League Champions</h2>
      <div className="grid">
        {seasons.map((s) => (
          <div className="card champion" key={s.leagueId}>
            <div className="label">{s.season}</div>
            <div className="value">
              🏆 {s.champion ? s.champion.team : "—"}
            </div>
            {s.champion && <div className="sub">{s.champion.manager}</div>}
          </div>
        ))}
      </div>

      <h2>All-Time Records</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="rank">#</th>
              <th>Manager</th>
              <th className="num">Titles</th>
              <th className="num">Seasons</th>
              <th className="num">W</th>
              <th className="num">L</th>
              <th className="num">T</th>
              <th className="num">Win %</th>
              <th className="num">Total PF</th>
            </tr>
          </thead>
          <tbody>
            {table.map((m, i) => (
              <tr key={m.userId}>
                <td className="rank">{i + 1}</td>
                <td>
                  <div className="team-cell">
                    {m.avatar && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="avatar" src={m.avatar} alt="" />
                    )}
                    <div>
                      <div>{m.team}</div>
                      <div className="sub">{m.name}</div>
                    </div>
                  </div>
                </td>
                <td className="num">{m.titles || ""}</td>
                <td className="num">{m.seasons}</td>
                <td className="num">{m.wins}</td>
                <td className="num">{m.losses}</td>
                <td className="num">{m.ties}</td>
                <td className="num">{(m.winPct * 100).toFixed(1)}%</td>
                <td className="num">{m.pointsFor.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="sub" style={{ marginTop: 12 }}>
        Aggregated across every season in the league's Sleeper history. Managers
        are tracked by account, so records follow you even if you rename your
        team.
      </p>
    </>
  );
}
