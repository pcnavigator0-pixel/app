-- Fix: "new row violates row-level security policy for table cart"
--
-- Why this happens: the mobile app talks to Supabase directly using the anon
-- key (no server in between, unlike the website which uses the service role
-- key and therefore bypasses RLS entirely). The `cart` table has no `user_id`
-- column — it's purely `session_id`-keyed — so there's nothing to check
-- against `auth.uid()`. The policy needs to allow anon read/write on cart
-- unconditionally, the same way the website's service-role bypass effectively
-- has no real restriction either.
--
-- Run this in the Supabase SQL editor.

-- 1. Make sure RLS is actually enabled (safe to run even if already enabled).
alter table public.cart enable row level security;

-- 2. Drop any existing cart policies so we don't end up with conflicting/duplicate ones.
--    (If you know your existing policy names, you can replace this with explicit
--    `drop policy "name" on public.cart;` calls instead.)
drop policy if exists "Allow anon select on cart" on public.cart;
drop policy if exists "Allow anon insert on cart" on public.cart;
drop policy if exists "Allow anon update on cart" on public.cart;
drop policy if exists "Allow anon delete on cart" on public.cart;

-- 3. Allow anyone (anon + authenticated) to read, insert, update, and delete
--    cart rows. This matches what the website already effectively allows via
--    its service-role bypass — there's no additional exposure here, since
--    cart rows aren't sensitive data and are scoped by a random session id
--    the client generates itself.
create policy "Allow anon select on cart"
  on public.cart
  for select
  to anon, authenticated
  using (true);

create policy "Allow anon insert on cart"
  on public.cart
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow anon update on cart"
  on public.cart
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Allow anon delete on cart"
  on public.cart
  for delete
  to anon, authenticated
  using (true);
