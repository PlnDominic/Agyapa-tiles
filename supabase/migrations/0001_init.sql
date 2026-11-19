-- Agyapa Tiles — initial schema (safe to re-run)
-- Run with the Supabase CLI (`supabase db push`) or paste into the SQL editor.

create extension if not exists "pgcrypto";

-- ───────────────────────── Profiles ─────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'phone')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ───────────────────────── Catalogue ─────────────────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  pattern_key text not null default 'marble',
  sort_order int not null default 0
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2),
  sku text unique,
  stock int not null default 0 check (stock >= 0),
  unit text not null default 'sqm',
  size text,
  finish text,
  material text,
  coverage_per_box numeric(6,2) not null default 1.44,
  pattern_key text not null default 'marble',
  color_hex text not null default '#e9e7e4',
  accent_hex text not null default '#9a9a9f',
  image_url text,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx on public.products (active, featured);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ───────────────────────── Orders ─────────────────────────
create sequence if not exists public.order_number_seq start 100241;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique
    default ('AGY-' || nextval('public.order_number_seq')::text),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  full_name text not null,
  phone text not null,
  shipping_address jsonb not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled')),
  payment_method text not null default 'cod' check (payment_method in ('cod','momo','bank')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded')),
  subtotal numeric(12,2) not null,
  shipping_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_email_idx on public.orders (lower(email));
create index if not exists orders_created_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  sku text,
  pattern_key text,
  color_hex text,
  accent_hex text,
  unit text,
  unit_price numeric(12,2) not null,
  quantity int not null check (quantity > 0)
);
create index if not exists order_items_order_idx on public.order_items (order_id);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  message text,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

-- ───────────────────────── Row level security ─────────────────────────
alter table public.profiles     enable row level security;
alter table public.categories   enable row level security;
alter table public.products     enable row level security;
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;
alter table public.order_events enable row level security;

-- profiles
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
drop policy if exists "admin manage profiles" on public.profiles;
create policy "admin manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- catalogue
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);
drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (active or public.is_admin());
drop policy if exists "admin write products" on public.products;
create policy "admin write products" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- orders (creation happens only through create_order(), which is security definer)
drop policy if exists "own orders read" on public.orders;
create policy "own orders read" on public.orders for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "admin write orders" on public.orders;
create policy "admin write orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "own items read" on public.order_items;
create policy "own items read" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
drop policy if exists "admin write items" on public.order_items;
create policy "admin write items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "own events read" on public.order_events;
create policy "own events read" on public.order_events for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
drop policy if exists "admin write events" on public.order_events;
create policy "admin write events" on public.order_events for all using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── Business logic ─────────────────────────
-- Delivery: free for orders from GH₵ 3,000, otherwise GH₵ 120.
create or replace function public.delivery_fee(p_subtotal numeric)
returns numeric language sql immutable as $$
  select case when p_subtotal >= 3000 or p_subtotal = 0 then 0 else 120 end;
$$;

