"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const EMOJIS = ["👍", "🔥", "😂", "😮", "🍔"];

// Extra emojis shown in the "+" pop-up picker (iMessage-style).
const MORE_EMOJIS = [
  "❤️", "😍", "🤣", "😭", "😡", "🤯", "🎉", "💯",
  "👀", "🙌", "😅", "😬", "🥶", "🫡", "🤝", "💀",
  "🏈", "🐐", "🚮", "🧢", "👑", "🥲", "😤", "🤔",
  "👏", "🙈", "💩", "🫠", "😈", "🤙",
];

export default function ReactionBar({ postId }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [manager, setManager] = useState(null);
  const [rows, setRows] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

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
      if (data?.user) setUser(data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
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
    if (!user || !manager) return; // signed-out users sign in via the hero button

    if (mine.has(kind)) {
      await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("kind", kind);
    } else {
      await supabase.from("reactions").insert({ post_id: postId, user_id: user.id, kind, manager_name: manager.display_name });
    }
    load();
  }

  async function vote(dir) {
    if (!user || !manager) return; // signed-out users sign in via the hero button

    const other = dir === "up" ? "down" : "up";
    await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("kind", other);
    if (mine.has(dir)) {
      await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("kind", dir);
    } else {
      await supabase.from("reactions").insert({ post_id: postId, user_id: user.id, kind: dir, manager_name: manager.display_name });
    }
    load();
  }

  const up = (byKind["up"] || []).length;
  const down = (byKind["down"] || []).length;

  // Show the default emoji row plus any custom emoji someone has reacted with
  // (so picks from the "+" menu appear as chips too).
  const extra = Object.keys(byKind).filter(
    (k) => k !== "up" && k !== "down" && !EMOJIS.includes(k)
  );
  const shown = [...EMOJIS, ...extra];

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
        {shown.map((em) => {
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

        <div className="react-picker-wrap">
          <button
            className={"react-chip react-plus" + (showPicker ? " on" : "")}
            onClick={() => setShowPicker((v) => !v)}
            aria-label="More emojis"
            title="More emojis"
          >
            <span className="react-emoji">＋</span>
          </button>
          {showPicker && (
            <div className="react-picker">
              {MORE_EMOJIS.map((em) => (
                <button
                  key={em}
                  className={"react-pick" + (mine.has(em) ? " on" : "")}
                  onClick={() => {
                    toggleEmoji(em);
                    setShowPicker(false);
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {user && manager ? (
        <div className="react-auth">
          <span className="sub">Signed in as {manager.display_name}</span>
        </div>
      ) : user && !manager ? (
        <div className="react-auth">
          <span className="sub">
            This email isn’t on the league roster yet — text Mike to get added.
          </span>
        </div>
      ) : null}
    </div>
  );
}
