-- Train together: each side opts in separately. Plans are shared only while both are on.
alter table public.buddy_links add column inviter_together boolean not null default false;
alter table public.buddy_links add column buddy_together boolean not null default false;

create function public.set_train_together(p_on boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); updated int;
begin
  if me is null then raise exception 'not signed in'; end if;
  -- Only a completed pairing can turn it on.
  update public.buddy_links set inviter_together = p_on where inviter = me and buddy is not null;
  get diagnostics updated = row_count;
  if updated = 0 then
    update public.buddy_links set buddy_together = p_on where buddy = me;
    get diagnostics updated = row_count;
  end if;
  if updated = 0 then raise exception 'no buddy'; end if;
end $$;

revoke all on function public.set_train_together(boolean) from public, anon;
grant execute on function public.set_train_together(boolean) to authenticated;
