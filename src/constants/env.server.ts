import 'server-only';

import { z } from 'zod';

const emptyToUndefined = (value: string | undefined) => (value === '' ? undefined : value);

const serverEnvSchema = z.object({
  /** Bypasses row level security. Only Route Handlers behind `requireAdmin()` may use it. */
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  /** Unset: the email alert is skipped, the quote is still saved. */
  RESEND_API_KEY: z.string().optional(),
  /** Resend only accepts `onboarding@resend.dev` until a domain is verified. */
  QUOTE_EMAIL_FROM: z.string().default('onboarding@resend.dev'),
});

/** Secrets. Importing this file from a Client Component fails the build (`server-only`). */
export const serverEnv = serverEnvSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: emptyToUndefined(process.env.SUPABASE_SERVICE_ROLE_KEY),
  RESEND_API_KEY: emptyToUndefined(process.env.RESEND_API_KEY),
  QUOTE_EMAIL_FROM: emptyToUndefined(process.env.QUOTE_EMAIL_FROM),
});
