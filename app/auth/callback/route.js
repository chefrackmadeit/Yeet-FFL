import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Magic-link lands here with ?code=... — exchange it for a session and write
// the auth cookies onto the redirect response so the login persists.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";
  const redirectTo = `${origin}${next}`;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (code && url && key) {
    const response = NextResponse.redirect(redirectTo);
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });
    await supabase.auth.exchangeCodeForSession(code);
    return response;
  }

  return NextResponse.redirect(redirectTo);
}
