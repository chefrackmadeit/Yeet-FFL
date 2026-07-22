"use client";

import { useEffect, useState } from "react";

// NFL Kickoff 2026: Sept 9, 2026, 8:20 PM Eastern (-04:00 EDT).
const TARGET = new Date("2026-09-09T20:20:00-04:00").getTime();

function diff() {
  const ms = TARGET - Date.now();
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

export default function CountdownBanner() {
  // Start null so server and first client render match (no hydration mismatch).
  const [t, setT] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setT(diff());
    const id = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="banner">
      <div className="banner-inner">
        <span className="banner-label">🏈 NFL Kickoff Countdown</span>
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
          <span className="banner-label">It&apos;s game time! 🎉</span>
        )}
      </div>
    </div>
  );
}
