-- Enable required extensions
create extension if not exists pgcrypto;

-- Helper function to auto-update updated_at columns
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Enums
do $$ begin
  if not exists (select 1 from pg_type where typname = 'account_type') then
    create type public.account_type as enum ('checking', 'savings', 'credit');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'transaction_type') then
    create type public.transaction_type as enum ('income', 'expense');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'payment_type') then
    create type public.payment_type as enum ('single', 'monthly', 'recurring');
  end if;
end $$;

-- Accounts
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  balance numeric not null default 0,
  type public.account_type not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger accounts_updated_at before update on public.accounts for each row execute function public.update_updated_at_column();

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  type public.transaction_type not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger categories_updated_at before update on public.categories for each row execute function public.update_updated_at_column();

-- Transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric not null,
  date timestamptz not null,
  category_id uuid not null references public.categories(id) on delete restrict,
  account_id uuid not null references public.accounts(id) on delete restrict,
  type public.transaction_type not null,
  payment_type public.payment_type,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger transactions_updated_at before update on public.transactions for each row execute function public.update_updated_at_column();

-- Special Dates
create table if not exists public.special_dates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  date date not null,
  description text,
  is_recurring boolean not null default false,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger special_dates_updated_at before update on public.special_dates for each row execute function public.update_updated_at_column();

-- Savings Goals
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null,
  current_amount numeric not null default 0,
  created_at timestamptz not null default now(),
  target_date date
);

-- Weekly Goals
create table if not exists public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  month int not null,
  category_id uuid not null references public.categories(id) on delete cascade,
  weekly_amounts numeric[] not null default '{}',
  monthly_amount numeric,
  created_at timestamptz not null default now(),
  unique (user_id, year, month, category_id)
);

-- Monthly Notes
create table if not exists public.monthly_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  month int not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, year, month)
);

-- Enable RLS
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.special_dates enable row level security;
alter table public.savings_goals enable row level security;
alter table public.weekly_goals enable row level security;
alter table public.monthly_notes enable row level security;

-- Policies: SELECT
create policy if not exists "Users can view their own accounts" on public.accounts for select using (auth.uid() = user_id);
create policy if not exists "Users can view their own categories" on public.categories for select using (auth.uid() = user_id);
create policy if not exists "Users can view their own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy if not exists "Users can view their own special_dates" on public.special_dates for select using (auth.uid() = user_id);
create policy if not exists "Users can view their own savings_goals" on public.savings_goals for select using (auth.uid() = user_id);
create policy if not exists "Users can view their own weekly_goals" on public.weekly_goals for select using (auth.uid() = user_id);
create policy if not exists "Users can view their own monthly_notes" on public.monthly_notes for select using (auth.uid() = user_id);

-- Policies: INSERT
create policy if not exists "Users can insert their own accounts" on public.accounts for insert with check (auth.uid() = user_id);
create policy if not exists "Users can insert their own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy if not exists "Users can insert their own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy if not exists "Users can insert their own special_dates" on public.special_dates for insert with check (auth.uid() = user_id);
create policy if not exists "Users can insert their own savings_goals" on public.savings_goals for insert with check (auth.uid() = user_id);
create policy if not exists "Users can insert their own weekly_goals" on public.weekly_goals for insert with check (auth.uid() = user_id);
create policy if not exists "Users can insert their own monthly_notes" on public.monthly_notes for insert with check (auth.uid() = user_id);

-- Policies: UPDATE
create policy if not exists "Users can update their own accounts" on public.accounts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "Users can update their own categories" on public.categories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "Users can update their own transactions" on public.transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "Users can update their own special_dates" on public.special_dates for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "Users can update their own savings_goals" on public.savings_goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "Users can update their own weekly_goals" on public.weekly_goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "Users can update their own monthly_notes" on public.monthly_notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policies: DELETE
create policy if not exists "Users can delete their own accounts" on public.accounts for delete using (auth.uid() = user_id);
create policy if not exists "Users can delete their own categories" on public.categories for delete using (auth.uid() = user_id);
create policy if not exists "Users can delete their own transactions" on public.transactions for delete using (auth.uid() = user_id);
create policy if not exists "Users can delete their own special_dates" on public.special_dates for delete using (auth.uid() = user_id);
create policy if not exists "Users can delete their own savings_goals" on public.savings_goals for delete using (auth.uid() = user_id);
create policy if not exists "Users can delete their own weekly_goals" on public.weekly_goals for delete using (auth.uid() = user_id);
create policy if not exists "Users can delete their own monthly_notes" on public.monthly_notes for delete using (auth.uid() = user_id);