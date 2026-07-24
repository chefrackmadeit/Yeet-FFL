-- ===========================================================================
-- YEET FFL — reactions + login schema
-- Paste this whole file into Supabase → SQL Editor → Run.
-- Safe to re-run (uses "if not exists" / "on conflict").
-- ===========================================================================

-- 1) Allowlist: which emails may log in, and which manager each one is.
create table if not exists public.managers (
  email text primary key,
  sleeper_user_id text,
  display_name text not null,
  team_name text
);

-- 2) Reactions on posts (emoji reactions + up/down votes share this table).
create table if not exists public.reactions (
  id bigint generated always as identity primary key,
  post_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  manager_name text not null,
  kind text not null,                    -- an emoji ('👍') or 'up' / 'down'
  created_at timestamptz not null default now(),
  unique (post_id, user_id, kind)
);
create index if not exists reactions_post_idx on public.reactions (post_id);

-- 3) Row Level Security ------------------------------------------------------
alter table public.managers enable row level security;
alter table public.reactions enable row level security;

-- Anyone can read the roster mapping and the reactions (for counts + names).
drop policy if exists "read managers" on public.managers;
create policy "read managers" on public.managers for select using (true);

drop policy if exists "read reactions" on public.reactions;
create policy "read reactions" on public.reactions for select using (true);

-- Only an allowlisted, logged-in user may add their own reactions.
drop policy if exists "insert reactions" on public.reactions;
create policy "insert reactions" on public.reactions for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.managers m
    where m.email = lower(auth.jwt() ->> 'email')
  )
);

-- Users may remove their own reactions.
drop policy if exists "delete reactions" on public.reactions;
create policy "delete reactions" on public.reactions for delete using (
  auth.uid() = user_id
);

-- 4) Allowlist seed ----------------------------------------------------------
-- TEST PHASE: only Mike's email is enabled, so only he can log in / react.
-- When ready to launch, add the rest of the league here (one row per manager,
-- email LOWERCASED, mapped to their Sleeper display name + team).
insert into public.managers (email, sleeper_user_id, display_name, team_name)
values ('chefrackmadeit@gmail.com', '993296992803647488', 'UncleZaddy4', 'Glizzard Wizards')
on conflict (email) do update
  set sleeper_user_id = excluded.sleeper_user_id,
      display_name = excluded.display_name,
      team_name = excluded.team_name;
