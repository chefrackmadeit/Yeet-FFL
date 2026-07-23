"use client";

import { useState } from "react";

function TeamRow({ t, played }) {
  return (
    <div className={"odds-team-row" + (t.winner ? " winner" : "")}>
      <div className="odds-team-name">
        {t.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="avatar" src={t.avatar} alt="" />
        )}
        <span>{t.team}</span>
        <span className="sub">proj {t.proj.toFixed(1)}</span>
        {played && (
          <span className={"odds-score" + (t.winner ? " score-win" : "")}>
            {t.score.toFixed(1)}
          </span>
        )}
      </div>
      <div className="odds-line">
        {t.ao} · $10 to win {t.win10}
      </div>
    </div>
  );
}

export default function MatchupOdds({ weeks, defaultWeek, offseason, seasonLabel }) {
  const available = weeks.filter((w) => w.games.length > 0).map((w) => w.week);
  const [wk, setWk] = useState(
    available.includes(defaultWeek) ? defaultWeek : available[0] || 1
  );
  const current = weeks.find((w) => w.week === wk);

  return (
    <div>
      {offseason && (
        <div className="notice" style={{ marginBottom: 16 }}>
          The {seasonLabel} season is complete — showing that season's matchups
          with for-fun projected odds. Live weekly odds will appear here
          automatically once the new season kicks off.
        </div>
      )}

      <div className="subtabs">
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

      {!current || current.games.length === 0 ? (
        <div className="notice">No matchups for this week.</div>
      ) : (
        current.games.map((g, i) => (
          <div className="odds-card" key={i}>
            <TeamRow t={g.a} played={g.played} />
            <div className="odds-mid">vs</div>
            <TeamRow t={g.b} played={g.played} />
          </div>
        ))
      )}

      <p className="sub" style={{ marginTop: 12 }}>
        Odds are a for-fun projection from each team's season scoring average.
        Not real betting — no money, no wagers.
      </p>
    </div>
  );
}
