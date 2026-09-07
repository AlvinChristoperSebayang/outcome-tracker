-- Aplikasi Pencatatan Pengeluaran — Anggaran (budget pockets) & Hutang (debt tracking)
-- Run this in the Supabase SQL editor after 0001_init.sql.

-- ── budgets (one per user per month) ────────────────────────────────────────
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month date not null, -- always stored as the 1st of the month, e.g. 2026-09-01
  income_amount numeric(14, 2) not null default 0 check (income_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month)
);

alter table public.budgets enable row level security;

create policy "budgets_select_own" on public.budgets
  for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets
  for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets
  for delete using (auth.uid() = user_id);

create trigger budgets_set_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

-- ── budget_pockets (allocations within a monthly budget) ────────────────────
create table if not exists public.budget_pockets (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.budget_pockets enable row level security;

create policy "budget_pockets_select_own" on public.budget_pockets
  for select using (auth.uid() = user_id);
create policy "budget_pockets_insert_own" on public.budget_pockets
  for insert with check (auth.uid() = user_id);
create policy "budget_pockets_update_own" on public.budget_pockets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "budget_pockets_delete_own" on public.budget_pockets
  for delete using (auth.uid() = user_id);

create index if not exists budget_pockets_budget_id_idx on public.budget_pockets (budget_id);

create trigger budget_pockets_set_updated_at
  before update on public.budget_pockets
  for each row execute function public.set_updated_at();

-- ── link an expense to the budget pocket it was drawn from (optional) ───────
alter table public.expenses
  add column if not exists pocket_id uuid references public.budget_pockets (id) on delete set null;

create index if not exists expenses_pocket_id_idx on public.expenses (pocket_id);

-- ── debts (money the user owes; stays open until fully repaid) ─────────────
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  total_amount numeric(14, 2) not null check (total_amount > 0),
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.debts enable row level security;

create policy "debts_select_own" on public.debts
  for select using (auth.uid() = user_id);
create policy "debts_insert_own" on public.debts
  for insert with check (auth.uid() = user_id);
create policy "debts_update_own" on public.debts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "debts_delete_own" on public.debts
  for delete using (auth.uid() = user_id);

create index if not exists debts_user_id_idx on public.debts (user_id);

create trigger debts_set_updated_at
  before update on public.debts
  for each row execute function public.set_updated_at();

-- ── debt_payments (installments logged against a debt) ──────────────────────
create table if not exists public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid not null references public.debts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  payment_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.debt_payments enable row level security;

create policy "debt_payments_select_own" on public.debt_payments
  for select using (auth.uid() = user_id);
create policy "debt_payments_insert_own" on public.debt_payments
  for insert with check (auth.uid() = user_id);
create policy "debt_payments_update_own" on public.debt_payments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "debt_payments_delete_own" on public.debt_payments
  for delete using (auth.uid() = user_id);

create index if not exists debt_payments_debt_id_idx on public.debt_payments (debt_id);
create index if not exists debt_payments_user_id_payment_date_idx on public.debt_payments (user_id, payment_date desc);
