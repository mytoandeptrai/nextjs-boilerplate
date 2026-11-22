import { z } from 'zod';

import { AppEnv } from '@/enums/enum';

const emptyToUndefined = (value: string | undefined) => (value === '' ? undefined : value);

const envSchema = z.object({
  APP_ENV: z.enum(AppEnv).default(AppEnv.DEVELOPMENT),
  /** Public origin of this app. Used for canonical URLs, sitemap and Open Graph. */
  APP_URL: z.string().default('http://localhost:3000'),
  /** Supabase project URL. Unset: the storefront renders empty states and the admin API answers 503. */
  SUPABASE_URL: z.string().optional(),
  /** Publishable (anon) key. Safe in the browser: row level security decides what it can read. */
  SUPABASE_ANON_KEY: z.string().optional(),
  /** Existing public bucket that stores every uploaded image. */
  SUPABASE_STORAGE_BUCKET: z.string().optional(),
  /** Google Search Console token (the `content` of its HTML tag). */
  GOOGLE_SITE_VERIFICATION: z.string().optional(),
});

/**
 * Typed, validated environment.
 *
 * Next.js only inlines `NEXT_PUBLIC_*` values on a literal `process.env.NAME` access,
 * so every variable is listed explicitly instead of spreading `process.env`.
 * Server-only secrets live in `env.server.ts`.
 */
export const env = envSchema.parse({
  APP_ENV: emptyToUndefined(process.env.NEXT_PUBLIC_APP_ENV),
  APP_URL: emptyToUndefined(process.env.NEXT_PUBLIC_APP_URL)?.replace(/\/$/, ''),
  SUPABASE_URL: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_URL)?.replace(/\/$/, ''),
  SUPABASE_ANON_KEY:
    emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ??
    emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  SUPABASE_STORAGE_BUCKET: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET),
  GOOGLE_SITE_VERIFICATION: emptyToUndefined(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION),
});

export const isProductionEnv = env.APP_ENV === AppEnv.PRODUCTION;
export const isDevelopmentEnv = env.APP_ENV === AppEnv.DEVELOPMENT;
export const isServer = typeof window === 'undefined';
