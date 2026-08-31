"use client";

import { useEffect, useState } from "react";

// Countdown targets. Edit the dates here if anything moves.
// NFL Kickoff 2026: Sept 9, 2026, 8:20 PM Eastern (-04:00 EDT).
const COUNTDOWNS = [
  {
    label: "🏈 NFL Kickoff Countdown",
    target: new Date("2026-09-09T20:20:00-04:00").getTime(),
    done: "It's game time! 🎉",
  },
];

function diff(target) {
  const ms = target - Date.now();
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

function Unit({ value, label }) {
  return (
    <div className="count-unit">
      <div className="count-num">{String(value).padStart(2, "0")}</div>
      <div className="count-lab">{label}</div>
    </div>
  );
}

function Countdown({ label, target, done, note }) {
  // Start null so server and first client render match (no hydration mismatch).
  const [t, setT] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="banner-inner">
      <span className="banner-label">{label}</span>
      {!mounted ? (
        <span className="banner-label">Loading…</span>
      ) : t ? (
        <div className="countdown">
          <Unit value={t.days} label="Days" />
          <Unit value={t.hours} label="Hours" />
          <Unit value={t.minutes} label="Minutes" />
          <Unit value={t.seconds} label="Seconds" />
        </div>
      ) : (
        <span className="banner-label">{done}</span>
      )}
      {note && <span className="banner-note">{note}</span>}
    </div>
  );
}

export default function CountdownBanner() {
  return (
    <div className="banner">
      {COUNTDOWNS.map((c) => (
        <Countdown
          key={c.label}
          label={c.label}
          target={c.target}
          done={c.done}
          note={c.note}
        />
      ))}
    </div>
  );
}
