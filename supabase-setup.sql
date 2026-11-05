create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  patient_name text not null check (char_length(patient_name) between 1 and 120),
  email text not null,
  phone text not null check (char_length(phone) between 6 and 30),
  department text not null check (char_length(department) <= 120),
  doctor text not null check (char_length(doctor) <= 160),
  visit_type text not null check (visit_type in ('New Visit', 'Follow-up')),
  preferred_date date not null,
  preferred_time text not null,
  reason text check (reason is null or char_length(reason) <= 1000),
  request_status text not null default 'Request received',
  notification_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.appointments enable row level security;

revoke all on table public.appointments from anon, authenticated;
grant select on table public.appointments to authenticated;
grant insert (
  user_id,
  patient_name,
  email,
  phone,
  department,
  doctor,
  visit_type,
  preferred_date,
  preferred_time,
  reason
) on table public.appointments to authenticated;
grant update (notification_read) on table public.appointments to authenticated;

create index if not exists appointments_user_created_idx
  on public.appointments (user_id, created_at desc);

drop policy if exists "Patients can view their own appointments" on public.appointments;
create policy "Patients can view their own appointments"
  on public.appointments
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Patients can create their own appointment requests" on public.appointments;
create policy "Patients can create their own appointment requests"
  on public.appointments
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and email = (select auth.jwt() ->> 'email')
    and notification_read = false
    and request_status = 'Request received'
  );

drop policy if exists "Patients can mark their own notifications read" on public.appointments;
create policy "Patients can mark their own notifications read"
  on public.appointments
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
