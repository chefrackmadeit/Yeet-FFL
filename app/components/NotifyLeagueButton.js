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
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

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

  async function notify(test) {
    if (busy) return;
    const ok = window.confirm(
      test
        ? "Send a test email to just yourself?"
        : "Email ALL league managers about the newest post?"
    );
    if (!ok) return;
    setBusy(true);
    setMsg("");
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch("/api/notify-league", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data?.session?.access_token || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ test }),
      });
      const out = await res.json();
      if (res.ok) setMsg(test ? "Test sent to you ✓" : `Sent to ${out.count} managers ✓`);
      else setMsg(out.error || "Something went wrong.");
    } catch {
      setMsg("Something went wrong.");
    }
    setBusy(false);
  }

  return (
    <span className="notify-league-wrap">
      <button className="btn btn-coral" onClick={() => notify(false)} disabled={busy}>
        {busy ? "Sending…" : "Notify League"}
      </button>
      <button className="link-btn" onClick={() => notify(true)} disabled={busy}>
        Test to myself
      </button>
      {msg && <span className="notify-league-msg">{msg}</span>}
    </span>
  );
}
