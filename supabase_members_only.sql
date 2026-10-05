-- Run this in the Supabase SQL Editor.
-- Adds members-only gating for events & initiatives + admin member management.

alter table public.events      add column if not exists members_only boolean not null default false;
alter table public.initiatives add column if not exists members_only boolean not null default false;
alter table public.profiles    add column if not exists is_member    boolean not null default false;

-- Admin check helper (security definer avoids RLS recursion on profiles).
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- Admins can update any profile (to grant / revoke membership).
drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update"
  on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

-- Admin-only member list, including login email.
create or replace function public.admin_list_members()
returns table (id uuid, full_name text, college text, email text, is_member boolean)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  return query
    select p.id, p.full_name::text, p.college::text, u.email::text, p.is_member
    from public.profiles p
    left join auth.users u on u.id = p.id
    order by p.is_member desc, p.full_name;
end;
$$;

-- Server-side guard: block registering for members-only events as non-member.
create or replace function public.enforce_members_only()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.events e where e.id = new.event_id and e.members_only)
     and not exists (select 1 from public.profiles p where p.id = new.user_id and p.is_member) then
    raise exception 'members_only: membership required to register for this event';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_members_only on public.event_registrations;
create trigger trg_enforce_members_only
  before insert on public.event_registrations
  for each row execute function public.enforce_members_only();
