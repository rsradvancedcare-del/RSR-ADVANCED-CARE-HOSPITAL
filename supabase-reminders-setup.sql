-- Persistent per-user appointment reminders for the patient dashboard.
create table if not exists public.appointment_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  reminder_type text not null check (reminder_type = 'day_before'),
  title text not null check (char_length(title) between 1 and 180),
  message text not null check (char_length(message) between 1 and 600),
  scheduled_for timestamptz not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (appointment_id, reminder_type)
);

alter table public.appointment_reminders enable row level security;
revoke all on table public.appointment_reminders from anon, authenticated;
grant select, insert on table public.appointment_reminders to authenticated;
grant update (read_at) on table public.appointment_reminders to authenticated;

drop policy if exists "Patients can view their own appointment reminders" on public.appointment_reminders;
create policy "Patients can view their own appointment reminders"
  on public.appointment_reminders for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Patients can create reminders for their own appointments" on public.appointment_reminders;
create policy "Patients can create reminders for their own appointments"
  on public.appointment_reminders for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.appointments a
      where a.id = appointment_id and a.user_id = (select auth.uid())
    )
  );

drop policy if exists "Patients can mark their own appointment reminders read" on public.appointment_reminders;
create policy "Patients can mark their own appointment reminders read"
  on public.appointment_reminders for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- One welcome notification for each account created after this setup is run.
create table if not exists public.patient_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  notification_type text not null check (notification_type = 'welcome'),
  title text not null check (char_length(title) between 1 and 180),
  message text not null check (char_length(message) between 1 and 600),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (user_id, notification_type)
);

alter table public.patient_notifications enable row level security;
revoke all on table public.patient_notifications from anon, authenticated;
grant select on table public.patient_notifications to authenticated;
grant update (read_at) on table public.patient_notifications to authenticated;

drop policy if exists "Patients can view their own account notifications" on public.patient_notifications;
create policy "Patients can view their own account notifications"
  on public.patient_notifications for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Patients can mark their own account notifications read" on public.patient_notifications;
create policy "Patients can mark their own account notifications read"
  on public.patient_notifications for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.create_patient_welcome_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.patient_notifications (user_id, notification_type, title, message)
  values (
    new.id,
    'welcome',
    'Welcome to RSR Advanced Care Hospital!',
    'Your patient account is ready. You can manage your profile, follow doctors, track appointments, and view your appointment slip here.'
  )
  on conflict (user_id, notification_type) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_welcome_notification on auth.users;
create trigger on_auth_user_created_welcome_notification
  after insert on auth.users
  for each row execute function public.create_patient_welcome_notification();

-- Backfill one welcome notification for accounts that already exist.
insert into public.patient_notifications (user_id, notification_type, title, message)
select
  u.id,
  'welcome',
  'Welcome to RSR Advanced Care Hospital!',
  'Your patient account is ready. You can manage your profile, follow doctors, track appointments, and view your appointment slip here.'
from auth.users u
on conflict (user_id, notification_type) do nothing;
