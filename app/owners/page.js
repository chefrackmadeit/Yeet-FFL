import Link from "next/link";
import { getCurrentLeagueId } from "@/lib/sleeper";
import { buildOwners } from "@/lib/manager";

export const dynamic = "force-dynamic";

export const metadata = { title: "Owners · YEET FFL" };

function medals(o) {
  const items = [];
  for (let i = 0; i < o.champ; i++) items.push(["🏆", "Champion"]);
  for (let i = 0; i < o.second; i++) items.push(["🥈", "Runner-up"]);
  for (let i = 0; i < o.third; i++) items.push(["🥉", "Third place"]);
  for (let i = 0; i < o.last; i++) items.push(["🍔", "Last place"]);
  return items;
}

export default async function OwnersPage() {
  const id = await getCurrentLeagueId();
  const owners = await buildOwners(id);

  return (
    <>
      <h2>Owners</h2>
      <p className="sub" style={{ marginTop: -6, marginBottom: 18 }}>
        Select an owner to view their full profile.
      </p>
      <div className="grid owners-grid">
        {owners.map((o) => (
          <Link key={o.userId} href={`/manager/${o.userId}`} className="owner-card">
            {o.avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="owner-avatar" src={o.avatar} alt="" />
            )}
            <div className="owner-team">{o.team}</div>
            <div className="sub">{o.name}</div>

            <div className="owner-medals">
              {medals(o).length ? (
                medals(o).map(([icon, title], i) => (
                  <span key={i} title={title}>{icon}</span>
                ))
              ) : (
                <span className="sub">—</span>
              )}
            </div>

            <div className="owner-stats">
              <div>
                <div className="owner-stat-num">
                  {o.wins}-{o.losses}{o.ties ? `-${o.ties}` : ""}
                </div>
                <div className="owner-stat-lab">Record</div>
              </div>
              <div>
                <div className="owner-stat-num">{(o.winPct * 100).toFixed(1)}%</div>
                <div className="owner-stat-lab">Win %</div>
              </div>
              <div>
                <div className="owner-stat-num">{o.ppg.toFixed(1)}</div>
                <div className="owner-stat-lab">PPG</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
