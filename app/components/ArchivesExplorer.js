"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const COLS = [
  { key: "team", label: "Team", type: "text" },
  { key: "wins", label: "W", type: "num" },
  { key: "losses", label: "L", type: "num" },
  { key: "winPct", label: "Win %", type: "num" },
  { key: "pf", label: "PF", type: "num" },
  { key: "pa", label: "PA", type: "num" },
  { key: "avg", label: "Avg", type: "num" },
  { key: "high", label: "High", type: "num" },
  { key: "low", label: "Low", type: "num" },
];

function StatTable({ rows }) {
  const [sortKey, setSortKey] = useState("winPct");
  const [dir, setDir] = useState("desc");

  function onSort(key) {
    if (key === sortKey) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setDir(key === "team" ? "asc" : "desc");
    }
  }

  const sorted = useMemo(() => {
    const col = COLS.find((c) => c.key === sortKey) || COLS[3];
    const copy = [...rows];
    copy.sort((a, b) => {
      if (a.na && !b.na) return 1; // N/A rows to the bottom
      if (b.na && !a.na) return -1;
      let res;
      if (col.type === "text") res = String(a[sortKey]).localeCompare(String(b[sortKey]));
      else res = (a[sortKey] || 0) - (b[sortKey] || 0);
      return dir === "asc" ? res : -res;
    });
    return copy;
  }, [rows, sortKey, dir]);

  const arrow = (k) => (k === sortKey ? <span className="arrow">{dir === "asc" ? "▲" : "▼"}</span> : null);
  const cell = (r, key, fmt) => (r.na ? "N/A" : fmt(r));

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th className="rank">#</th>
            {COLS.map((c) => (
              <th key={c.key} className={"sortable" + (c.type === "num" ? " num" : "")} onClick={() => onSort(c.key)}>
                {c.label}
                {arrow(c.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={r.userId + i}>
              <td className="rank">{r.na ? "—" : i + 1}</td>
              <td>
                <div className="team-cell">
                  {r.avatar && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="avatar" src={r.avatar} alt="" />
                  )}
                  <div>
                    <div>
                      <Link href={`/manager/${r.userId}`} className="team-link">{r.team}</Link>
                    </div>
                    <div className="sub">{r.manager}</div>
                  </div>
                </div>
              </td>
              <td className="num">{cell(r, "wins", (x) => x.wins)}</td>
              <td className="num">{cell(r, "losses", (x) => x.losses)}</td>
              <td className="num">{cell(r, "winPct", (x) => (x.winPct * 100).toFixed(1) + "%")}</td>
              <td className="num">{cell(r, "pf", (x) => x.pf.toFixed(1))}</td>
              <td className="num">{cell(r, "pa", (x) => x.pa.toFixed(1))}</td>
              <td className="num">{cell(r, "avg", (x) => x.avg.toFixed(1))}</td>
              <td className="num">{cell(r, "high", (x) => x.high.toFixed(1))}</td>
              <td className="num">{cell(r, "low", (x) => x.low.toFixed(1))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Schedule({ yearData }) {
  const weeks = yearData.regularWeeks;
  const [wk, setWk] = useState(weeks[0]);
  const games = yearData.schedule[wk] || [];
  return (
    <div>
      <div className="subtabs">
        {weeks.map((w) => (
          <button key={w} className={"subtab" + (w === wk ? " active" : "")} onClick={() => setWk(w)}>
            Wk {w}
          </button>
        ))}
      </div>
      {games.map((g, i) => {
        const aWin = g.scoreA > g.scoreB;
        const bWin = g.scoreB > g.scoreA;
        return (
          <div className="matchup" key={i}>
            <div className={"matchup-row" + (aWin ? " winner" : "")}>
              <span>{g.teamA}</span>
              <span className={"num" + (aWin ? " score-win" : "")}>{g.scoreA.toFixed(1)}</span>
            </div>
            <div className={"matchup-row" + (bWin ? " winner" : "")}>
              <span>{g.teamB}</span>
              <span className={"num" + (bWin ? " score-win" : "")}>{g.scoreB.toFixed(1)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ArchivesExplorer({ seasons, perYear, allTime }) {
  const [year, setYear] = useState("all");
  const [tab, setTab] = useState("regular");

  const rows =
    tab === "playoff"
      ? year === "all" ? allTime.playoff : perYear[year].playoff
      : year === "all" ? allTime.regular : perYear[year].regular;

  return (
    <div>
      <div className="tabs">
        <button className={"tab-btn" + (year === "all" ? " active" : "")} onClick={() => setYear("all")}>
          All Time
        </button>
        {seasons.map((y) => (
          <button key={y} className={"tab-btn" + (year === y ? " active" : "")} onClick={() => setYear(y)}>
            {y}
          </button>
        ))}
      </div>

      <div className="tabs" style={{ marginTop: 4 }}>
        {[["regular", "Regular Season"], ["playoff", "Playoffs"], ["schedule", "Schedule"]].map(([k, label]) => (
          <button key={k} className={"tab-btn alt" + (tab === k ? " active" : "")} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "schedule" ? (
        year === "all" ? (
          <div className="notice">Pick a season above to view its weekly schedule.</div>
        ) : (
          <Schedule yearData={perYear[year]} />
        )
      ) : (
        <StatTable rows={rows} key={tab + year} />
      )}
    </div>
  );
}
