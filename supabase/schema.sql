-- Optional Supabase schema for generation history. Run in SQL Editor.
create table if not exists public.generations (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 prompt text not null,
 style text not null default 'Realistic',
 image_url text,
 created_at timestamptz not null default now()
);
alter table public.generations enable row level security;
create policy "Read own generations" on public.generations for select using (auth.uid() = user_id);
create policy "Insert own generations" on public.generations for insert with check (auth.uid() = user_id);
create policy "Delete own generations" on public.generations for delete using (auth.uid() = user_id);
