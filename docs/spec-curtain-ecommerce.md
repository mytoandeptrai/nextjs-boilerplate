# Spec: Curtain / Blinds E-commerce, Lead Generation and Admin Portal

| | |
| --- | --- |
| Branch | `feat/curtain-ecommerce-and-admin` |
| Status | Phase 1 (specification). Implementation follows on the same branch. |
| Brand | Màn Rèm Thúy Hương (inferred from the storage bucket name `manremthuyhuong`; rename in `src/config/site.ts` and `common.json`) |
| Reference | twopagescurtains.com (made-to-measure configurator, lookbook, quote instead of payment) |

## 1. Goals and non-goals

**Goals**

1. A public storefront: home, product collection, product detail with a real-time price configurator, lookbook, guides (blog), cart.
2. Lead generation instead of payment: the cart ends in a checkout modal with two actions, "Chốt đơn & Gửi qua Zalo" and "Gửi yêu cầu khảo sát tại nhà".
3. A lightweight admin portal: sign-in, product / lookbook / post CRUD with image upload, a quote inbox, and a settings page for the Zalo hotline and the notification email.

**Non-goals (this iteration)**

- Payment gateway, customer accounts, stock, shipping, discount codes.
- Localised catalogue content. UI strings are translated (`vi`, `en`); rows in the database hold one language (Vietnamese).
- Category CRUD in the admin. Categories are seeded by the migration and editable in the Supabase dashboard.
- A WYSIWYG editor. Guides are written in Markdown with a live preview.

## 2. How this fits the repository

The repository is a Next.js 16 / React 19 CMS template with a BFF, typed `next-intl` messages and shadcn/ui. The feature keeps its conventions (`AGENTS.md`): kebab-case files, thin pages composing `src/modules/*`, one folder per API domain under `src/api`, no hardcoded UI strings, env read only through `src/constants/env*.ts`, Biome, Vitest.

Deliberate changes to the template:

| Change | Why |
| --- | --- |
| The browser reads public data from Supabase with the publishable (anon) key | Required by the brief ("client-side data fetching uses the anon client"). The template rule "the browser never calls the backend directly" still holds for everything privileged: those calls go through `/api/admin/*`. |
| Demo content is removed: `item1`, `react-19`, demo login, `/api/item1`, `/api/media`, `demo-auth`, `item1-mock` | They are placeholders that the admin portal replaces. Their reusable parts (data table, form fields, dialogs, uploader) stay. |
| Default locale becomes `vi` (`/` is Vietnamese, `/en/...` is English) | The shop sells in Vietnam; the checkout labels in the brief are Vietnamese. |
| `src/proxy.ts` guards only `/admin/*` | The storefront must be public. |
| Font becomes Be Vietnam Pro (`next/font/google`); Geist Mono stays for code | Brief. |
| Theme is light only: background `#FAF9F6`, slate text | Brief. `next-themes` is pinned to `light`. |

New dependencies: `@supabase/supabase-js` (data, auth, storage), `react-markdown` + `remark-gfm` (guides). Email is sent with a plain `fetch` to the Resend HTTP API, so no SDK is added.

## 3. Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (fallback `NEXT_PUBLIC_SUPABASE_ANON_KEY`) | public | Anon client: public reads, quote insert, admin sign-in |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | public | Existing public bucket for every image |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Admin reads and mutations, uploads, private settings |
| `RESEND_API_KEY` | server only | Email alert. Unset: the alert is skipped, the quote is still saved |
| `QUOTE_EMAIL_FROM` | server only | Sender, default `onboarding@resend.dev` (the only sender Resend allows before a domain is verified) |
| `SUPABASE_DB_URL` | tooling only | Postgres URI used to apply migrations. Never read by the app |

Public values are parsed in `src/constants/env.ts`; server-only values in `src/constants/env.server.ts`, which imports `server-only` so a client import fails the build. No key is committed: `.env.example` lists names only and `.gitignore` is extended to cover `.env*.local` (today it ignores only `.env`).

The Zalo hotline and the notification email are **not** env variables. They live in `site_settings` so the admin can change them (defaults: `0941275946`, `mytoandn@gmail.com`).

## 4. Database schema (Supabase PostgreSQL)

File: `supabase/migrations/20261122000000_init_curtain_store.sql`. Columns marked `-- added` are not in the brief; each is explained below the DDL.

