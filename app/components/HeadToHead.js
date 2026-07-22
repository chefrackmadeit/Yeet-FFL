"use client";

import { useState } from "react";

const STAT_ROWS = [
  { label: "Record", display: (b) => `${b.wins}-${b.losses}${b.ties ? "-" + b.ties : ""}`, cmp: (b) => b.winPct, better: "high" },
  { label: "Win %", display: (b) => (b.winPct * 100).toFixed(1) + "%", cmp: (b) => b.winPct, better: "high" },
  { label: "Total Points", display: (b) => b.pointsFor.toFixed(1), cmp: (b) => b.pointsFor, better: "high" },
  { label: "Avg Points / Game", display: (b) => b.avgPoints.toFixed(1), cmp: (b) => b.avgPoints, better: "high" },
  { label: "Highest Margin of Victory", display: (b) => b.bestWin.toFixed(1), cmp: (b) => b.bestWin, better: "high" },
  { label: "Highest Margin of Defeat", display: (b) => b.worstLoss.toFixed(1), cmp: (b) => b.worstLoss, better: "low" },
  { label: "Waiver Moves", display: (b) => String(b.waivers), cmp: (b) => b.waivers, better: "high" },
];

function ManagerCard({ m }) {
  return (
    <div className="h2h-card">
      {m.avatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="h2h-avatar" src={m.avatar} alt="" />
      )}
      <div className="h2h-team">{m.team}</div>
      <div className="sub">{m.name}</div>
    </div>
  );
}

export default function HeadToHead({ managers, stats }) {
  const [idA, setIdA] = useState(managers[0]?.userId || "");
  const [idB, setIdB] = useState(managers[1]?.userId || managers[0]?.userId || "");
  const [mode, setMode] = useState("regular");

  const mA = managers.find((m) => m.userId === idA);
  const mB = managers.find((m) => m.userId === idB);
  const a = stats[idA]?.[mode];
  const b = stats[idB]?.[mode];

  const Select = ({ value, onChange }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {managers.map((m) => (
        <option key={m.userId} value={m.userId}>
          {m.team} ({m.name})
        </option>
      ))}
    </select>
  );

  return (
    <div>
      <div className="filters">
        <label>
          Manager 1&nbsp;
          <Select value={idA} onChange={setIdA} />
        </label>
        <label>
          Manager 2&nbsp;
          <Select value={idB} onChange={setIdB} />
        </label>
      </div>

      <div className="tabs">
        <button className={"tab-btn" + (mode === "regular" ? " active" : "")} onClick={() => setMode("regular")}>
          Regular Season
        </button>
        <button className={"tab-btn" + (mode === "all" ? " active" : "")} onClick={() => setMode("all")}>
          All Time
        </button>
      </div>

      <div className="h2h-heads">
        {mA && <ManagerCard m={mA} />}
        <div className="h2h-vs">VS</div>
        {mB && <ManagerCard m={mB} />}
      </div>

      {a && b ? (
        <div className="h2h-stats">
          {STAT_ROWS.map((row) => {
            const av = row.cmp(a);
            const bv = row.cmp(b);
            const aWin = row.better === "high" ? av > bv : av < bv;
            const bWin = row.better === "high" ? bv > av : bv < av;
            return (
              <div className="h2h-row" key={row.label}>
                <div className={"h2h-val" + (aWin ? " win" : "")}>{row.display(a)}</div>
                <div className="h2h-label">{row.label}</div>
                <div className={"h2h-val" + (bWin ? " win" : "")}>{row.display(b)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="notice">Select two managers to compare.</div>
      )}

      <p className="sub" style={{ marginTop: 12 }}>
        {mode === "regular" ? "Regular season only." : "All time (regular season + playoffs)."} Better stat is highlighted green.
      </p>
    </div>
  );
}
