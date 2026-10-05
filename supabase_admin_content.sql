-- Run this in the Supabase SQL Editor.
-- Adds admin-managed popup announcements + team members.

-- ───────── Popup announcements ─────────
create table if not exists public.popup_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null default '',
  button_text text default 'Check it out',
  button_link text default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.popup_announcements enable row level security;

create policy "popup_announcements public read"
  on public.popup_announcements for select using (true);

create policy "popup_announcements admin write"
  on public.popup_announcements for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ───────── Team members ─────────
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  quote text default '',
  image text default '',
  instagram text default '',
  linkedin text default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.team_members enable row level security;

create policy "team_members public read"
  on public.team_members for select using (true);

create policy "team_members admin write"
  on public.team_members for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- If Aneesh was already imported, change his role:
-- update public.team_members set role = 'Treasurer' where name = 'Aneesh';
