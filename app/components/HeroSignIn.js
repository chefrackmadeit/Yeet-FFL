"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Global "Sign In" CTA for the hero (next to League Rules). Clicking it reveals
// an email field + "Send link". After the link is sent it shows a check-email
// note. Once the visitor is signed in, the whole thing disappears.
export default function HeroSignIn() {
  const supabase = useState(() => createClient())[0];
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setShowForm(false);
        setSent(false);
      }
    });
    return () => sub?.subscription?.unsubscribe();
  }, [supabase]);

  async function sendLink(e) {
    e.preventDefault();
    if (!email.trim() || !supabase) return;
    await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setSent(true);
  }

  // Hide entirely if reactions aren't configured, until we know auth state, or
  // once the visitor is signed in.
  if (!supabase || !ready || user) return null;

  if (sent) {
    return <span className="hero-signin-note">Please check your email.</span>;
  }

  if (showForm) {
    return (
      <form className="hero-signin" onSubmit={sendLink}>
        <input
          type="email"
          required
          autoFocus
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn" type="submit">
          Send link
        </button>
      </form>
    );
  }

  return (
    <button className="btn" onClick={() => setShowForm(true)}>
      🔑 Sign In
    </button>
  );
}
