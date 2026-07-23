"use client";

import { useState } from "react";
import { winProbability, americanOdds, tenToWin } from "@/lib/odds";

function TeamRow({ t, projTone, outcome }) {
  const outClass =
    outcome === "win" ? " win-row" : outcome === "loss" ? " loss-row" : "";
  return (
    <div className={"odds-team-row" + (t.winner ? " winner" : "") + outClass}>
      <div className="odds-team-name">
        {t.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="avatar" src={t.avatar} alt="" />
        )}
        <span className="odds-team-label">{t.team}</span>
        <span className={"odds-proj " + (projTone || "muted")}>
          Proj {t.proj.toFixed(1)}
        </span>
      </div>
      <div className="odds-line">
        {t.ao} · $10 to win {t.win10}
      </div>
    </div>
  );
}

export default function MatchupOdds({ weeks, teams, defaultWeek, offseason, seasonLabel }) {
  const available = weeks.filter((w) => w.games.length > 0).map((w) => w.week);
  const [wk, setWk] = useState(
    available.includes(defaultWeek) ? defaultWeek : available[0] || 1
  );
  const current = weeks.find((w) => w.week === wk);

  // ---- Head-to-head generator ----
  const sorted = [...teams].sort((a, b) => a.team.localeCompare(b.team));
  const [idA, setIdA] = useState(sorted[0]?.rosterId ?? null);
  const [idB, setIdB] = useState(sorted[1]?.rosterId ?? sorted[0]?.rosterId ?? null);
  const tA = teams.find((t) => t.rosterId === idA);
  const tB = teams.find((t) => t.rosterId === idB);
  const pA = tA && tB ? winProbability(tA.proj, tB.proj) : 0.5;

  const genRow = (t, p) =>
    t
      ? { team: t.team, avatar: t.avatar, proj: t.proj, score: 0, winner: false, ao: americanOdds(p), win10: tenToWin(p) }
      : null;
  const genA = genRow(tA, pA);
  const genB = genRow(tB, 1 - pA);

  const Select = ({ value, onChange }) => (
    <select value={value ?? ""} onChange={(e) => onChange(Number(e.target.value))}>
      {sorted.map((t) => (
        <option key={t.rosterId} value={t.rosterId}>
          {t.team}
        </option>
      ))}
    </select>
  );

  return (
    <>
      {offseason && (
        <div className="notice" style={{ marginBottom: 16 }}>
          The {seasonLabel} season is complete — showing that season's matchups
          with for-fun projected odds. Live weekly odds will appear here
          automatically once the new season kicks off.
        </div>
      )}

      <div className="matchups-layout">
        <div className="panel matchups-weeks">
          <div className="panel-title">All Weeks</div>
          <div className="subtabs" style={{ margin: 0 }}>
            {available.map((w) => (
              <button
                key={w}
                className={"subtab" + (w === wk ? " active" : "")}
                onClick={() => setWk(w)}
              >
                Wk {w}
              </button>
            ))}
          </div>
        </div>

        <div className="matchups-right">
          <div className="panel-title">Week {wk} Matchups</div>
          {!current || current.games.length === 0 ? (
            <div className="notice">No matchups for this week.</div>
          ) : (
            current.games.map((g, i) => {
              const aFav = g.a.proj >= g.b.proj;
              const tie = g.played && !g.a.winner && !g.b.winner;
              const outA = !g.played || tie ? null : g.a.winner ? "win" : "loss";
              const outB = !g.played || tie ? null : g.b.winner ? "win" : "loss";
              return (
                <div className="odds-card" key={i}>
                  <TeamRow t={g.a} projTone={aFav ? "fav" : "dog"} outcome={outA} />
                  <div className="odds-mid">vs</div>
                  <TeamRow t={g.b} projTone={aFav ? "dog" : "fav"} outcome={outB} />
                </div>
              );
            })
          )}
        </div>

        <div className="panel matchups-h2h">
          <div className="panel-title">Head-to-Head Odds</div>
          <div className="h2h-gen">
            <Select value={idA} onChange={setIdA} />
            <div className="odds-mid">vs</div>
            <Select value={idB} onChange={setIdB} />
          </div>
          {genA && genB && (
            <div className="odds-card" style={{ marginTop: 12, marginBottom: 0 }}>
              <TeamRow t={genA} projTone={tA.proj >= tB.proj ? "fav" : "dog"} />
              <div className="odds-mid">vs</div>
              <TeamRow t={genB} projTone={tA.proj >= tB.proj ? "dog" : "fav"} />
            </div>
          )}
        </div>
      </div>

      <p className="sub" style={{ marginTop: 12 }}>
        Odds are a for-fun projection from each team's season scoring average.
        Not real betting — no money, no wagers.
      </p>
    </>
  );
}
