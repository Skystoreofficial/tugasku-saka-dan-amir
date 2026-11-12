-- Jalankan di Supabase > SQL Editor
create table public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text not null,
  role text not null check (role in ('guru','siswa')),
  created_at timestamptz default now());
create table public.tasks(
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, subject text not null, description text default '',
  task_date date not null default current_date,
  created_at timestamptz default now());
create table public.attachments(
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  path text not null, name text not null, mime text);

create or replace function public.is_teacher() returns boolean
language sql security definer set search_path=public stable as
$$ select exists(select 1 from profiles where id=auth.uid() and role='guru') $$;

alter table profiles enable row level security;
alter table tasks enable row level security;
alter table attachments enable row level security;

create policy "profil: sendiri atau guru" on profiles for select using (id=auth.uid() or is_teacher());
create policy "tugas: lihat" on tasks for select using (owner_id=auth.uid() or is_teacher());
create policy "tugas: siswa tambah" on tasks for insert with check (owner_id=auth.uid() and not is_teacher());
create policy "tugas: siswa ubah" on tasks for update using (owner_id=auth.uid());
create policy "tugas: hapus" on tasks for delete using (owner_id=auth.uid() or is_teacher());
create policy "lampiran: lihat" on attachments for select using (exists(select 1 from tasks t where t.id=task_id and (t.owner_id=auth.uid() or is_teacher())));
create policy "lampiran: tambah" on attachments for insert with check (exists(select 1 from tasks t where t.id=task_id and t.owner_id=auth.uid()));
create policy "lampiran: hapus" on attachments for delete using (exists(select 1 from tasks t where t.id=task_id and (t.owner_id=auth.uid() or is_teacher())));

-- Storage (bucket privat). Path file: {user_id}/{task_id}/{nama}
insert into storage.buckets(id,name,public) values('attachments','attachments',false) on conflict do nothing;
create policy "storage: baca" on storage.objects for select using (bucket_id='attachments' and ((storage.foldername(name))[1]=auth.uid()::text or is_teacher()));
create policy "storage: unggah" on storage.objects for insert with check (bucket_id='attachments' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "storage: hapus" on storage.objects for delete using (bucket_id='attachments' and ((storage.foldername(name))[1]=auth.uid()::text or is_teacher()));

-- AKUN GURU AWAL: buat user di Authentication > Users (email: guru@tugasku.app, isi password, centang Auto Confirm), lalu:
-- insert into profiles(id,username,full_name,role) select id,'guru','Guru Utama','guru' from auth.users where email='guru@tugasku.app';
