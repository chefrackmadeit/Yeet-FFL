"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const COLUMNS = [
  { key: "team", label: "Team", type: "text", align: "left" },
  { key: "wins", label: "W", type: "num" },
  { key: "losses", label: "L", type: "num" },
  { key: "winPct", label: "Win %", type: "num" },
  { key: "pointsFor", label: "PF", type: "num" },
  { key: "pointsAgainst", label: "PA", type: "num" },
];

export default function SortableStandings({ rows }) {
  // Default: by wins, then points-for (highest first), matching the standings page.
  const [sortKey, setSortKey] = useState("wins");
  const [dir, setDir] = useState("desc");

  function onSort(key) {
    if (key === sortKey) {
      setDir(dir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      // Text sorts A→Z by default; numbers high→low by default.
      setDir(key === "team" ? "asc" : "desc");
    }
  }

  const sorted = useMemo(() => {
    const col = COLUMNS.find((c) => c.key === sortKey);
    const copy = [...rows];
    copy.sort((a, b) => {
      let res;
      if (col.type === "text") {
        res = String(a[sortKey]).localeCompare(String(b[sortKey]));
      } else {
        res = (a[sortKey] || 0) - (b[sortKey] || 0);
      }
      if (res === 0) res = b.wins - a.wins || b.pointsFor - a.pointsFor;
      return dir === "asc" ? res : -res;
    });
    return copy;
  }, [rows, sortKey, dir]);

  const arrow = (key) =>
    key === sortKey ? <span className="arrow">{dir === "asc" ? "▲" : "▼"}</span> : null;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th className="rank">#</th>
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                className={"sortable" + (c.align === "left" ? "" : " num")}
                onClick={() => onSort(c.key)}
              >
                {c.label}
                {arrow(c.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
