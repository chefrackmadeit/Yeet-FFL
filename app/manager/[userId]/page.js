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
          sub={`${(a.winPct * 100).toFixed(1)}% win rate · ${a.seasonSpan}`}
        />
        <Stat
          label="Total Points Scored"
          value={a.totalPoints.toFixed(1)}
          sub={a.seasonSpan ? `${a.seasonSpan} (${a.seasonsPlayed} seasons)` : "all seasons"}
        />
        <Stat
          label="Total Points Against"
          value={a.totalPointsAgainst.toFixed(1)}
          sub={a.seasonSpan ? `${a.seasonSpan} (${a.seasonsPlayed} seasons)` : "all seasons"}
        />
        <Stat
          label="Most Points Scored"
          value={a.highestGame.toFixed(1)}
          sub={
            a.highestGameSeason
              ? `${a.highestGameSeason} · Week ${a.highestGameWeek}`
              : "single game"
          }
        />
        <Stat
          label="Most Points Against"
          value={a.highestAgainst.toFixed(1)}
          sub={
            a.highestAgainstSeason
              ? `${a.highestAgainstSeason} · Week ${a.highestAgainstWeek}`
              : "single game"
          }
        />
        <Stat
          label="Least Points Scored"
          value={a.lowestGame.toFixed(1)}
          sub={
            a.lowestGameSeason
              ? `${a.lowestGameSeason} · Week ${a.lowestGameWeek}`
              : "single game"
          }
        />
        <Stat
          label="Avg Points / Game"
          value={a.avgPoints.toFixed(1)}
          sub="regular season"
        />
        <Stat
          label="Playoff Appearances"
          value={a.playoffAppearances}
          sub={
            a.playoffYears.length
              ? a.playoffYears.join(", ")
              : `of ${a.seasonsPlayed}`
          }
        />
        <Stat
          label="Best Finish"
          value={ordinal(a.bestPlace)}
          sub={a.bestPlaceSeason ? `in ${a.bestPlaceSeason}` : "all-time"}
        />
      </div>

      <h2>Season History</h2>
      <ManagerTabs
        seasons={profile.seasons}
        draft={profile.draft}
        players={profile.players}
      />
    </>
  );
}
