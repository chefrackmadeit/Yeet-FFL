"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const EMOJIS = ["👍", "🔥", "😂", "😮", "🍔"];

// Extra emojis shown in the "+" pop-up picker (iMessage-style).
const MORE_EMOJIS = [
  "❤️", "😍", "🤣", "😭", "😡", "🤯", "🎉", "💯",
  "👀", "🙌", "😅", "😬", "🥶", "🫡", "🤝", "💀",
  "🏈", "🐐", "🚮", "🧢", "👑", "🥲", "😤", "🤔",
  "👏", "🙈", "💩", "🫠", "😈", "🤙",
];

// Short relative time for comment timestamps ("2h ago").
function relTime(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function ReactionBar({ postId }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [manager, setManager] = useState(null);
  const [rows, setRows] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState("");
  const errTimer = useRef(null);

  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  function flashSignInError() {
    setError("Please sign in to react");
    clearTimeout(errTimer.current);
    errTimer.current = setTimeout(() => setError(""), 3500);
  }

  async function load() {
    if (!supabase) return;
    const { data } = await supabase
      .from("reactions")
      .select("kind, manager_name, user_id")
      .eq("post_id", postId);
    setRows(data || []);
  }

  async function loadComments() {
    if (!supabase) return;
    const { data } = await supabase
      .from("comments")
      .select("id, user_id, manager_name, body, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setComments(data || []);
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
    loadComments();
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
    if (!user) return flashSignInError();
    if (!manager) return;

    if (mine.has(kind)) {
      await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("kind", kind);
    } else {
      await supabase.from("reactions").insert({ post_id: postId, user_id: user.id, kind, manager_name: manager.display_name });
    }
    load();
  }

  async function vote(dir) {
    if (!user) return flashSignInError();
    if (!manager) return;

    const other = dir === "up" ? "down" : "up";
    await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("kind", other);
    if (mine.has(dir)) {
      await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("kind", dir);
    } else {
      await supabase.from("reactions").insert({ post_id: postId, user_id: user.id, kind: dir, manager_name: manager.display_name });
    }
    load();
  }

  async function postComment(e) {
    e.preventDefault();
    if (!user || !manager) return;
    const text = draft.trim();
    if (!text) return;
    setPosting(true);
    await supabase.from("comments").insert({
      post_id: postId,
      user_id: user.id,
      manager_name: manager.display_name,
      body: text,
    });
    setDraft("");
    await loadComments();
    setPosting(false);
  }

  async function deleteComment(id) {
    if (!user) return;
    await supabase.from("comments").delete().eq("id", id).eq("user_id", user.id);
    loadComments();
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
        <button className={"react-vote react-up" + (mine.has("up") ? " on" : "")} onClick={() => vote("up")} title="Upvote">
          ▲ {up}
        </button>
        <button className={"react-vote react-down" + (mine.has("down") ? " on" : "")} onClick={() => vote("down")} title="Downvote">
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

      <button
        className={"comment-toggle" + (showComments ? " on" : "")}
        onClick={() => setShowComments((v) => !v)}
      >
        Comment{comments.length > 0 ? ` (${comments.length})` : ""}
      </button>

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
      ) : error ? (
        <div className="react-auth">
          <span className="react-error">{error}</span>
        </div>
      ) : null}

      {showComments && (
        <div className="comments">
          {comments.length === 0 && (
            <p className="sub comments-empty">No comments yet.</p>
          )}
          {comments.map((c) => (
            <div className="comment" key={c.id}>
              <div className="comment-head">
                <span className="comment-author">{c.manager_name}</span>
                <span className="comment-time">{relTime(c.created_at)}</span>
                {user && c.user_id === user.id && (
                  <button
                    className="comment-del"
                    onClick={() => deleteComment(c.id)}
                    title="Delete comment"
                    aria-label="Delete comment"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="comment-body">{c.body}</div>
            </div>
          ))}

          {user && manager ? (
            <form className="comment-form" onSubmit={postComment}>
              <textarea
                rows={2}
                placeholder="Add a comment…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button
                className="btn btn-coral"
                type="submit"
                disabled={posting || !draft.trim()}
              >
                {posting ? "Posting…" : "Post"}
              </button>
            </form>
          ) : user && !manager ? (
            <p className="sub">This email isn’t on the league roster yet.</p>
          ) : (
            <p className="sub comment-signin">Sign in to comment.</p>
          )}
        </div>
      )}
    </div>
  );
}
