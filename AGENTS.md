# AGENTS.md

Conventions for working in this repository (see `README.md` for the architecture).

## Rules

- File and folder names are `kebab-case` (`use-debounce.ts`, `login-form.tsx`, `login-page/`). Exported identifiers keep
  their usual casing (`PascalCase` components, `camelCase` hooks).
- Server Components by default. Add `'use client'` only for hooks, state or browser APIs.
- Pages are thin: compose a module from `src/modules`. No fetching in components: use `src/api/<domain>` queries/mutations.
- The browser never calls the backend directly: add a Route Handler under `src/app/api/<domain>` and use
  `backendRequest` from `src/lib/server/backend.ts`.
- No hardcoded user-facing strings: use `useTranslations` from `@/hooks` (client) or `useTranslationsServer`
  (server). Add keys to every locale in the same change.
- Use `Link`, `useRouter`, `usePathname`, `redirect` from `@/i18n/navigation`, not `next/link` / `next/navigation`
  (`useSearchParams` still comes from `next/navigation`).
- Read env only via `src/constants/env.ts`. Never commit `.env*` except `.env.example`.
- `src/components/ui` is shadcn output: do not hand-edit; wrap it. Re-run `pnpm lint:fix` after `shadcn add`.
- React 19: `ref` is a regular prop (no `forwardRef`). Zod 4 (`z.email()`, `z.input`).
- Git: conventional commits, lowercase imperative subject under 100 characters. No `Co-Authored-By` or AI attribution lines.

## Definition of done

`pnpm lint`, `pnpm format:check`, `pnpm type-check`, `pnpm test` and `pnpm build` all pass with no new warnings.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
