"use client";

import { useMemo, useState } from "react";

function ordinal(n) {
  if (n == null) return "—";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const POS_ORDER = ["QB", "RB", "WR", "TE", "K", "DEF"];
const POS_COLOR = {
  QB: "#a175ff",
  RB: "#3ddc97",
  WR: "#ff5fa2",
  TE: "#ff9457",
  K: "#f4c430",
  DEF: "#6aa9ff",
};
const colorFor = (p) => POS_COLOR[p] || "#8a93b5";

export default function ManagerTabs({ seasons, draft, players }) {
  const [tab, setTab] = useState("seasons");
  return (
    <div>
      <div className="tabs">
        {[["seasons", "Seasons"], ["draft", "Draft"], ["players", "Players"]].map(
          ([k, label]) => (
            <button
              key={k}
              className={"tab-btn" + (tab === k ? " active" : "")}
              onClick={() => setTab(k)}
            >
              {label}
            </button>
          )
        )}
      </div>
      {tab === "seasons" && <SeasonsTable seasons={seasons} />}
      {tab === "draft" && <DraftTab draft={draft} />}
      {tab === "players" && <PlayersTab players={players} seasons={seasons} />}
    </div>
  );
}

function SeasonsTable({ seasons }) {
  const t = seasons.reduce(
    (a, s) => {
      a.wins += s.wins; a.losses += s.losses; a.ties += s.ties;
      a.pf += s.pf; a.pa += s.pa; a.games += s.games; a.waivers += s.waivers || 0;
      if (s.playedGames && s.high > a.high) a.high = s.high;
      if (s.playedGames && (a.low === null || s.low < a.low)) a.low = s.low;
      return a;
    },
    { wins: 0, losses: 0, ties: 0, pf: 0, pa: 0, games: 0, waivers: 0, high: 0, low: null }
  );
  const tg = t.wins + t.losses + t.ties;

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
            <th className="num">PPG</th>
            <th className="num">Waivers</th>
            <th className="num">Most</th>
            <th className="num">Least</th>
          </tr>
        </thead>
        <tbody>
          <tr className="total-row">
            <td>Total</td>
            <td>—</td>
            <td className="num">{t.wins}</td>
            <td className="num">{t.losses}</td>
            <td className="num">{tg ? ((t.wins / tg) * 100).toFixed(1) : "0.0"}%</td>
            <td className="num">{t.pf.toFixed(1)}</td>
            <td className="num">{t.pa.toFixed(1)}</td>
            <td className="num">{tg ? (t.pf / tg).toFixed(1) : "0.0"}</td>
            <td className="num">{t.waivers}</td>
            <td className="num">{t.high.toFixed(1)}</td>
            <td className="num">{(t.low ?? 0).toFixed(1)}</td>
          </tr>
          {seasons.map((s) => (
            <tr key={s.season}>
              <td>{s.season}</td>
              <td>{ordinal(s.place)}</td>
              <td className="num">{s.wins}</td>
              <td className="num">{s.losses}</td>
              <td className="num">{(s.winPct != null ? s.winPct * 100 : (s.games ? (s.wins / s.games) * 100 : 0)).toFixed(1)}%</td>
              <td className="num">{s.pf.toFixed(1)}</td>
              <td className="num">{s.pa.toFixed(1)}</td>
              <td className="num">{s.ppg.toFixed(1)}</td>
              <td className="num">{s.waivers ?? 0}</td>
              <td className="num">{s.high.toFixed(1)}</td>
              <td className="num">{s.low.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DraftTab({ draft }) {
  const rounds = [];
  for (let r = 1; r <= (draft.maxRound || 0); r++) rounds.push(r);
  const positions = POS_ORDER.filter((p) =>
    rounds.some((r) => draft.tendency?.[r]?.[p])
  );
  // include any non-standard positions that appear
  for (const r of rounds) {
    for (const p of Object.keys(draft.tendency?.[r] || {})) {
      if (!positions.includes(p)) positions.push(p);
    }
  }
  const maxTotal = Math.max(
    1,
    ...rounds.map((r) =>
      Object.values(draft.tendency?.[r] || {}).reduce((a, b) => a + b, 0)
    )
  );

  const W = 640, H = 260, padL = 34, padB = 46, padT = 10;
  const plotH = H - padB - padT;
  const bw = rounds.length ? (W - padL - 10) / rounds.length : 0;

  return (
    <div>
      <div className="table-wrap" style={{ marginBottom: 18 }}>
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th className="num">Pick Position</th>
            </tr>
          </thead>
          <tbody>
            {draft.perYear.map((y) => (
              <tr key={y.season}>
                <td>{y.season}</td>
                <td className="num">{y.slot != null ? ordinal(y.slot) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Pick Tendencies</h3>
      {rounds.length === 0 ? (
        <div className="notice">No draft history available.</div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 480 }}>
              {[0, 0.5, 1].map((f) => {
                const y = padT + plotH * (1 - f);
                return (
                  <g key={f}>
                    <line x1={padL} y1={y} x2={W - 10} y2={y} stroke="var(--border)" strokeWidth="1" />
                    <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
                      {Math.round(maxTotal * f)}
                    </text>
                  </g>
                );
              })}
              {rounds.map((r, i) => {
                const counts = draft.tendency?.[r] || {};
                let yTop = padT + plotH;
                const x = padL + i * bw + bw * 0.16;
                const w = bw * 0.68;
                return (
                  <g key={r}>
                    {positions.map((p) => {
                      const c = counts[p] || 0;
                      if (!c) return null;
                      const h = (plotH * c) / maxTotal;
                      yTop -= h;
                      return <rect key={p} x={x} y={yTop} width={w} height={h} fill={colorFor(p)} rx="2" />;
                    })}
                    <text x={x + w / 2} y={H - padB + 18} textAnchor="middle" fontSize="11" fill="var(--muted)">
                      R{r}
                    </text>
                  </g>
                );
              })}
              <text x={padL} y={H - 6} fontSize="11" fill="var(--muted)">Rounds → players drafted (all years)</text>
            </svg>
          </div>
          <div className="pos-legend">
            {positions.map((p) => (
              <span key={p} className="pos-key">
                <span className="pos-swatch" style={{ background: colorFor(p) }} />
                {p}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PlayersTab({ players, seasons }) {
  const years = seasons.map((s) => s.season);
  const [acq, setAcq] = useState("draft");
  const [year, setYear] = useState("all");
  const [pos, setPos] = useState("ALL");
  const [sortKey, setSortKey] = useState("points");
  const [dir, setDir] = useState("desc");

  const positions = ["ALL", ...POS_ORDER.filter((p) => players.some((r) => r.position === p))];

  const rows = useMemo(() => {
    let list = players.filter((r) => r.acq === acq);
    if (year !== "all") list = list.filter((r) => r.year === year);
    if (pos !== "ALL") list = list.filter((r) => r.position === pos);

    if (year === "all") {
      const byId = {};
      for (const r of list) {
        const t = byId[r.playerId] || (byId[r.playerId] = { playerId: r.playerId, name: r.name, position: r.position, starts: 0, points: 0, best: 0 });
        t.starts += r.starts; t.points += r.points; if (r.best > t.best) t.best = r.best;
      }
      list = Object.values(byId);
    }

    const num = (r) => (sortKey === "name" ? 0 : r[sortKey] || 0);
    list.sort((a, b) => {
      let res = sortKey === "name" ? String(a.name).localeCompare(String(b.name)) : num(a) - num(b);
      return dir === "asc" ? res : -res;
    });
    return list;
  }, [players, acq, year, pos, sortKey, dir]);

  function onSort(k) {
    if (k === sortKey) setDir(dir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setDir(k === "name" ? "asc" : "desc"); }
  }
  const arrow = (k) => (k === sortKey ? <span className="arrow">{dir === "asc" ? "▲" : "▼"}</span> : null);

  return (
    <div>
      <div className="tabs">
        <button className={"tab-btn alt" + (acq === "draft" ? " active" : "")} onClick={() => setAcq("draft")}>
          Players Drafted
        </button>
        <button className={"tab-btn alt" + (acq === "wire" ? " active" : "")} onClick={() => setAcq("wire")}>
          Players Acquired
        </button>
      </div>

      <div className="filters">
        <label>
          Year&nbsp;
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="all">All Time</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
        <label>
          Position&nbsp;
          <select value={pos} onChange={(e) => setPos(e.target.value)}>
            {positions.map((p) => (
              <option key={p} value={p}>{p === "ALL" ? "All" : p}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="sortable" onClick={() => onSort("name")}>Player{arrow("name")}</th>
              <th className="sortable num" onClick={() => onSort("starts")}>Starts{arrow("starts")}</th>
              <th className="sortable num" onClick={() => onSort("points")}>Total Points{arrow("points")}</th>
              <th className="sortable num" onClick={() => onSort("best")}>Best Game{arrow("best")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="sub">No players for this filter.</td></tr>
            ) : (
              rows.map((p) => (
                <tr key={p.playerId + (p.year || "")}>
                  <td>{p.name} <span className="sub">· {p.position}</span></td>
                  <td className="num">{p.starts}</td>
                  <td className="num">{p.points.toFixed(1)}</td>
                  <td className="num">{p.best.toFixed(1)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
