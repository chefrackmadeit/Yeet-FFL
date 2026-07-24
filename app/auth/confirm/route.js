import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Token-hash magic-link handler. Unlike the PKCE (?code=) flow, this verifies
// the link server-side with no browser-stored verifier, so it works even when
// the email opens in a different browser/tab than the one that requested it
// (i.e. on phones). Sets the session cookies on the redirect response.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") || "/";
  const redirectTo = `${origin}${next}`;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (token_hash && type && url && key) {
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
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return response;
  }

  return NextResponse.redirect(`${origin}/`);
}
