import Link from "next/link";
import { getCurrentLeagueId } from "@/lib/sleeper";
import { buildArchives } from "@/lib/manager";
import ArchivesExplorer from "@/app/components/ArchivesExplorer";

export const dynamic = "force-dynamic";

export const metadata = { title: "The Archives · YEET FFL" };

function RecordCard({ label, value, sub }) {
  return (
    <div className="card record-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

export default async function ArchivesPage() {
  const id = await getCurrentLeagueId();
  const { seasons, perYear, allTime, recordBook: rb, champions } =
    await buildArchives(id);

  const cards = [
    rb.bestRegSeason && {
      label: "Best Regular Season",
      value: `${rb.bestRegSeason.wins}-${rb.bestRegSeason.losses}${rb.bestRegSeason.ties ? "-" + rb.bestRegSeason.ties : ""}`,
      sub: `${rb.bestRegSeason.team} · ${rb.bestRegSeason.year}`,
    },
    rb.highestGame && {
      label: "Highest Points Scored",
      value: rb.highestGame.value.toFixed(1),
      sub: `${rb.highestGame.team} · ${rb.highestGame.year} Wk ${rb.highestGame.week}`,
    },
    rb.lowestGame && {
      label: "Lowest Points Scored",
      value: rb.lowestGame.value.toFixed(1),
      sub: `${rb.lowestGame.team} · ${rb.lowestGame.year} Wk ${rb.lowestGame.week}`,
    },
    rb.largestMargin && {
      label: "Largest Win Margin",
      value: `+${rb.largestMargin.margin.toFixed(1)}`,
      sub: `${rb.largestMargin.winnerTeam} ${rb.largestMargin.winnerScore.toFixed(1)} – ${rb.largestMargin.loserScore.toFixed(1)} ${rb.largestMargin.loserTeam} · ${rb.largestMargin.year} Wk ${rb.largestMargin.week}`,
    },
    rb.bestPlayer && {
      label: "Highest Player Performance",
      value: rb.bestPlayer.points.toFixed(1),
      sub: `${rb.bestPlayer.player} (${rb.bestPlayer.position}) · ${rb.bestPlayer.manager} · ${rb.bestPlayer.year} Wk ${rb.bestPlayer.week}`,
    },
    rb.mostWaivers && {
      label: "Most Waiver Moves",
      value: rb.mostWaivers.count,
      sub: `${rb.mostWaivers.manager} · ${rb.mostWaivers.year}`,
    },
    rb.bestWinStreak && {
      label: "Best Win Streak",
      value: `${rb.bestWinStreak.len} W`,
      sub: `${rb.bestWinStreak.manager} · ${rb.bestWinStreak.year}`,
    },
    rb.worstLossStreak && {
      label: "Worst Losing Streak",
      value: `${rb.worstLossStreak.len} L`,
      sub: `${rb.worstLossStreak.manager} · ${rb.worstLossStreak.year}`,
    },
  ].filter(Boolean);

  return (
    <>
      <h2>Record Book</h2>
      <div className="grid record-grid">
        {cards.map((c) => (
          <RecordCard key={c.label} label={c.label} value={c.value} sub={c.sub} />
        ))}
      </div>

      <h2>League Champions</h2>
      <div className="grid">
        {champions.map((c) => (
          <div className="card champion-card" key={c.year}>
            <div className="label">{c.year}</div>
            <div className="value">🏆 {c.champion ? c.champion.team : "—"}</div>
            {c.champion && <div className="sub">{c.champion.manager}</div>}
            {c.last && (
              <div className="sub" style={{ marginTop: 6 }}>
                🍔 {c.last.team}
              </div>
            )}
          </div>
        ))}
      </div>

      <h2>All-Time Records</h2>
      <ArchivesExplorer seasons={seasons} perYear={perYear} allTime={allTime} />
    </>
  );
}
