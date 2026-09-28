-- Update 1: workout weekdays and one-buddy pairing.

-- Days the user plans to train: 0 = Monday … 6 = Sunday.
alter table public.profiles add column schedule smallint[] not null default '{}'
  check (schedule <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]);
-- What a buddy sees instead of anything else in the profile.
alter table public.profiles add column display_name text check (char_length(display_name) between 1 and 30);

-- One row per pairing. `buddy` stays null until the invite code is accepted.
-- A user can hold at most one row as inviter and one as buddy; the functions below stop them holding both.
create table public.buddy_links (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  inviter uuid not null unique references auth.users (id) on delete cascade,
  buddy uuid unique references auth.users (id) on delete cascade,
  paired_on date,
  created_at timestamptz not null default now(),
  check (buddy is null or buddy <> inviter)
);
alter table public.buddy_links enable row level security;
create policy "Members read their link" on public.buddy_links
  for select to authenticated using ((select auth.uid()) in (inviter, buddy));
-- Either side can end the pairing. Nobody can insert or edit rows directly: the functions do it.
create policy "Members remove their link" on public.buddy_links
  for delete to authenticated using ((select auth.uid()) in (inviter, buddy));

create function public.create_buddy_invite() returns text
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); existing text; new_code text;
begin
  if me is null then raise exception 'not signed in'; end if;
  if exists (select 1 from public.buddy_links where buddy = me) then raise exception 'already paired'; end if;
  select code into existing from public.buddy_links where inviter = me;
  if existing is not null then return existing; end if;
  new_code := upper(substr(md5(gen_random_uuid()::text), 1, 8));
  insert into public.buddy_links (code, inviter) values (new_code, me);
  return new_code;
end $$;

create function public.accept_buddy_invite(p_code text) returns void
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); updated int;
begin
  if me is null then raise exception 'not signed in'; end if;
  if exists (select 1 from public.buddy_links where inviter = me and buddy is not null) or
     exists (select 1 from public.buddy_links where buddy = me) then raise exception 'already paired'; end if;
  -- Taking someone else's invite ends any unused invite of my own.
  delete from public.buddy_links where inviter = me and buddy is null;
  update public.buddy_links set buddy = me, paired_on = current_date
    where code = upper(trim(p_code)) and buddy is null and inviter <> me;
  get diagnostics updated = row_count;
  if updated = 0 then raise exception 'invalid code'; end if;
end $$;

revoke all on function public.create_buddy_invite(), public.accept_buddy_invite(text) from public, anon;
grant execute on function public.create_buddy_invite(), public.accept_buddy_invite(text) to authenticated;
