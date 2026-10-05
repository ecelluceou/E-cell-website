-- Run this in the Supabase SQL Editor.
-- Lets admins choose per-event whether registration is solo or team-based.

alter table public.events
  add column if not exists registration_type text not null default 'solo'
  check (registration_type in ('solo', 'team'));

-- Existing case study events keep their team flow.
update public.events
set registration_type = 'team'
where lower(title) like '%case study%';
