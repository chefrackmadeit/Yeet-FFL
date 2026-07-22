"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const BASE_COLS = [
  { key: "team", label: "Team", type: "text" },
  { key: "wins", label: "W", type: "num" },
  { key: "losses", label: "L", type: "num" },
  { key: "winPct", label: "Win %", type: "num" },
  { key: "pointsFor", label: "PF", type: "num" },
  { key: "pointsAgainst", label: "PA", type: "num" },
];
const ODDS_COL = { key: "titleProb", label: "Title %", type: "num" };

export default function StandingsTabs({ sets }) {
  const [active, setActive] = useState(0);
  const [sortKey, setSortKey] = useState("wins");
  const [dir, setDir] = useState("desc");

  const set = sets[active] || sets[0];
  const cols = set.isCurrent ? [...BASE_COLS, ODDS_COL] : BASE_COLS;

  function onSort(key) {
    if (key === sortKey) {
      setDir(dir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setDir(key === "team" ? "asc" : "desc");
    }
  }

  const rows = useMemo(() => {
    const col = cols.find((c) => c.key === sortKey) || BASE_COLS[1];
    const copy = [...set.rows];
    copy.sort((a, b) => {
      let res;
      if (col.type === "text") res = String(a[sortKey]).localeCompare(String(b[sortKey]));
      else res = (a[sortKey] || 0) - (b[sortKey] || 0);
      if (res === 0) res = b.wins - a.wins || b.pointsFor - a.pointsFor;
      return dir === "asc" ? res : -res;
    });
    return copy;
  }, [set, sortKey, dir, cols]);

  const arrow = (key) =>
    key === sortKey ? <span className="arrow">{dir === "asc" ? "▲" : "▼"}</span> : null;

  return (
    <div>
      <div className="tabs">
        {sets.map((s, i) => (
          <button
            key={s.leagueId}
            className={"tab-btn" + (i === active ? " active" : "")}
            onClick={() => setActive(i)}
          >
            {s.season}
            {s.isCurrent ? " (Current)" : ""}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="rank">#</th>
              {cols.map((c) => (
                <th
                  key={c.key}
                  className={"sortable" + (c.type === "num" ? " num" : "")}
                  onClick={() => onSort(c.key)}
                >
                  {c.label}
                  {arrow(c.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const isChamp = String(r.rosterId) === String(set.champRosterId);
              const isLoser = String(r.rosterId) === String(set.loserRosterId);
              return (
                <tr key={r.rosterId}>
                  <td className="rank">{i + 1}</td>
                  <td>
                    <div className="team-cell">
                      {r.avatar && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="avatar" src={r.avatar} alt="" />
                      )}
                      <div>
                        <div>
                          <Link href={`/manager/${r.userId}`} className="team-link">
                            {r.team}
                          </Link>
                          {isChamp && <span title="Champion"> 🏆</span>}
                          {isLoser && <span title="Burger Bound"> 🍔</span>}
                        </div>
                        <div className="sub">{r.manager}</div>
                      </div>
                    </div>
                  </td>
                  <td className="num">{r.wins}</td>
                  <td className="num">{r.losses}</td>
                  <td className="num">{(r.winPct * 100).toFixed(1)}%</td>
                  <td className="num">{r.pointsFor.toFixed(1)}</td>
                  <td className="num">{r.pointsAgainst.toFixed(1)}</td>
                  {set.isCurrent && (
                    <td className="num">{((r.titleProb || 0) * 100).toFixed(1)}%</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="sub" style={{ marginTop: 12 }}>
        🏆 champion · 🍔 last place. Click a column to sort.
        {set.isCurrent && " Title % is a for-fun projection from record + scoring."}
      </p>
    </div>
  );
}
