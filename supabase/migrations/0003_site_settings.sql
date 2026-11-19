-- Store settings editable from the admin dashboard (single row).
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'Agyapa Tiles',
  phone text not null default '024 596 7229',
  email text,
  address text not null default 'Afari, off Abuakwa – Bibiani Road, Ghana',
  delivery_fee numeric(12,2) not null default 120 check (delivery_fee >= 0),
  free_delivery_threshold numeric(12,2) not null default 3000 check (free_delivery_threshold >= 0),
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

alter table public.site_settings enable row level security;
drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select using (true);
drop policy if exists "admin write settings" on public.site_settings;
create policy "admin write settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- Delivery rules now come from the settings row.
create or replace function public.delivery_fee(p_subtotal numeric)
returns numeric language sql stable as $$
  select case
    when p_subtotal = 0 or p_subtotal >= s.free_delivery_threshold then 0
    else s.delivery_fee
  end
  from public.site_settings s where s.id = 1;
$$;