```sql
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
  category_id        uuid references public.categories (id) on delete set null,  -- gallery filter
  description        text not null default '',
  image_url          text not null,
  tagged_product_ids uuid[] not null default '{}',
  created_at         timestamptz not null default now()
);
create index lookbooks_created_idx on public.lookbooks (created_at desc);
create index lookbooks_category_idx on public.lookbooks (category_id);

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
-- Leads: no policy at all, so a public key can neither read nor write them. POST /api/quotes inserts with the
-- service role after recomputing prices (migration 20261122010000 drops the insert policy the first version had).

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
```

**Additions to the brief's schema**

| Addition | Reason |
| --- | --- |
| `products.description` | A product page needs body copy. |
| `site_settings` | The hotline and the alert recipient must be editable by the admin. `is_public` keeps the recipient email out of the anon API. |
| Check constraints on `quote_requests` | Defence in depth: the database bounds what can be stored even if a handler has a bug. |
| `status` value list | The brief gives only the default `new`; the inbox needs a fixed progression. |

**JSONB shapes** (validated with Zod on write, and parsed defensively on read)

```jsonc
// products.pleat_options      multiplier applies to linear-meter pricing only
[{ "id": "xep-ly", "label": "Xếp ly", "multiplier": 1.0 }, { "id": "ore", "label": "Ô-rê", "multiplier": 1.1 }]

// products.fabric_options     price_delta is added to base_price (VND per m or per m2), may be 0
[{ "id": "linen-nga", "label": "Linen ngà", "color": "#EDE6D8", "price_delta": 0 }]

// products.motor_options      "No motor" (0 VND) is always offered by the UI and is not stored
[{ "id": "motor-wifi", "label": "Động cơ Wi-Fi", "price": 3500000 }]

// quote_requests.cart_items   a snapshot, so later price edits do not rewrite history
[{
  "product_id": "uuid", "slug": "rem-vai-linen", "title": "Rèm vải Linen", "image": "https://...",
  "pricing_type": "linear_meter", "width_cm": 250, "height_cm": 270,
  "pleat": { "id": "xep-ly", "label": "Xếp ly", "multiplier": 1.0 }, "fullness": 2.3,
  "fabric": { "id": "linen-nga", "label": "Linen ngà", "price_delta": 0 },
  "motor": { "id": "motor-wifi", "label": "Động cơ Wi-Fi", "price": 3500000 },
  "quantity": 2, "unit_price": 5944000, "line_total": 11888000
}]
```

**Applying migrations.** `db.<ref>.supabase.co` resolves to IPv6 only, so tooling connects through the session pooler (`aws-0-ap-northeast-1.pooler.supabase.com:5432`, user `postgres.<ref>`). The migration is applied with `supabase db push --db-url "$SUPABASE_DB_URL"`, which records the version in `supabase_migrations.schema_migrations`.

## 5. Storage upload flow

Bucket: the existing public bucket named by `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`. It is not recreated or reconfigured.

```
Admin form (browser)                    Route Handler (server)                    Supabase Storage
--------------------                    ----------------------                    ----------------
1 pick / drop files
2 check type + size, downscale to
  <= 2400 px, re-encode as WebP
3 POST /api/admin/uploads  ───────────► 4 requireAdmin()
  multipart: file, folder               5 check folder, size <= 8 MB, and the
                                          real type from the file's magic bytes
                                        6 path = {folder}/{yyyy}/{mm}/{uuid}.{ext}
                                        7 upload with the service-role client  ─► object stored
                                          (cacheControl 1 year, upsert false)
                                        8 getPublicUrl(path)
9 { url, path }  ◄────────────────────
10 the URL is kept in form state and
   saved with the row on submit
```

- Folders: `products`, `lookbooks`, `posts`. Allowed types: JPEG, PNG, WebP, AVIF. SVG is rejected (script risk).
- Public read URL: `{SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}`, produced by `getPublicUrl`. Object names are random UUIDs, so a one-year cache is safe.
- `next.config.ts` adds that host and path prefix to `images.remotePatterns`, so `next/image` serves resized variants.
- When a row is updated or deleted, objects it no longer references are removed (best effort; a failure is logged and never fails the request). Only URLs inside this bucket are touched.

## 6. Configurator math model

Inputs: `width_cm`, `height_cm` (integers, converted to metres), fabric, motor, quantity, and for linear-meter products pleat style and fullness.

