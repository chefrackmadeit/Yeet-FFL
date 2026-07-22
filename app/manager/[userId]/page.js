import Link from "next/link";
import { getCurrentLeagueId } from "@/lib/sleeper";
import { buildManagerProfile, ordinal } from "@/lib/manager";
import ManagerTabs from "@/app/components/ManagerTabs";

export const dynamic = "force-dynamic";

function Stat({ label, value, sub }) {
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

export default async function ManagerPage({ params }) {
  const { userId } = params;
  const currentId = await getCurrentLeagueId();
  const profile = await buildManagerProfile(userId, currentId);

  if (!profile) {
    return (
      <>
        <p style={{ marginTop: 24 }}>
          <Link href="/">← Back</Link>
        </p>
        <div className="notice">Manager not found in this league's history.</div>
      </>
    );
  }

  const a = profile.allTime;
  const recordStr = `${a.wins}-${a.losses}${a.ties ? "-" + a.ties : ""}`;

  return (
    <>
      <p style={{ margin: "18px 0 6px" }}>
        <Link href="/" className="sub">
          ← Back to standings
        </Link>
      </p>

      <div className="manager-head">
        {profile.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="manager-avatar" src={profile.avatar} alt="" />
        )}
        <div>
          <h1 style={{ margin: 0 }}>{profile.team}</h1>
          <div className="sub">
            {profile.name} · {a.seasonsPlayed} season
            {a.seasonsPlayed === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 18 }}>
        <Stat
          label="All-Time Record"
          value={recordStr}
          sub={`${(a.winPct * 100).toFixed(1)}% win rate`}
        />
        <Stat label="Total Points" value={a.totalPoints.toFixed(1)} sub="all seasons" />
        <Stat
          label="Highest Score"
          value={a.highestGame.toFixed(1)}
          sub="single game"
        />
        <Stat
          label="Lowest Score"
          value={a.lowestGame.toFixed(1)}
          sub="single game"
        />
        <Stat
          label="Playoff Appearances"
          value={a.playoffAppearances}
          sub={`of ${a.seasonsPlayed}`}
        />
        <Stat label="Best Finish" value={ordinal(a.bestPlace)} sub="all-time" />
      </div>

      <h2>Season History</h2>
      <ManagerTabs seasons={profile.seasons} />
    </>
  );
}
