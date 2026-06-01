-- ════════════════════════════════════════════════════════════════
-- Hammie World — initial schema (Phase 0/1)
-- Postgres / Supabase. See docs-hammie-world-brief.md §4.
-- ════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── 4.1 providers ────────────────────────────────────────────────
create table if not exists providers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,                 -- 'cc', 'xfxai'
  display_name  text not null,
  divisor       numeric not null default 1,           -- quota divisor: cc=5, xfxai=2.5
  quota_check_url text,
  base_url      text,                                 -- default key base URL
  highlight_tag text,                                 -- editable feature badge
  has_rank_pricing boolean not null default false,    -- cc=true, xfxai=false
  sort          int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ── 4.2 models ───────────────────────────────────────────────────
create table if not exists models (
  id             uuid primary key default gen_random_uuid(),
  name           text not null unique,                -- 'Gemini 3.1 Pro', 'GPT 5.5'
  description    text,
  no_expiry_note text default 'โมเดลไม่มีวันหมดอายุ',
  sort           int not null default 0,
  created_at     timestamptz not null default now()
);

-- ── 4.3 provider_models (matrix: which model on which provider) ───
create table if not exists provider_models (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  model_id    uuid not null references models(id) on delete cascade,
  status      text not null default 'ok'             -- 'ok' | 'unstable'
              check (status in ('ok', 'unstable')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (provider_id, model_id)
);

-- ── 4.4 bundles (fixed packages; price_default = normal/no-rank) ──
create table if not exists bundles (
  id               uuid primary key default gen_random_uuid(),
  provider_model_id uuid not null references provider_models(id) on delete cascade,
  messages         int not null,                      -- 100, 200 ... 1000
  price_default    int not null,                      -- baht
  bonus_note       text,
  featured         boolean not null default false,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  unique (provider_model_id, messages)
);

-- ── 4.6 ranks (granted by admin) ─────────────────────────────────
create table if not exists ranks (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  description  text,
  icon_url     text,
  default_icon text,                                  -- flower/heart/star/crown
  sort         int not null default 0,
  created_at   timestamptz not null default now()
);

-- ── 4.5 bundle_rank_prices (rank-specific price; cc/Gemini only) ──
create table if not exists bundle_rank_prices (
  id        uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references bundles(id) on delete cascade,
  rank_id   uuid not null references ranks(id) on delete cascade,
  price     int not null,
  created_at timestamptz not null default now(),
  unique (bundle_id, rank_id)
);

-- ── 4.7 customers (= login accounts) ─────────────────────────────
-- auth_user_id links to auth.users (Supabase Auth manages password_hash).
create table if not exists customers (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  code         text not null unique,                  -- API code, used to log in
  display_name text not null,
  rank_id      uuid references ranks(id) on delete set null,
  points       int not null default 0,                -- auto-computed (§6)
  total_baht   numeric not null default 0,            -- auto from approved orders
  is_admin     boolean not null default false,
  notes        text,
  special      text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── 4.9 orders + ledger ──────────────────────────────────────────
create table if not exists orders (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid references customers(id) on delete set null,
  code         text,                                  -- denormalized shop code
  source       text not null default 'web'            -- 'web' | 'offline'
               check (source in ('web', 'offline')),
  provider_id  uuid references providers(id) on delete set null,
  model_id     uuid references models(id) on delete set null,
  messages     int not null default 0,
  amount_baht  int not null default 0,
  api_label    text,                                  -- API name chosen by customer
  status       text not null default 'pending_slip'
               check (status in ('pending_slip','awaiting_review','approved','rejected','cancelled')),
  slip_url     text,
  assigned_key_id uuid,                               -- fk added after inventory_keys
  note         text,
  reject_reason text,
  approved_at  timestamptz,
  approved_by  uuid references customers(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ── 4.8 inventory_keys (key stock — model A) ─────────────────────
create table if not exists inventory_keys (
  id             uuid primary key default gen_random_uuid(),
  provider_id    uuid not null references providers(id) on delete cascade,
  model_id       uuid not null references models(id) on delete cascade,
  bundle_messages int not null,                       -- which bundle size this key is for
  key_string     text not null,                       -- real key string (RLS: server-only)
  base_url       text,
  status         text not null default 'available'
                 check (status in ('available','reserved','sold','dead')),
  order_id       uuid references orders(id) on delete set null,
  note           text,
  sold_at        timestamptz,
  created_at     timestamptz not null default now()
);

alter table orders
  add constraint orders_assigned_key_fk
  foreign key (assigned_key_id) references inventory_keys(id) on delete set null;

-- ── 4.10 announcements ───────────────────────────────────────────
create table if not exists announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text,
  type       text default 'news',                     -- news | promo | urgent
  pinned     boolean not null default false,
  date       date default current_date,
  created_at timestamptz not null default now()
);

-- ── 4.11 store_settings (singleton) ──────────────────────────────
create table if not exists store_settings (
  id            int primary key default 1,
  name          text,
  subtitle      text,
  description   text,
  discord_link  text,
  discord_user  text,
  footer        text,
  payment_qr_url text,
  bank_text     text,
  hours_open    text,
  hours_close   text,
  hours_days    jsonb default '[0,1,2,3,4,5,6]'::jsonb,
  discord_webhook_url text,                           -- server-only via RLS
  assets        jsonb default '{}'::jsonb,
  status        jsonb default '{}'::jsonb,            -- announce/speed/queue/stock
  created_at    timestamptz not null default now(),
  constraint singleton check (id = 1)
);

-- ── helpful indexes ──────────────────────────────────────────────
create index if not exists idx_inv_lookup
  on inventory_keys (provider_id, model_id, bundle_messages, status);
create index if not exists idx_orders_status on orders (status);
create index if not exists idx_orders_customer on orders (customer_id);
create index if not exists idx_bundles_pm on bundles (provider_model_id);
