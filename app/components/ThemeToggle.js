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

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label="Toggle light / dark mode"
      title="Toggle light / dark mode"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
