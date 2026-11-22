import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/constants/env';
import { serverEnv } from '@/constants/env.server';
import { HttpStatus } from '@/enums/enum';

let client: SupabaseClient | null = null;

/** Service-role client: bypasses row level security. Call it only after `requireAdmin()`. */
export const getSupabaseAdmin = (): SupabaseClient => {
  if (!env.SUPABASE_URL || !serverEnv.SUPABASE_SERVICE_ROLE_KEY)
    throw { status: HttpStatus.SERVICE_UNAVAILABLE, message: 'Supabase is not configured' };

  client ??= createClient(env.SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  return client;
};
