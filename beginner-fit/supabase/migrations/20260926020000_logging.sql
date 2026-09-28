-- Workout logging + weekly adaptation.

-- Which plan day a log belongs to (index into plans.days). Drives "what's next" on Today.
alter table public.workout_logs add column day smallint not null default 0 check (day >= 0);

-- What the weekly adjustment changed, in plain sentences, and whether to suggest seeing a professional.
alter table public.plans add column changes text[] not null default '{}';
alter table public.plans add column see_professional boolean not null default false;

-- Logs may only point at the user's own plan.
drop policy "Users add their own logs" on public.workout_logs;
create policy "Users add their own logs" on public.workout_logs
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.plans p where p.id = plan_id and p.user_id = (select auth.uid()))
  );
