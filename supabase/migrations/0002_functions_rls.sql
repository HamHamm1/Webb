-- ════════════════════════════════════════════════════════════════
-- Hammie World — server-side functions + Row Level Security
-- See brief §6 (logic), §7 (approve flow), §9 (security).
-- ════════════════════════════════════════════════════════════════

-- ── current customer helpers ─────────────────────────────────────
create or replace function current_customer_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from customers where auth_user_id = auth.uid();
$$;

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from customers where auth_user_id = auth.uid()), false);
$$;

-- ── recompute points + total_baht for a customer (§6) ────────────
-- points = floor(sum messages of approved orders / 100)
-- total_baht = sum(amount_baht) of approved orders
create or replace function recompute_customer_stats(p_customer uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_msgs int;
  v_baht numeric;
begin
  select coalesce(sum(messages),0), coalesce(sum(amount_baht),0)
    into v_msgs, v_baht
  from orders
  where customer_id = p_customer and status = 'approved';

  update customers
     set points = floor(v_msgs / 100.0),
         total_baht = v_baht
   where id = p_customer;
end;
$$;

-- ── approve an order atomically (§7 step 6) ──────────────────────
-- Picks one available key matching (provider, model, messages) using
-- FOR UPDATE SKIP LOCKED to prevent handing out the same key twice.
-- Returns the assigned key row, or raises if no stock.
create or replace function approve_order(p_order uuid, p_admin uuid)
returns table (key_id uuid, key_string text, base_url text)
language plpgsql security definer set search_path = public as $$
declare
  o          orders%rowtype;
  picked     inventory_keys%rowtype;
begin
  select * into o from orders where id = p_order for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if o.status = 'approved' then
    raise exception 'ALREADY_APPROVED';
  end if;
  if o.provider_id is null or o.model_id is null then
    raise exception 'ORDER_MISSING_PRODUCT';
  end if;

  select * into picked
  from inventory_keys
  where provider_id = o.provider_id
    and model_id    = o.model_id
    and bundle_messages = o.messages
    and status = 'available'
  order by created_at
  for update skip locked
  limit 1;

  if not found then
    raise exception 'OUT_OF_STOCK';
  end if;

  update inventory_keys
     set status = 'sold', order_id = p_order, sold_at = now()
   where id = picked.id;

  update orders
     set status = 'approved',
         assigned_key_id = picked.id,
         approved_at = now(),
         approved_by = p_admin
   where id = p_order;

  if o.customer_id is not null then
    perform recompute_customer_stats(o.customer_id);
  end if;

  return query select picked.id, picked.key_string, picked.base_url;
end;
$$;

-- ── stock count per (provider, model, messages) ─────────────────
create or replace function bundle_stock(p_provider uuid, p_model uuid, p_messages int)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int from inventory_keys
  where provider_id = p_provider and model_id = p_model
    and bundle_messages = p_messages and status = 'available';
$$;

-- ════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════

-- Public catalog tables: readable by everyone, writable only by admin.
alter table providers          enable row level security;
alter table models             enable row level security;
alter table provider_models    enable row level security;
alter table bundles            enable row level security;
alter table bundle_rank_prices enable row level security;
alter table ranks              enable row level security;
alter table announcements      enable row level security;
alter table store_settings     enable row level security;
alter table customers          enable row level security;
alter table orders             enable row level security;
alter table inventory_keys     enable row level security;

-- generic public-read / admin-write helper applied per table
do $$
declare t text;
begin
  foreach t in array array[
    'providers','models','provider_models','bundles',
    'bundle_rank_prices','ranks','announcements'
  ] loop
    execute format('drop policy if exists %I_read on %I;', t||'_pub', t);
    execute format('create policy %I on %I for select using (true);', t||'_pub', t);
    execute format('drop policy if exists %I on %I;', t||'_admin', t);
    execute format('create policy %I on %I for all using (is_admin()) with check (is_admin());', t||'_admin', t);
  end loop;
end$$;

-- store_settings: public reads everything EXCEPT secrets are filtered at
-- the app layer (we never select discord_webhook_url with the anon client).
drop policy if exists store_read on store_settings;
create policy store_read on store_settings for select using (true);
drop policy if exists store_admin on store_settings;
create policy store_admin on store_settings for all using (is_admin()) with check (is_admin());

-- customers: a customer sees only their own row; admins see all.
drop policy if exists cust_self on customers;
create policy cust_self on customers for select
  using (auth_user_id = auth.uid() or is_admin());
drop policy if exists cust_self_update on customers;
create policy cust_self_update on customers for update
  using (auth_user_id = auth.uid() or is_admin());
drop policy if exists cust_admin on customers;
create policy cust_admin on customers for all
  using (is_admin()) with check (is_admin());

-- orders: a customer sees/creates only their own; admins see all.
drop policy if exists ord_self on orders;
create policy ord_self on orders for select
  using (customer_id = current_customer_id() or is_admin());
drop policy if exists ord_insert on orders;
create policy ord_insert on orders for insert
  with check (customer_id = current_customer_id() or is_admin());
drop policy if exists ord_update on orders;
create policy ord_update on orders for update
  using (customer_id = current_customer_id() or is_admin());
drop policy if exists ord_admin on orders;
create policy ord_admin on orders for all
  using (is_admin()) with check (is_admin());

-- inventory_keys: NEVER exposed to customers via RLS. Only admins can read.
-- key_string is delivered to the buyer only through a server route that
-- checks ownership of the linked order (see /api/me/keys).
drop policy if exists inv_admin on inventory_keys;
create policy inv_admin on inventory_keys for all
  using (is_admin()) with check (is_admin());
