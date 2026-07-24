"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const EMOJIS = ["👍", "🔥", "😂", "😮", "🍔"];

export default function ReactionBar({ postId }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [manager, setManager] = useState(null);
  const [rows, setRows] = useState([]);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase
      .from("reactions")
      .select("kind, manager_name, user_id")
      .eq("post_id", postId);
    setRows(data || []);
  }

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        setSent(false);
        setShowForm(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setSent(false);
        setShowForm(false);
      }
    });
    load();
    return () => sub?.subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, postId]);

  useEffect(() => {
    if (!supabase || !user?.email) {
      setManager(null);
      return;
    }
    supabase
      .from("managers")
      .select("display_name, team_name")
      .eq("email", user.email.toLowerCase())
      .maybeSingle()
      .then(({ data }) => setManager(data || null));
  }, [supabase, user]);

  if (!supabase) return null; // reactions not configured yet

  const byKind = {};
  for (const r of rows) (byKind[r.kind] = byKind[r.kind] || []).push(r.manager_name);
  const mine = new Set(
    rows.filter((r) => user && r.user_id === user.id).map((r) => r.kind)
  );

  async function toggleEmoji(kind) {
    if (!user || !manager) return setShowForm(true);
    if (mine.has(kind)) {
      await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("kind", kind);
    } else {
      await supabase.from("reactions").insert({ post_id: postId, user_id: user.id, kind, manager_name: manager.display_name });
    }
    load();
  }

  async function vote(dir) {
    if (!user || !manager) return setShowForm(true);
    const other = dir === "up" ? "down" : "up";
    await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("kind", other);
    if (mine.has(dir)) {
      await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("kind", dir);
    } else {
      await supabase.from("reactions").insert({ post_id: postId, user_id: user.id, kind: dir, manager_name: manager.display_name });
    }
    load();
  }

  async function sendLink(e) {
    e.preventDefault();
    if (!email.trim()) return;
    await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setSent(true);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setManager(null);
    setShowForm(false);
    setSent(false);
  }

  const up = (byKind["up"] || []).length;
  const down = (byKind["down"] || []).length;

  return (
    <div className="reactions">
      <div className="react-row">
        <button className={"react-vote" + (mine.has("up") ? " on" : "")} onClick={() => vote("up")} title="Upvote">
          ▲ {up}
        </button>
        <button className={"react-vote" + (mine.has("down") ? " on" : "")} onClick={() => vote("down")} title="Downvote">
          ▼ {down}
        </button>
        <span className="react-divider" />
        {EMOJIS.map((em) => {
          const who = byKind[em] || [];
          return (
            <button
              key={em}
              className={"react-chip" + (mine.has(em) ? " on" : "")}
              onClick={() => toggleEmoji(em)}
            >
              <span className="react-emoji">{em}</span>
              {who.length > 0 && <span className="react-count">{who.length}</span>}
              {who.length > 0 && <span className="react-tip">{who.join(", ")}</span>}
            </button>
          );
        })}
      </div>

      <div className="react-auth">
        {user && manager ? (
          <span className="sub">
            Signed in as {manager.display_name} ·{" "}
            <button className="link-btn" onClick={signOut}>sign out</button>
          </span>
        ) : user && !manager ? (
          <span className="sub">
            This account isn’t on the league roster.{" "}
            <button className="link-btn" onClick={signOut}>sign out</button>
          </span>
        ) : sent ? (
          <span className="sub">Check your email for a sign-in link.</span>
        ) : showForm ? (
          <form className="react-signin" onSubmit={sendLink}>
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn" type="submit">Send link</button>
          </form>
        ) : (
          <button className="link-btn" onClick={() => setShowForm(true)}>
            Sign in to react
          </button>
        )}
      </div>
    </div>
  );
}
