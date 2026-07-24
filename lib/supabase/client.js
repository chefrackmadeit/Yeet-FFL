import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Returns null if the project isn't configured
// yet (so the site never crashes before the env vars are set).
//
// We use the IMPLICIT auth flow so magic links work even when the email opens
// in a different browser/tab than the one that requested it (i.e. on phones).
// The link carries the session tokens in the URL; the client reads them here.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key, {
    auth: {
      flowType: "implicit",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
