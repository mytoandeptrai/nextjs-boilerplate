# Màn Rèm Thùy Hương: curtain store and admin portal

Made-to-measure curtain storefront with a lead-capture checkout (Zalo order or home-survey request) and an admin
portal for products, lookbook photos, guides, the quote inbox and business settings. Built on Next.js 16, React 19,
TypeScript and Supabase (Postgres, Auth, Storage). Design and decisions: `docs/spec-curtain-ecommerce.md`.

## Tech Stack

| Category             | Technologies                                          |
| -------------------- | ----------------------------------------------------- |
| Framework            | Next.js 16 (App Router, Turbopack), React 19          |
| Language             | TypeScript 5                                          |
| UI                   | Radix UI, shadcn/ui (new-york), Tailwind CSS 4        |
| Server state         | TanStack Query 5, Axios                               |
| Client state         | Zustand (`auto-zustand-selectors-hook`)               |
| Forms / validation   | React Hook Form + Zod 4                               |
| Internationalization | next-intl (typed messages, `en` + `vi`)               |
| Tables               | TanStack Table 8                                      |
| Lint / format        | Biome 2                                               |
| Tests                | Vitest, Testing Library                               |
| Git hooks            | Husky, lint-staged, commitlint (conventional commits) |

## Architecture

```
src/
  app/
    [locale]/              (store)/ public storefront, admin/(auth)/login, admin/(portal)/ admin pages
    api/                   Route Handlers: quotes (public lead capture), admin/* (session required), health
    global-not-found.tsx   404 for URLs outside any locale
  proxy.ts                 next-intl + /admin session guard and token renewal (Next.js 16 name for middleware)
  api/<domain>/            keys, requests, queries, mutations, type, schema, index   (catalog, quotes, admin-*)
  modules/<page>/          page-level UI: index.tsx, components/, hooks, __tests__/
  components/
    ui/                    shadcn/ui primitives (do not hand-edit, wrap them in common/)
    common/                shared app components (data table, confirmation dialog, ...)
    store/  admin/         storefront pieces (cart, checkout, images) and admin pieces (upload, states)
    form-field/            react-hook-form field wrappers
    providers/             QueryClient + theme providers
    utilities/             HStack, VStack, Show
  hooks/                   shared hooks + barrel (`useTranslations` is typed against src/messages)
  stores/                  zustand stores
  i18n/                    routing, request, navigation (locale-aware Link / useRouter / usePathname)
  messages/                en/*.json, vi/*.json + index.ts (compile-time key parity check)
  lib/                     pricing, zalo, quote, format; supabase/ clients; server/ (session, storage, email)
scripts/                   create-admin, ingest-curtain-assets, capture-screenshots
supabase/migrations/       schema, row level security, seed categories and settings
  utils/  constants/  config/  enums/  types/  styles/  assets/
```

Principles:

- **Thin pages, fat modules.** `app/**/page.tsx` only composes a module from `src/modules`.
- **One folder per API domain** under `src/api`. Components never call axios directly: they use the domain's `queries` /
  `mutations`.
- **Data access.** The storefront reads the catalogue with the publishable key; row level security only exposes
  active products, published guides and public settings. Admin reads and writes go through `/api/admin/*`, which
  verify the session and then use the service-role key on the server.
- **Auth.** `/api/admin/auth/login` signs in with Supabase Auth and stores the tokens in `httpOnly` cookies. An admin
  is a user whose `app_metadata.role` is `admin`. `src/proxy.ts` redirects anonymous visitors of `/admin/*` to the
  login page and renews expired tokens; the admin layout and every admin handler verify the token with Supabase.
- **Pricing.** `calculatePrice` in `src/lib/pricing.ts` is the only pricing code. The configurator and cart call it in
  the browser and `POST /api/quotes` calls it again with database prices before storing a lead.
