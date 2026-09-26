-- Capy: initial schema. Every user table is private to its owner via row level security.

-- Exercise library (read-only for app users; seeded from free-exercise-db).
create table public.exercises (
  id text primary key,
  name text not null,
  level text not null,
  category text not null,
  equipment text,
  force text,
  mechanic text,
  primary_muscles text[] not null default '{}',
  secondary_muscles text[] not null default '{}',
  instructions text[] not null default '{}',
  images text[] not null default '{}',
  stress_areas text[] not null default '{}',
  stress_reviewed boolean not null default false
);
alter table public.exercises enable row level security;
create policy "Signed-in users can read exercises" on public.exercises
  for select to authenticated using (true);

-- One profile per user: onboarding answers. Contains health data — owner-only access.
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  goal text check (goal in ('lose_weight', 'get_stronger', 'feel_healthier')),
  days_per_week smallint not null default 3 check (days_per_week between 1 and 5),
  minutes_per_session smallint not null default 30 check (minutes_per_session between 10 and 90),
  place text not null default 'home' check (place in ('home', 'gym', 'outdoors')),
  gear text[] not null default '{}',
  equipment text[] not null default '{}', -- free-exercise-db equipment values derived from place + gear
  injured_areas text[] not null default '{}',
  screening jsonb not null default '{}',
  cleared_questions text[] not null default '{}',
  disclaimer_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users create their own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update their own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Weekly plans. Written by the plan-generation function; users only read their own.
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week smallint not null check (week >= 1),
  days jsonb not null, -- [[{ "exerciseId": "...", "sets": 2, "reps": 10 }]]
  source text not null check (source in ('ai', 'fallback', 'adapted')),
  created_at timestamptz not null default now(),
  unique (user_id, week)
);
alter table public.plans enable row level security;
create policy "Users read their own plans" on public.plans
  for select to authenticated using ((select auth.uid()) = user_id);

-- How each move felt.
create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plan_id uuid not null references public.plans (id) on delete cascade,
  exercise_id text not null references public.exercises (id),
  logged_on date not null default current_date,
  completed text not null check (completed in ('all', 'some', 'skip')),
  difficulty smallint check (difficulty between 1 and 3), -- 1 too easy · 2 about right · 3 too hard; null when skipped
  pain boolean not null default false,
  pain_area text check (pain_area in ('neck', 'shoulder', 'elbow', 'wrist', 'lower_back', 'hip', 'knee', 'ankle')),
  created_at timestamptz not null default now(),
  check (not pain or pain_area is not null)
);
create index workout_logs_user_plan on public.workout_logs (user_id, plan_id);
alter table public.workout_logs enable row level security;
create policy "Users read their own logs" on public.workout_logs
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add their own logs" on public.workout_logs
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users edit their own logs" on public.workout_logs
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete their own logs" on public.workout_logs
  for delete to authenticated using ((select auth.uid()) = user_id);