```
price_per_unit   = base_price + fabric.price_delta            (VND per m, or per m2)
motor_price      = motor.price, or 0 for "no motor"

Linear meter:    unit = width * price_per_meter * pleat_multiplier + motor_price
Square meter:    unit = max(1.0, width) * max(1.0, height) * price_per_m2 + motor_price

line_total       = round_to_1000(unit) * quantity
total_estimate   = sum of line_total
```

These are the two formulas from the brief. Three terms needed a definition:

| Term | Definition | Note |
| --- | --- | --- |
| `pleat_multiplier` | `pleat.multiplier × (fullness / 2.0)` | The brief lists both "Pleat style" and "Fullness 2.0x / 2.3x" as inputs but the formula has one multiplier. `base_price` is defined as the price at 2.0x fullness, so 2.0x gives factor 1.0 and 2.3x gives 1.15. A product with no pleat options uses multiplier 1.0. |
| `price_per_meter`, `price_per_m2` | `base_price + fabric.price_delta` | Lets a premium fabric cost more without a second formula. Delta 0 reproduces the brief exactly. |
| `round_to_1000` | Round half up to the nearest 1,000 VND | Prices are shown without decimals. |

Square-meter products hide pleat and fullness. Height is always collected (the workshop needs it) but only affects the price of square-meter products.

Limits: width 30 to 1200 cm, height 30 to 600 cm, quantity 1 to 20. Outside the limits the price is replaced by an inline message and "Add to cart" is disabled.

Worked examples:

| Case | Calculation | Result |
| --- | --- | --- |
| Linear, 250 cm, 850,000/m, pleat 1.0, fullness 2.3, motor 3,500,000 | `2.5 × 850000 × 1.15 + 3500000` | 5,943,750 → 5,944,000 |
| Square, 80 × 120 cm, 420,000/m2, no motor | `max(1, 0.8) × max(1, 1.2) × 420000` | 504,000 |
| Square, 60 × 90 cm, 420,000/m2, no motor | `1 × 1 × 420000` (1 m2 minimum) | 420,000 |

One pure function, `calculatePrice()` in `src/lib/pricing.ts`, is used by the configurator, the cart and the server. The server recomputes every line from the database before saving a quote, so a tampered client total is never stored.

## 7. Zalo deep link

```
https://zalo.me/{HOTLINE}?text={ENCODED_MESSAGE}
```

- `{HOTLINE}`: the `zalo_hotline` setting with every non-digit removed (`0941275946`).
- `{ENCODED_MESSAGE}`: `encodeURIComponent` of the plain-text order below.

```
ĐƠN HÀNG MỚI - Màn Rèm Thúy Hương
Mã: #A1B2C3D4
Khách: Nguyễn Văn A - 0901234567
Địa chỉ: 12 Lê Lợi, Đà Nẵng
---
1. Rèm vải Linen x2
   Rộng 250cm x Cao 270cm | Xếp ly | Độ chun 2.3x | Linen ngà | Động cơ Wi-Fi
   Tạm tính: 11.888.000đ
---
Tổng tạm tính: 11.888.000đ
Ghi chú: Khảo sát cuối tuần
```

Rules:

- The encoded URL is capped at 1,800 characters. If it would be longer, trailing items collapse into "... và N sản phẩm khác" and the order code lets staff open the full quote in the inbox.
- The same text is copied to the clipboard and a toast says so, because Zalo ignores `text` on some clients and the customer can then paste it.
- The link opens with `window.open(url, '_blank', 'noopener')` inside the click handler, before any `await`, so mobile browsers do not block it. If it is blocked anyway, the modal shows the link as a normal anchor.
- The order code is the first 8 characters of the quote id, which the browser generates so the message and the saved row match.

## 8. Checkout flows

Both buttons validate the same form: name (required), phone (Vietnamese mobile, required), address, notes, and a hidden honeypot field.

**Button 1, "Chốt đơn & Gửi qua Zalo"**

1. Build the message, copy it, open the Zalo link (all synchronously).
2. `POST /api/quotes` with `channel: 'zalo'` in the background. A failure only shows a soft warning, because the order has already reached staff through Zalo.
3. Clear the cart and show the confirmation.

**Button 2, "Gửi yêu cầu khảo sát tại nhà"**

1. `POST /api/quotes` with `channel: 'email'`.
2. On success clear the cart and show the confirmation with the order code. On failure keep the cart and the form, and show a retry.

**`POST /api/quotes` (server)**

