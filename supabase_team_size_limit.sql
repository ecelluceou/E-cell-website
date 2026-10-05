-- Run this in the Supabase SQL Editor.
-- Adds an optional max team size per team event, enforced for create + join.

alter table public.events
  add column if not exists max_team_size int
  check (max_team_size is null or max_team_size >= 1);

create or replace function public.enforce_team_size_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_max int;
  v_count int;
begin
  select e.max_team_size into v_max
  from public.case_study_teams t
  join public.events e on e.id = t.event_id
  where t.id = new.team_id;

  if v_max is null then
    return new;
  end if;

  select count(*) into v_count from public.case_study_members where team_id = new.team_id;
  if v_count >= v_max then
    raise exception 'This team is full (maximum % members allowed).', v_max;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_team_size_limit on public.case_study_members;
create trigger trg_enforce_team_size_limit
  before insert on public.case_study_members
  for each row execute function public.enforce_team_size_limit();
