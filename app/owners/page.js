import Link from "next/link";
import { getCurrentLeagueId } from "@/lib/sleeper";
import { buildOwners } from "@/lib/manager";

export const dynamic = "force-dynamic";

export const metadata = { title: "Owners · YEET FFL" };

function medals(o) {
  const items = [];
  (o.champYears || []).forEach((y) => items.push(["🏆", "Champion", y]));
  (o.secondYears || []).forEach((y) => items.push(["🥈", "Runner-up", y]));
  (o.thirdYears || []).forEach((y) => items.push(["🥉", "Third place", y]));
  (o.lastYears || []).forEach((y) => items.push(["🍔", "Last place", y]));
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
                medals(o).map(([icon, title, year], i) => (
                  <span key={i} className="owner-medal" title={title}>
                    {icon}<span className="owner-medal-yr">{year}</span>
                  </span>
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

            <div className="owner-records">
              <div className="owner-rec">
                <span className="owner-stat-lab">Points For</span>
                <span className="owner-rec-num">{o.maxPF ? o.maxPF.value.toFixed(1) : "—"}</span>
                {o.maxPF && <span className="sub">{o.maxPF.year} · Wk {o.maxPF.week}</span>}
              </div>
              <div className="owner-rec">
                <span className="owner-stat-lab">Points Against</span>
                <span className="owner-rec-num">{o.maxPA ? o.maxPA.value.toFixed(1) : "—"}</span>
                {o.maxPA && <span className="sub">{o.maxPA.year} · Wk {o.maxPA.week}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