-- Creates an order. Prices and stock are always read from the database, never trusted from the client.
-- p_items: [{ "product_id": "<uuid>", "quantity": 3 }, ...]
create or replace function public.create_order(
  p_email text, p_full_name text, p_phone text, p_address jsonb,
  p_payment_method text, p_notes text, p_items jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_order_id uuid;
  v_number text;
  v_subtotal numeric(12,2) := 0;
  v_fee numeric(12,2);
  v_item record;
  v_product public.products;
begin
  if coalesce(trim(p_email), '') = '' or coalesce(trim(p_full_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'Contact details are required';
  end if;
  if p_payment_method not in ('cod','momo','bank') then
    raise exception 'Unsupported payment method';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your bag is empty';
  end if;

  -- First pass: validate and total
  for v_item in select (e ->> 'product_id')::uuid as product_id, (e ->> 'quantity')::int as quantity
                from jsonb_array_elements(p_items) e loop
    if v_item.quantity is null or v_item.quantity < 1 or v_item.quantity > 10000 then
      raise exception 'Invalid quantity';
    end if;
    select * into v_product from public.products where id = v_item.product_id and active for update;
    if not found then raise exception 'A product in your bag is no longer available'; end if;
    if v_product.stock < v_item.quantity then
      raise exception 'Only % left of %', v_product.stock, v_product.name;
    end if;
    v_subtotal := v_subtotal + v_product.price * v_item.quantity;
  end loop;

  v_fee := public.delivery_fee(v_subtotal);

  insert into public.orders (user_id, email, full_name, phone, shipping_address, payment_method, subtotal, shipping_fee, total, notes)
  values (auth.uid(), lower(trim(p_email)), trim(p_full_name), trim(p_phone), p_address, p_payment_method,
          v_subtotal, v_fee, v_subtotal + v_fee, nullif(trim(coalesce(p_notes, '')), ''))
  returning id, order_number into v_order_id, v_number;

  -- Second pass: snapshot lines + decrement stock
  for v_item in select (e ->> 'product_id')::uuid as product_id, (e ->> 'quantity')::int as quantity
                from jsonb_array_elements(p_items) e loop
    select * into v_product from public.products where id = v_item.product_id;
    insert into public.order_items (order_id, product_id, name, sku, pattern_key, color_hex, accent_hex, unit, unit_price, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.sku, v_product.pattern_key, v_product.color_hex,
            v_product.accent_hex, v_product.unit, v_product.price, v_item.quantity);
    update public.products set stock = stock - v_item.quantity where id = v_product.id;
  end loop;

  insert into public.order_events (order_id, status, message)
  values (v_order_id, 'pending', 'Order received. We will confirm it shortly.');

  return jsonb_build_object('order_number', v_number, 'total', v_subtotal + v_fee);
end $$;

grant execute on function public.create_order(text, text, text, jsonb, text, text, jsonb) to anon, authenticated;

-- Public order tracking: requires BOTH the order number and the email used at checkout.
create or replace function public.track_order(p_number text, p_email text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_order public.orders;
begin
  select * into v_order from public.orders
   where upper(order_number) = upper(trim(p_number)) and lower(email) = lower(trim(p_email));
  if not found then return null; end if;
  return jsonb_build_object(
    'order', to_jsonb(v_order),
    'items', coalesce((select jsonb_agg(to_jsonb(i) order by i.name) from public.order_items i where i.order_id = v_order.id), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(to_jsonb(ev) order by ev.created_at) from public.order_events ev where ev.order_id = v_order.id), '[]'::jsonb)
  );
end $$;

grant execute on function public.track_order(text, text) to anon, authenticated;

-- Admin: move an order along, log a tracking event, restock on cancellation.
create or replace function public.admin_update_order(
  p_order_id uuid, p_status text, p_message text, p_payment_status text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_old public.orders;
begin
  if not public.is_admin() then raise exception 'Not authorised'; end if;
  select * into v_old from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;

  if p_status = 'cancelled' and v_old.status <> 'cancelled' then
    update public.products p set stock = p.stock + i.quantity
      from public.order_items i where i.order_id = p_order_id and i.product_id = p.id;
  end if;

  update public.orders
     set status = p_status,
         payment_status = coalesce(p_payment_status, payment_status)
   where id = p_order_id;

  if p_status <> v_old.status or coalesce(nullif(trim(p_message), ''), '') <> '' then
    insert into public.order_events (order_id, status, message)
    values (p_order_id, p_status, nullif(trim(coalesce(p_message, '')), ''));
  end if;
end $$;

grant execute on function public.admin_update_order(uuid, text, text, text) to authenticated;

-- ───────────────────────── Storage (product photography) ─────────────────────────
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "admin upload product images" on storage.objects;
create policy "admin upload product images" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin update product images" on storage.objects;
create policy "admin update product images" on storage.objects for update using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());

-- To make yourself an admin after signing up:
--   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
