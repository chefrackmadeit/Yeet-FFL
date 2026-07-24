import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Magic-link lands here with a ?code=... — exchange it for a session (sets the
// auth cookies), then send the user back to the homepage, signed in.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }
  return NextResponse.redirect(`${origin}${next}`);
}
