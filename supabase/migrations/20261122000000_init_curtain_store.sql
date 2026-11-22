create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- categories
create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  display_order int  not null default 0
);

-- ------------------------------------------------------------------ products
create table public.products (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text not null unique,
  category_id    uuid references public.categories (id) on delete set null,
  description    text not null default '',                      -- added
  base_price     numeric(14, 2) not null check (base_price >= 0),
  pricing_type   text not null check (pricing_type in ('linear_meter', 'square_meter')),
  pleat_options  jsonb not null default '[]'::jsonb check (jsonb_typeof(pleat_options)  = 'array'),
  fabric_options jsonb not null default '[]'::jsonb check (jsonb_typeof(fabric_options) = 'array'),
  motor_options  jsonb not null default '[]'::jsonb check (jsonb_typeof(motor_options)  = 'array'),
  images         text[] not null default '{}',
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create index products_active_created_idx on public.products (is_active, created_at desc);

-- ---------------------------------------------------------------- lookbooks
create table public.lookbooks (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  description        text not null default '',
  image_url          text not null,
  tagged_product_ids uuid[] not null default '{}',
  created_at         timestamptz not null default now()
);
create index lookbooks_created_idx on public.lookbooks (created_at desc);

-- --------------------------------------------------------------- blog_posts
create table public.blog_posts (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  content_markdown text not null default '',
  thumbnail_url    text,
  published_at     timestamptz                                  -- null = draft
);
create index blog_posts_published_idx on public.blog_posts (published_at desc);

-- ----------------------------------------------------------- quote_requests
create table public.quote_requests (
  id               uuid primary key default gen_random_uuid(),
  customer_name    text not null check (char_length(customer_name) between 1 and 120),
  customer_phone   text not null check (char_length(customer_phone) between 8 and 20),
  customer_address text not null default '' check (char_length(customer_address) <= 300),
  notes            text not null default '' check (char_length(notes) <= 2000),
  cart_items       jsonb not null check (jsonb_typeof(cart_items) = 'array' and jsonb_array_length(cart_items) between 1 and 50),
  total_estimate   numeric(14, 2) not null check (total_estimate >= 0),
  status           text not null default 'new'
                   check (status in ('new', 'contacted', 'surveyed', 'quoted', 'won', 'lost')),
  channel          text not null check (channel in ('zalo', 'email')),
  created_at       timestamptz not null default now()
);
create index quote_requests_status_created_idx on public.quote_requests (status, created_at desc);

-- ------------------------------------------------------------ site_settings  (added)
create table public.site_settings (
  key        text primary key,
  value      text not null,
  is_public  boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------- RLS
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.lookbooks      enable row level security;
alter table public.blog_posts     enable row level security;
alter table public.quote_requests enable row level security;
alter table public.site_settings  enable row level security;

create policy "public read categories" on public.categories
  for select to anon, authenticated using (true);
create policy "public read active products" on public.products
  for select to anon, authenticated using (is_active);
create policy "public read lookbooks" on public.lookbooks
  for select to anon, authenticated using (true);
create policy "public read published posts" on public.blog_posts
  for select to anon, authenticated using (published_at is not null and published_at <= now());
create policy "public read public settings" on public.site_settings
  for select to anon, authenticated using (is_public);
-- Leads: insert only. No select / update / delete policy, so nobody can read them with a public key.
create policy "public create quote" on public.quote_requests
  for insert to anon, authenticated with check (status = 'new');

-- No write policies anywhere else: every other write uses the service role, which bypasses RLS.

-- --------------------------------------------------------------------- seed
insert into public.categories (slug, title, display_order) values
  ('rem-vai',     'Rèm vải',     1),
  ('rem-cuon',    'Rèm cuốn',    2),
  ('rem-cau-vong','Rèm cầu vồng',3),
  ('rem-go',      'Rèm gỗ',      4)
on conflict (slug) do nothing;

insert into public.site_settings (key, value, is_public) values
  ('zalo_hotline',             '0941275946',         true),
  ('quote_notification_email', 'mytoandn@gmail.com', false)
on conflict (key) do nothing;
