import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/constants/env';

let client: SupabaseClient | null = null;

/**
 * Anon (publishable key) client: public reads, the quote insert and admin sign-in. Row level security applies.
 * `null` when Supabase is not configured, so pages can render an empty state instead of crashing.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;

  client ??= createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    // Sessions live in httpOnly cookies managed by the Route Handlers, never in this client.
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  return client;
};

/** Public URL prefix of the storage bucket: `{url}/storage/v1/object/public/{bucket}/`. */
export const getStoragePublicPrefix = (): string | null =>
  env.SUPABASE_URL && env.SUPABASE_STORAGE_BUCKET
    ? `${env.SUPABASE_URL}/storage/v1/object/public/${env.SUPABASE_STORAGE_BUCKET}/`
    : null;
