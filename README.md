# Next.js CMS Template

A Content Management System template built with Next.js 16, React 19 and TypeScript: layered architecture, typed i18n,
a Backend-for-Frontend (BFF) with httpOnly-cookie auth, and a shadcn/ui component library.

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
    [locale]/              layout, providers, error, not-found, (auth)/login, (cms)/item1
    api/                   BFF Route Handlers: auth, item1, media, health
    global-not-found.tsx   404 for URLs outside any locale
  proxy.ts                 next-intl + session guard (Next.js 16 name for middleware)
  api/<domain>/            keys, requests, queries, mutations, type, schema, index   (auth, item1, media)
  modules/<page>/          page-level UI: index.tsx, components/, hooks, __tests__/
  components/
    ui/                    shadcn/ui primitives (do not hand-edit, wrap them in common/)
    common/                shared app components (data table, sidebar, locale switcher, ...)
    form-field/            react-hook-form field wrappers
    providers/             QueryClient + theme providers
    utilities/             HStack, VStack, Show
  hooks/                   shared hooks + barrel (`useTranslations` is typed against src/messages)
  stores/                  zustand stores
  i18n/                    routing, request, navigation (locale-aware Link / useRouter / usePathname)
  messages/                en/*.json, vi/*.json + index.ts (compile-time key parity check)
  lib/                     utils (cn), dayjs, string helpers, server/ (server-only BFF helpers)
  utils/  constants/  config/  enums/  types/  styles/  assets/
```

Principles:

- **Thin pages, fat modules.** `app/**/page.tsx` only composes a module from `src/modules`.
- **One folder per API domain** under `src/api`. Components never call axios directly: they use the domain's `queries` /
  `mutations`. Query keys come from a factory (`item1QueryKeys`) and mutations invalidate it.
- **BFF.** The browser only talks to `/api/*`. Route Handlers call the real backend (`NEXT_PUBLIC_API_URL`) on the server.
- **Auth.** `/api/auth/login` stores the tokens in `httpOnly` cookies. `src/proxy.ts` redirects anonymous visitors to
  `/login` before anything renders; `lib/server/backend.ts` attaches the access token and renews it once on a 401.
  The browser never sees a token.
- **i18n.** Never import `useTranslations` from `next-intl` (Biome blocks it): use `@/hooks` on the client and
  `@/hooks/use-translations-server` on the server. Add every key to **all** locales; `pnpm type-check` fails otherwise.
  Navigation helpers come from `@/i18n/navigation`.
- **Env.** Read environment variables only through `src/constants/env.ts` (validated with Zod).
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

## React 19 playground

`/react-19` (sidebar: Dashboard > React 19 hooks) has one small working example per hook, with comments:
`useActionState` + `useFormStatus` (Server Action form), `useOptimistic` (instant UI with automatic rollback), `use()`
(promise streamed from a Server Component, conditional context), async `useTransition` and `useDeferredValue`.
Code: `src/modules/react-19-page`.

## Getting Started

Requirements: Node.js >= 22 (see `.nvmrc`) and pnpm.

```bash
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to your backend
pnpm dev                     # http://localhost:3000
```

| Script                            | Purpose                                   |
| --------------------------------- | ----------------------------------------- |
| `pnpm dev` / `build` / `start`    | Develop, build, serve                     |
| `pnpm lint` / `lint:fix`          | Biome lint                                |
| `pnpm format:check` / `format:fix`| Biome format                              |
| `pnpm type-check`                 | `next typegen` + `tsc --noEmit`           |
| `pnpm test` / `test:coverage`     | Vitest                                    |
| `pnpm check`                      | lint + type-check + test                  |

## Customization

- **Backend URL:** `NEXT_PUBLIC_API_URL` in `.env.local` (baked in at build time, also a Docker build arg). The login
  endpoint is expected at `POST /auth/login` returning `{ accessToken, refreshToken }`; token refresh at
  `POST /users/token/refresh` (see `src/lib/server/backend.ts`).
- **Item1 is a mock.** `src/lib/server/item1-mock.ts` is an in-memory backend behind `/api/item1`. Replace its calls with
  `backendRequest(...)` from `src/lib/server/backend.ts` to go live.
- **Add an API domain:** copy `src/api/item1`, add the Route Handlers in `src/app/api/<domain>`.
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