- **i18n.** Never import `useTranslations` from `next-intl` (Biome blocks it): use `@/hooks` on the client and
  `@/hooks/use-translations-server` on the server. Add every key to **all** locales; `pnpm type-check` fails otherwise.
  Navigation helpers come from `@/i18n/navigation`.
- **Env.** Read environment variables only through `src/constants/env.ts` and `src/constants/env.server.ts`
  (secrets, server only), both validated with Zod.
- **Naming.** All files and folders are `kebab-case`.

## SEO

- `buildMetadata()` (`src/lib/seo.ts`) builds a page's full metadata: title, description, canonical, hreflang, Open Graph, Twitter, robots.
  Every page exports `generateMetadata` and calls it; the layout holds the title template and the `WebSite` JSON-LD
  (`components/seo/json-ld.tsx`).
- `app/sitemap.ts` lists `INDEXABLE_ROUTES` (only the public login page: the CMS sits behind the session guard) once per
  locale with hreflang alternates. Pages behind the guard pass `noIndex: true`.
- `app/robots.ts`, `app/manifest.ts`, `app/opengraph-image` and `app/twitter-image` are generated routes.
- Outside `NEXT_PUBLIC_APP_ENV=production` everything is `noindex` (robots.txt, meta robots and `X-Robots-Tag`).
- Security headers are set in `next.config.ts`.

## Getting Started

Requirements: Node.js >= 22 (see `.nvmrc`) and pnpm.

```bash
pnpm install
cp .env.example .env.local                       # fill in the Supabase and Resend values
supabase db push --db-url "$SUPABASE_DB_URL"     # apply supabase/migrations (once per project)
pnpm admin:create you@example.com 'a-long-password'
pnpm assets:ingest                               # fanpage + stock photos into the bucket, seed the catalogue
pnpm dev                                         # http://localhost:3000, admin at /admin
```

Without Supabase variables the storefront still builds and shows empty states.

| Script                            | Purpose                                   |
| --------------------------------- | ----------------------------------------- |
| `pnpm dev` / `build` / `start`    | Develop, build, serve                     |
| `pnpm lint` / `lint:fix`          | Biome lint                                |
| `pnpm format:check` / `format:fix`| Biome format                              |
| `pnpm type-check`                 | `next typegen` + `tsc --noEmit`           |
| `pnpm test` / `test:coverage`     | Vitest                                    |
| `pnpm check`                      | lint + type-check + test                  |
| `pnpm admin:create <email> <pw>`  | Create an admin or reset its password     |
| `pnpm assets:ingest`              | Upload photos and seed products, lookbook, guides (`--dry-run`, `--force`) |
| `pnpm screenshots`                | Playwright captures into `docs/screenshots/` (`--submit` sends two test leads) |

## Customization

- **Business settings:** the Zalo number and the address that receives survey requests are edited in
  `/admin/settings` (table `site_settings`), not in environment variables.
- **Email alerts:** sent through Resend. Until a domain is verified there, Resend only delivers to the account
  owner's address and the sender must stay `onboarding@resend.dev` (`QUOTE_EMAIL_FROM`).
- **Add an API domain:** copy `src/api/admin-posts`, add the Route Handlers in `src/app/api/<domain>`.
- **Add a page:** create `src/modules/<name>-page`, then a thin route in `src/app/[locale]/`.
- **Add a locale:** add it to `LOCALES` in `src/i18n/routing.ts` and create `src/messages/<locale>/*.json`.
- **Theme:** edit the `@theme inline` block in `src/styles/globals.css`.
- **Site metadata:** `src/config/site.ts` and `src/app/[locale]/layout.tsx`.

## Docker

```bash
docker compose up --build   # frontend + nginx on http://localhost:8080
```

`NEXT_PUBLIC_*` values are build args (see `docker-compose.yml`).

## Commit convention

Conventional commits (`feat`, `fix`, `refactor`, ...), enforced by commitlint. Subjects are lowercase and imperative.
