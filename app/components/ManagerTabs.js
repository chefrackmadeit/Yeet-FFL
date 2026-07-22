"use client";

import { useMemo, useState } from "react";

function ordinal(n) {
  if (n == null) return "—";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const POSITIONS = ["ALL", "QB", "RB", "WR", "TE", "K", "DEF"];

export default function ManagerTabs({ seasons }) {
  const [tab, setTab] = useState("seasons");

  return (
    <div>
      <div className="tabs">
        <button
          className={"tab-btn" + (tab === "seasons" ? " active" : "")}
          onClick={() => setTab("seasons")}
        >
          Seasons
        </button>
        <button
          className={"tab-btn" + (tab === "players" ? " active" : "")}
          onClick={() => setTab("players")}
        >
          Players Rostered
        </button>
      </div>

      {tab === "seasons" ? (
        <SeasonsTable seasons={seasons} />
      ) : (
        <PlayersTable seasons={seasons} />
      )}
    </div>
  );
}

function SeasonsTable({ seasons }) {
  // Totals row
  const t = seasons.reduce(
    (acc, s) => {
      acc.wins += s.wins;
      acc.losses += s.losses;
      acc.ties += s.ties;
      acc.pf += s.pf;
      acc.pa += s.pa;
      acc.games += s.games;
      if (s.games && s.high > acc.high) acc.high = s.high;
      if (s.games && (acc.low === null || s.low < acc.low)) acc.low = s.low;
      acc.totalPts += s.avg * s.games;
      return acc;
    },
    { wins: 0, losses: 0, ties: 0, pf: 0, pa: 0, games: 0, high: 0, low: null, totalPts: 0 }
  );
  const tg = t.wins + t.losses + t.ties;
  const totalWinPct = tg ? (t.wins / tg) * 100 : 0;
  const totalAvg = t.games ? t.totalPts / t.games : 0;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Finish</th>
            <th className="num">W</th>
            <th className="num">L</th>
            <th className="num">Win %</th>
            <th className="num">PF</th>
            <th className="num">PA</th>
            <th className="num">High</th>
            <th className="num">Low</th>
            <th className="num">Avg</th>
          </tr>
        </thead>
        <tbody>
          <tr className="total-row">
            <td>Total</td>
            <td>—</td>
            <td className="num">{t.wins}</td>
            <td className="num">{t.losses}</td>
            <td className="num">{totalWinPct.toFixed(1)}%</td>
            <td className="num">{t.pf.toFixed(1)}</td>
            <td className="num">{t.pa.toFixed(1)}</td>
            <td className="num">{t.high.toFixed(1)}</td>
            <td className="num">{(t.low ?? 0).toFixed(1)}</td>
            <td className="num">{totalAvg.toFixed(1)}</td>
          </tr>
          {seasons.map((s) => {
            const g = s.wins + s.losses + s.ties;
            const wp = g ? (s.wins / g) * 100 : 0;
            return (
              <tr key={s.season}>
                <td>{s.season}</td>
                <td>{ordinal(s.place)}</td>
                <td className="num">{s.wins}</td>
                <td className="num">{s.losses}</td>
                <td className="num">{wp.toFixed(1)}%</td>
                <td className="num">{s.pf.toFixed(1)}</td>
                <td className="num">{s.pa.toFixed(1)}</td>
                <td className="num">{s.high.toFixed(1)}</td>
                <td className="num">{s.low.toFixed(1)}</td>
                <td className="num">{s.avg.toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PlayersTable({ seasons }) {
  const years = seasons.map((s) => s.season);
  const [year, setYear] = useState(years[0] || "");
  const [pos, setPos] = useState("ALL");

  const season = seasons.find((s) => s.season === year) || seasons[0];

  const rows = useMemo(() => {
    if (!season) return [];
    let list = season.players;
    if (pos !== "ALL") list = list.filter((p) => p.position === pos);
    return list;
  }, [season, pos]);

  if (!season) return <div className="notice">No player data.</div>;

  return (
    <div>
      <div className="filters">
        <label>
          Year&nbsp;
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label>
          Position&nbsp;
          <select value={pos} onChange={(e) => setPos(e.target.value)}>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p === "ALL" ? "All" : p}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th className="num">Total Points</th>
              <th className="num">Best Week</th>
              <th className="num">Round Drafted</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="sub">
                  No players for this filter.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.name}{" "}
                    <span className="sub">· {p.position}</span>
                  </td>
                  <td className="num">{p.total.toFixed(1)}</td>
                  <td className="num">{p.best.toFixed(1)}</td>
                  <td className="num">{p.round == null ? "N/A" : `Round ${p.round}`}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
