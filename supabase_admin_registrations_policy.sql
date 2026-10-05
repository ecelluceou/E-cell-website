-- Run this in the Supabase SQL Editor.
-- Adds admin write policies to registrations so admins can mark attendance/wins.

-- event_registrations policies
create policy "event_registrations admin update"
  on public.event_registrations for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- case_study_members policies
create policy "case_study_members admin update"
  on public.case_study_members for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Also add select policies just in case admins need them 
create policy "event_registrations admin select"
  on public.event_registrations for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "case_study_members admin select"
  on public.case_study_members for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
