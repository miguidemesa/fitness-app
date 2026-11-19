-- Update 2: per-set logging and how long each workout took.

-- Each move's sets as logged: [{ "reps": 10, "weightKg": 8, "done": true }]. Weight is always kg.
-- Null for moves logged before sets existed.
alter table public.workout_logs add column sets jsonb
  check (sets is null or (jsonb_typeof(sets) = 'array' and jsonb_array_length(sets) <= 12));

-- One row per finished workout (plan day): how long it took and an optional note.
create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plan_id uuid not null references public.plans (id) on delete cascade,
  day smallint not null check (day >= 0),
  logged_on date not null default current_date,
  seconds integer not null check (seconds between 0 and 86400),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  unique (plan_id, day)
);
alter table public.workout_sessions enable row level security;
create policy "Users read their own sessions" on public.workout_sessions
  for select to authenticated using ((select auth.uid()) = user_id);
-- Sessions may only point at the user's own plan (same rule as logs).
create policy "Users add their own sessions" on public.workout_sessions
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.plans p where p.id = plan_id and p.user_id = (select auth.uid()))
  );
-- After saving, only the note can change.
create policy "Users edit their own session notes" on public.workout_sessions
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke update on public.workout_sessions from authenticated;
grant update (note) on public.workout_sessions to authenticated;