1. Reject a foreign `Origin`, a filled honeypot, and more than 5 requests per 10 minutes per IP.
2. Validate the body with Zod.
3. Load the referenced products with the anon client (inactive or unknown products are rejected with 409 and a list, so the cart can flag them) and recompute every line and the total.
4. Insert into `quote_requests` with the service role (`status = 'new'`, the id from the request). The table has no public policy, so this handler is the only way in.
5. For `channel = 'email'`: read `quote_notification_email` with the service role and send the alert through Resend. A send failure is logged and returned as `emailSent: false`; the quote stays saved.

## 9. Admin authentication and authorisation

- Identity: Supabase Auth, email + password. An admin is a user whose `app_metadata.role` is `admin`. Only the service role can write `app_metadata`, so signing up with the public key never grants access.
- `pnpm admin:create <email> <password>` creates or promotes an admin through the service-role Admin API.
- Sign-in: `POST /api/admin/auth/login` calls `signInWithPassword` on the server, checks the role, and stores the access and refresh tokens in `httpOnly`, `SameSite=Lax` cookies (the template's `COOKIE_KEYS`). The browser never holds a token.
- `src/proxy.ts`: `/admin/**` without a session cookie redirects to `/admin/login`; when the access token is about to expire it is renewed with the refresh token and the cookies are rewritten.
- `requireAdmin()` (`src/lib/server/admin-session.ts`) runs at the top of every `/api/admin/*` handler and in the admin layout. It verifies the token with Supabase (`auth.getUser`) and the role, so a forged cookie fails even though the proxy only checks presence. Handlers also renew an expired token.
- Mutating admin handlers reject requests whose `Origin` is not the app's.

## 10. Route and component tree

Every page lives under `src/app/[locale]`; `vi` has no prefix, English is `/en/...`.

```
src/app/[locale]/
  layout.tsx                         html, Be Vietnam Pro, providers
  (storefront)/
    layout.tsx                       SiteHeader, SiteFooter, CartDrawer, FloatingZaloButton
    page.tsx                         /                  HomePage
    products/page.tsx                /products          ProductsPage (?category=slug&page=n, 12 per page)
    products/[slug]/page.tsx         /products/[slug]   ProductDetailPage
    lookbook/page.tsx                /lookbook          LookbookPage (?category=slug)
    blog/page.tsx                    /blog              BlogPage
    blog/[slug]/page.tsx             /blog/[slug]       BlogPostPage
    cart/page.tsx                    /cart              CartPage
  admin/
    login/page.tsx                   /admin/login       AdminLoginPage
    (portal)/
      layout.tsx                     requireAdmin + sidebar shell
      page.tsx                       /admin             redirects to /admin/quotes
      quotes/page.tsx                /admin/quotes
      products/page.tsx              /admin/products
      products/new/page.tsx          /admin/products/new
      products/[id]/page.tsx         /admin/products/[id]
      categories/page.tsx            /admin/categories
      lookbooks/page.tsx             /admin/lookbooks
      posts/page.tsx                 /admin/posts
      posts/new/page.tsx             /admin/posts/new
      posts/[id]/page.tsx            /admin/posts/[id]
      settings/page.tsx              /admin/settings

src/app/api/
  quotes/route.ts                    POST                     public
  admin/auth/login|logout/route.ts   POST
  admin/uploads/route.ts             POST (multipart)
  admin/products/route.ts            GET, POST      admin/products/[id]/route.ts   GET, PUT, DELETE
  admin/categories/route.ts          GET, POST      admin/categories/[id]/route.ts PUT, DELETE
  admin/lookbooks/route.ts           GET, POST      admin/lookbooks/[id]/route.ts  PUT, DELETE
  admin/posts/route.ts               GET, POST      admin/posts/[id]/route.ts      GET, PUT, DELETE
  admin/quotes/route.ts              GET (status, page)       admin/quotes/[id]/route.ts  PATCH, DELETE
  admin/settings/route.ts            GET, PUT
```

```
src/modules/
  home-page/               hero, category-tiles, featured-products, lookbook-teaser, guides-teaser, value-props
  products-page/           category-filter, product-grid, product-card
  product-detail-page/     product-gallery, configurator/ (dimension-input, option-group, fabric-swatches,
                           price-summary), add-to-cart-button, related-lookbooks
  lookbook-page/           category chips, lookbook-grid, lookbook-dialog (photo + tagged products)
  blog-page/, blog-post-page/   post-card, markdown-content
  cart-page/               cart-line-item, cart-summary
  admin-login-page/        login-form
  admin-quotes-page/       status-filter, quotes-table, quote-detail-sheet, status-select
  admin-products-page/     products-table, product-form (option-list-editor, image-list-uploader)
  admin-categories-page/   categories table, category-dialog (name, slug, order); deleting keeps the products
  admin-lookbooks-page/    lookbook-table, lookbook-form-dialog (category select, product multi-select)
  admin-posts-page/        posts-table, post-form (markdown editor + preview)
  admin-settings-page/     settings-form

src/components/storefront/ site-header, mobile-nav, site-footer, cart-drawer, checkout-dialog,
                           floating-zalo-button, price, storage-image (fallback image on error)
src/components/admin/      admin-sidebar, image-upload-field
src/stores/cart-store.ts   zustand + persist (localStorage), versioned
src/lib/                   pricing.ts, zalo.ts, format.ts, supabase/{client,server,admin}.ts,
                           server/{admin-session,rate-limit,email}.ts
src/api/                   catalog (anon reads), quotes, admin-auth, admin-products, admin-lookbooks,
                           admin-posts, admin-quotes, admin-settings, uploads
```

**Data access**

| Caller | Client | Used for |
| --- | --- | --- |
| Server Components | anon | First render of public pages (SEO). RLS applies. |
| Client Components | anon, through `src/api/catalog` queries | Category filter, lookbook tags, cart re-validation |
| `POST /api/quotes` | anon to read products, service role to write the lead and read the private setting | Lead capture |
| `/api/admin/*` | service role, after `requireAdmin()` | Every admin read and write, uploads |

Public pages are rendered per request (no stale cache to invalidate after an admin edit); the query layer is where caching can be added later.

## 11. UI direction

- Palette: background `#FAF9F6`, surfaces white, text `slate-800`, secondary `slate-500`, hairlines `slate-200`, one warm accent for prices and primary actions. Large photography, generous whitespace, thin borders instead of shadows.
- Type: Be Vietnam Pro 300 to 700 with the `vietnamese` subset; headings light weight with tight tracking.
- Product page: gallery left, sticky configurator right on desktop; stacked on mobile with a sticky bottom bar showing the live price and "Add to cart".
- Cart drawer: right sheet on desktop, full width on mobile; each line shows the image, the spec summary, quantity stepper, line total.
- Admin: the template's sidebar shell, data tables and form fields.

## 12. Verification plan

- Unit tests (Vitest): `calculatePrice` (both models, minimums, rounding, missing options), Zalo message and URL builder (encoding, length cap), quote schema, cart store, proxy guard, slug helper.
- Gates from `AGENTS.md`: `pnpm lint`, `pnpm format:check`, `pnpm type-check`, `pnpm test`, `pnpm build`. The brief's `pnpm typecheck` is `pnpm type-check` in this repository.
- Manual pass against the real Supabase project: configure and add to cart, both checkout buttons, admin sign-in, create / edit / delete in each admin section with an upload, quote status change. Screenshots go in the pull request.

## 13. Architecture and edge-case review

Automated self-review of this spec. "Resolved" means the design above already covers it; "Accepted" means a known limit, listed so it is a decision and not a surprise.

### Security

| # | Risk | Verdict | Handling |
| --- | --- | --- | --- |
| S1 | Service-role key reaches the browser bundle | Resolved | Read only in `env.server.ts` behind `server-only`; the admin client is created only in `src/lib/supabase/admin.ts` (also `server-only`). |
| S2 | Anyone can sign up with the public key and call admin APIs | Resolved | Access needs `app_metadata.role = 'admin'`, writable only by the service role; `requireAdmin()` verifies the token with Supabase on every admin request. Recommendation: disable public sign-ups in the Supabase dashboard. |
| S3 | Leads (names, phones, addresses) readable with the public key | Resolved | `quote_requests` has no public policy; only the service role reads or writes it. |
| S4 | Notification email exposed | Resolved | `site_settings.is_public = false`; read only with the service role. |
| S5 | Price tampering in the cart payload | Resolved | Server recomputes from the database and ignores client totals. |
| S6 | Spam or forged totals through `/api/quotes` or direct inserts with the public key | Resolved | Honeypot, per-IP rate limit, origin check, database length and size constraints. The rate limit is in memory, so it is per instance. Direct REST inserts are closed: the insert policy is dropped and the handler inserts with the service role. |
| S7 | Malicious upload (SVG, HTML renamed to .jpg, oversized file) | Resolved | Admin only, type decided from magic bytes, 8 MB cap, random file names, fixed folders. |
| S8 | XSS through Markdown or option labels | Resolved | `react-markdown` without raw HTML; links limited to `http`, `https`, `mailto`; everything else rendered as text by React. |
| S9 | CSRF on admin mutations | Resolved | `SameSite=Lax` httpOnly cookies, JSON bodies, `Origin` check. |
| S10 | Secrets in git | Resolved | `.env*.local` added to `.gitignore`; `.env.example` holds names only. The keys were shared in chat and should be rotated before launch. |
| S11 | Open redirect after sign-in | Resolved | The `next` parameter is accepted only if it starts with `/admin`. |

### Error handling

| # | Case | Handling |
| --- | --- | --- |
| E1 | Supabase unreachable or env not set | Public pages render an empty state with a retry, not a crash; `pnpm build` needs no network or keys. Admin shows the error toast from the API. |
| E2 | Product deleted or deactivated while in a cart | The cart re-validates on open and on submit; the line is flagged and excluded, with a message. |
| E3 | Price changed since the item was added | Re-validation updates the line and shows "price updated". |
| E4 | Email provider down or unverified sender | The quote is saved and the failure is logged on the server; the customer still sees success and the lead is in the inbox. |
| E5 | Zalo save request fails | Soft warning only; the customer's message has already been handed to Zalo. |
| E6 | Duplicate slug | Unique violation mapped to a field error "slug already in use"; slugs are generated from the title with Vietnamese diacritics removed. |
| E7 | Double submit | Buttons disable while pending; the quote id comes from the client, so a retry of the same submit hits the primary key instead of creating a second lead. |
| E8 | Malformed JSONB written outside the admin | Options are parsed with Zod on read; invalid entries are dropped and the product still renders. |
| E9 | Upload fails midway through a multi-image form | Each image reports its own state; saved images stay; the form cannot submit while one is uploading. |
| E10 | Session expires during an admin edit | Handler renews the token once; on failure the API returns 401 and the client redirects to `/admin/login?next=...` without discarding typed form values in memory. |
| E11 | Corrupt or outdated cart in localStorage | The store is versioned; an entry that fails validation is discarded. |

### Responsive and mobile

| # | Case | Handling |
| --- | --- | --- |
| R1 | Configurator on a 360 px screen | Single column, 44 px touch targets, numeric keypad (`inputMode="numeric"`), sticky price bar. |
| R2 | Sticky bar and floating Zalo button overlap, or sit under the iOS home indicator | The floating button lifts above the bar on product pages; both use `env(safe-area-inset-bottom)`. |
| R3 | Cart drawer and checkout modal with the keyboard open | Scrollable body with a pinned action footer; modal becomes a full-height sheet under `sm`. |
| R4 | Wide admin tables | Horizontal scroll inside the table container; the quote detail opens in a sheet. |
| R5 | Heavy photos on mobile data | Uploads are downscaled; `next/image` with `sizes`; below-the-fold images lazy load. |
| R6 | Layout shift | Fixed aspect ratios on every image slot; price area has a reserved height. |

### Fallback behaviour

| # | Case | Handling |
| --- | --- | --- |
| F1 | Product without images, or a broken image URL | `public/images/image_unavailable.webp`. |
| F2 | Product with no pleat / fabric / motor options | The group is hidden and its neutral value is used (multiplier 1, delta 0, price 0). |
| F3 | Empty catalogue, lookbook or blog | Friendly empty states; the home page hides empty sections. |
| F4 | Clipboard API unavailable | The message stays visible in the confirmation with a manual copy field. |
| F5 | Pop-up blocked | A visible "Open Zalo" link. |
| F6 | Zalo hotline not set | Button 1 is disabled with an explanation; Button 2 still works. |
| F7 | JavaScript disabled | Catalogue, lookbook and guides are server-rendered and readable; configurator and cart need JavaScript. |
| F8 | Unknown slug | `notFound()` with the localised 404. |
| F9 | Resend account without a verified domain | Only `onboarding@resend.dev` → the account owner's address works. Changing the recipient in settings needs a verified domain; the settings page says so. |

### Open items for the reviewer

1. Brand name and copy are placeholders derived from the bucket name.
2. Fullness is modelled as `fullness / 2.0` on top of the pleat multiplier (section 6). If 2.3x should instead have its own price, it becomes a per-product option.
3. Category management is seed-only in this iteration.
4. Uploads pass through the Next.js server. On platforms with a small request-body limit (Vercel: 4.5 MB) the client-side downscale keeps files well under it; signed upload URLs are the alternative if originals must be kept.
