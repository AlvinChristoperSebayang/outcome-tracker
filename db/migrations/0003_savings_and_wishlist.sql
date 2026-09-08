-- Aplikasi Pencatatan Pengeluaran — Tabungan (savings pockets) & Wishlist
-- Run this in the Supabase SQL editor after 0002_budget_and_debt.sql.

-- ── mark a budget pocket as a savings pocket ────────────────────────────────
-- A savings pocket represents money set aside, not a spending limit: it is
-- excluded from the expense "Kantong Anggaran" picker and never shows
-- over-budget warnings. Its allocated amount contributes to the cumulative
-- Tabungan total across every month it exists in.
alter table public.budget_pockets
  add column if not exists is_savings boolean not null default false;

-- ── wishlist_items (things the user is saving toward) ───────────────────────
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  product_url text,
  target_amount numeric(14, 2) check (target_amount is null or target_amount > 0),
  is_achieved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wishlist_items enable row level security;

create policy "wishlist_items_select_own" on public.wishlist_items
  for select using (auth.uid() = user_id);
create policy "wishlist_items_insert_own" on public.wishlist_items
  for insert with check (auth.uid() = user_id);
create policy "wishlist_items_update_own" on public.wishlist_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wishlist_items_delete_own" on public.wishlist_items
  for delete using (auth.uid() = user_id);

create index if not exists wishlist_items_user_id_idx on public.wishlist_items (user_id);

create trigger wishlist_items_set_updated_at
  before update on public.wishlist_items
  for each row execute function public.set_updated_at();
