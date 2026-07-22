"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  // On mount, read whatever the no-flash script already applied.
  useEffect(() => {
    const current =
      document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("yeet-theme", next);
    } catch {}
  }

  const isLight = theme === "light";

  return (
    <button
      className={"theme-switch" + (isLight ? " light" : "")}
      onClick={toggle}
      role="switch"
      aria-checked={isLight}
      aria-label="Toggle light or dark mode"
      title="Toggle light / dark mode"
    >
      <span className="theme-switch-track">
        <span className="theme-switch-icon" aria-hidden="true">🌙</span>
        <span className="theme-switch-icon" aria-hidden="true">☀️</span>
        <span className="theme-switch-knob" />
      </span>
    </button>
  );
}
