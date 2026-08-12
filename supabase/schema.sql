-- Lumina Finance schema for Supabase.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  currency text not null default 'INR',
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  current numeric(14,2) not null default 0 check (current >= 0),
  target numeric(14,2) not null check (target > 0),
  deadline date,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant text not null,
  category text not null,
  amount numeric(14,2) not null check (amount >= 0),
  type text not null check (type in ('income','expense')),
  date date not null default current_date,
  notes text,
  recurring boolean not null default false,
  goal_id uuid references public.goals(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;

drop policy if exists "profiles own rows" on public.profiles;
create policy "profiles own rows" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "transactions own rows" on public.transactions;
create policy "transactions own rows" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "goals own rows" on public.goals;
create policy "goals own rows" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();


-- Recommended indexes for Lumina's common authenticated queries.
create index if not exists transactions_user_date_idx on public.transactions(user_id, date desc);
create index if not exists transactions_user_goal_idx on public.transactions(user_id, goal_id);
create index if not exists goals_user_created_idx on public.goals(user_id, created_at desc);
