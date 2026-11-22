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
  /** Google AI Studio key for the storefront chat assistant. Unset: the chat button is not rendered. */
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-flash-lite-latest'),
});

/** Secrets. Importing this file from a Client Component fails the build (`server-only`). */
export const serverEnv = serverEnvSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: emptyToUndefined(process.env.SUPABASE_SERVICE_ROLE_KEY),
  RESEND_API_KEY: emptyToUndefined(process.env.RESEND_API_KEY),
  QUOTE_EMAIL_FROM: emptyToUndefined(process.env.QUOTE_EMAIL_FROM),
  GEMINI_API_KEY: emptyToUndefined(process.env.GEMINI_API_KEY),
  GEMINI_MODEL: emptyToUndefined(process.env.GEMINI_MODEL),
});
