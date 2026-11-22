import { createLoginSchema } from '@/api/admin-auth/schema';
import type { ILoginResponse } from '@/api/admin-auth/type';
import { env } from '@/constants/env';
import { HttpStatus } from '@/enums/enum';
import { isAdminMetadata, setAuthCookies } from '@/lib/server/admin-session';
import { getClientIp, isRateLimited, isSameOrigin } from '@/lib/server/rate-limit';
import { getSupabaseClient } from '@/lib/supabase/client';

const loginSchema = createLoginSchema({ invalidEmail: 'Invalid email', passwordRequired: 'Password is required' });

const json = (message: string, status: number) => Response.json({ message }, { status });

/** Sign in with Supabase Auth on the server. The tokens never reach the browser: they become httpOnly cookies. */
export async function POST(req: Request) {
  if (!isSameOrigin(req, env.APP_URL)) return json('Cross-origin request rejected', HttpStatus.FORBIDDEN);
  if (isRateLimited(`login:${getClientIp(req.headers)}`, 10, 10 * 60_000))
    return json('Too many attempts. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);

  const parsed = loginSchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) return json(parsed.error.issues[0]?.message ?? 'Invalid body', HttpStatus.BAD_REQUEST);

  const db = getSupabaseClient();

  if (!db) return json('Supabase is not configured', HttpStatus.SERVICE_UNAVAILABLE);

  const { data, error } = await db.auth.signInWithPassword(parsed.data);

  // Same answer for a wrong password and for a valid account that is not an admin: do not reveal which one it is.
  if (error || !data.session || !isAdminMetadata(data.user?.app_metadata))
    return json('Invalid email or password', HttpStatus.UNAUTHORIZED);

  await setAuthCookies({ accessToken: data.session.access_token, refreshToken: data.session.refresh_token });

  return Response.json({ authenticated: true } satisfies ILoginResponse);
}
