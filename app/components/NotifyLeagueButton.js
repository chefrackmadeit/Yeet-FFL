"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// "Notify League" button — renders ONLY when the signed-in user is the
// commissioner. Emails all managers about the newest post via /api/notify-league
// (which independently re-verifies it's really the commissioner on the server).
const COMMISSIONER_EMAIL = "chefrackmadeit@gmail.com";

export default function NotifyLeagueButton() {
  const [supabase] = useState(() => createClient());
  const [isCommish, setIsCommish] = useState(false);
  // Which specific button is mid-send (e.g. "post", "preview-test"), or null.
  const [active, setActive] = useState(null);
  const [msg, setMsg] = useState("");
  const busy = active !== null;

  useEffect(() => {
    if (!supabase) return;
    const check = (u) =>
      setIsCommish(((u?.email) || "").toLowerCase() === COMMISSIONER_EMAIL);
    supabase.auth.getUser().then(({ data }) => check(data?.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      check(session?.user)
    );
    return () => sub?.subscription?.unsubscribe();
  }, [supabase]);

  if (!supabase || !isCommish) return null;

  // target: "post" = newest Weekly Review / YEET News post; "preview" = the
  // live Weekly Preview. test = send only to yourself.
  // target: "post" = newest Weekly Review / YEET News post; "preview" = the
  // live Weekly Preview. test = send only to yourself.
  async function notify(test, target = "post") {
    if (busy) return;
    const what = target === "preview" ? "the Weekly Preview" : "the newest post";
    const ok = window.confirm(
      test
        ? `Send a test email about ${what} to just yourself?`
        : `Email ALL league managers about ${what}?`
    );
    if (!ok) return;
    setActive(`${target}${test ? "-test" : ""}`);
    setMsg("");
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch("/api/notify-league", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data?.session?.access_token || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ test, target }),
      });
      const out = await res.json();
      if (res.ok) setMsg(test ? "Test sent to you ✓" : `Sent to ${out.count} managers ✓`);
      else setMsg(out.error || "Something went wrong.");
    } catch {
      setMsg("Something went wrong.");
    }
    setActive(null);
  }

  return (
    <span className="notify-league-wrap">
      <span className="notify-group">
        <button className="btn btn-coral" onClick={() => notify(false, "post")} disabled={busy}>
          {active === "post" ? "Sending…" : "Notify: New Post"}
        </button>
        <button className="link-btn" onClick={() => notify(true, "post")} disabled={busy}>
          {active === "post-test" ? "Sending…" : "Test to myself"}
        </button>
      </span>
      <span className="notify-group">
        <button className="btn btn-coral" onClick={() => notify(false, "preview")} disabled={busy}>
          {active === "preview" ? "Sending…" : "Notify: Weekly Preview"}
        </button>
        <button className="link-btn" onClick={() => notify(true, "preview")} disabled={busy}>
          {active === "preview-test" ? "Sending…" : "Test to myself"}
        </button>
      </span>
      {msg && <span className="notify-league-msg">{msg}</span>}
    </span>
  );
}
