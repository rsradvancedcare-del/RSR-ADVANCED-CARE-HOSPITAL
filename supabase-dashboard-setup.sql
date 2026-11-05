-- Run this once in the Hospital Supabase project's SQL Editor.
-- Adds private patient profiles, private photo storage, and unique appointment codes.

alter table public.appointments
  add column if not exists appointment_code text;

update public.appointments
set appointment_code = 'RSR-' || upper(replace(gen_random_uuid()::text, '-', ''))
where appointment_code is null;

alter table public.appointments
  alter column appointment_code set default ('RSR-' || upper(replace(gen_random_uuid()::text, '-', ''))),
  alter column appointment_code set not null;

create unique index if not exists appointments_appointment_code_uidx
  on public.appointments (appointment_code);

create table if not exists public.patient_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 120),
  phone text check (phone is null or char_length(phone) <= 30),
  date_of_birth date,
  gender text check (gender is null or gender in ('Female', 'Male', 'Non-binary', 'Prefer not to say')),
  blood_group text check (blood_group is null or blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown')),
  address text check (address is null or char_length(address) <= 300),
  avatar_path text,
  updated_at timestamptz not null default now()
);

alter table public.patient_profiles enable row level security;
revoke all on table public.patient_profiles from anon, authenticated;
grant select, insert, update on table public.patient_profiles to authenticated;

drop policy if exists "Patients can view their own profile" on public.patient_profiles;
create policy "Patients can view their own profile"
  on public.patient_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Patients can create their own profile" on public.patient_profiles;
create policy "Patients can create their own profile"
  on public.patient_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Patients can update their own profile" on public.patient_profiles;
create policy "Patients can update their own profile"
  on public.patient_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('patient-avatars', 'patient-avatars', false, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 3145728, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Patients can view their own profile photos" on storage.objects;
create policy "Patients can view their own profile photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'patient-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Patients can upload their own profile photos" on storage.objects;
create policy "Patients can upload their own profile photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'patient-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Patients can update their own profile photos" on storage.objects;
create policy "Patients can update their own profile photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'patient-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'patient-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Patients can delete their own profile photos" on storage.objects;
create policy "Patients can delete their own profile photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'patient-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- Patient follow list (safe to run again after earlier dashboard setup).
create table if not exists public.doctor_follows (
  user_id uuid not null references auth.users (id) on delete cascade,
  doctor_key text not null check (char_length(doctor_key) between 1 and 240),
  doctor_name text not null check (char_length(doctor_name) between 1 and 160),
  department text not null check (char_length(department) between 1 and 160),
  department_key text not null check (char_length(department_key) between 1 and 100),
  doctor_days text,
  doctor_time text,
  doctor_photo text,
  followed_at timestamptz not null default now(),
  primary key (user_id, doctor_key)
);

alter table public.doctor_follows enable row level security;
revoke all on table public.doctor_follows from anon, authenticated;
grant select, insert, update, delete on table public.doctor_follows to authenticated;

drop policy if exists "Patients can view their own followed doctors" on public.doctor_follows;
create policy "Patients can view their own followed doctors"
  on public.doctor_follows for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Patients can follow doctors for their own account" on public.doctor_follows;
create policy "Patients can follow doctors for their own account"
  on public.doctor_follows for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Patients can update their own followed doctors" on public.doctor_follows;
create policy "Patients can update their own followed doctors"
  on public.doctor_follows for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Patients can unfollow their own doctors" on public.doctor_follows;
create policy "Patients can unfollow their own doctors"
  on public.doctor_follows for delete to authenticated
  using ((select auth.uid()) = user_id);
