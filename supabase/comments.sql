-- ===========================================================================
-- YEET FFL — comments on posts
-- Paste into Supabase → SQL Editor → Run. Safe to re-run.
-- Mirrors the reactions table: one row per comment, tied to a signed-in,
-- allowlisted manager.
-- ===========================================================================

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  post_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  manager_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_id, created_at);

alter table public.comments enable row level security;

-- Anyone can read comments (so counts + text show for everyone).
drop policy if exists "read comments" on public.comments;
create policy "read comments" on public.comments for select using (true);

-- Only an allowlisted, logged-in user may add their own comments.
drop policy if exists "insert comments" on public.comments;
create policy "insert comments" on public.comments for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.managers m
    where m.email = lower(auth.jwt() ->> 'email')
  )
);

-- Users may delete their own comments.
drop policy if exists "delete comments" on public.comments;
create policy "delete comments" on public.comments for delete using (
  auth.uid() = user_id
);
