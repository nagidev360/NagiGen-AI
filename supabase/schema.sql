-- Run once in Supabase SQL Editor.
create table if not exists public.generations (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 prompt text not null check (char_length(prompt) between 3 and 2000),
 style text not null default 'Realistic',
 image_url text,
 created_at timestamptz not null default now()
);
alter table public.generations enable row level security;
drop policy if exists "Read own generations" on public.generations;
drop policy if exists "Insert own generations" on public.generations;
drop policy if exists "Delete own generations" on public.generations;
create policy "Read own generations" on public.generations for select to authenticated using (auth.uid() = user_id);
create policy "Insert own generations" on public.generations for insert to authenticated with check (auth.uid() = user_id);
create policy "Delete own generations" on public.generations for delete to authenticated using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('generated-images', 'generated-images', true, 10485760, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
drop policy if exists "Users upload own generated images" on storage.objects;
drop policy if exists "Public read generated images" on storage.objects;
drop policy if exists "Users delete own generated images" on storage.objects;
create policy "Users upload own generated images" on storage.objects for insert to authenticated
with check (bucket_id = 'generated-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Public read generated images" on storage.objects for select to public
using (bucket_id = 'generated-images');
create policy "Users delete own generated images" on storage.objects for delete to authenticated
using (bucket_id = 'generated-images' and (storage.foldername(name))[1] = auth.uid()::text);
