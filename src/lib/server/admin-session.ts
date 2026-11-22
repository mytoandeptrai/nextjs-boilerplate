import 'server-only';

import { cookies } from 'next/headers';

import { COOKIE_KEYS } from '@/constants/const';
import { env } from '@/constants/env';
import { HttpStatus, RoleEnum } from '@/enums/enum';
import { getSupabaseClient } from '@/lib/supabase/client';
import { isSameOrigin } from '@/lib/server/rate-limit';
import type { ITokenPair } from '@/types/type';
import { createApiErrorResponse } from '@/utils/api-error';

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days; the access token itself expires much sooner

export interface IAdminUser {
  id: string;
  email: string;
}

export const authCookieOptions = () => ({
  httpOnly: true,
  // A `Secure` cookie is dropped by browsers on plain http (LAN IP, docker over http), so follow the app URL.
  secure: env.APP_URL.startsWith('https://'),
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE,
});

export const setAuthCookies = async ({ accessToken, refreshToken }: ITokenPair) => {
  const store = await cookies();

  store.set(COOKIE_KEYS.ACCESS_TOKEN, accessToken, authCookieOptions());
  store.set(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, authCookieOptions());
};

export const clearAuthCookies = async () => {
  const store = await cookies();

  store.delete(COOKIE_KEYS.ACCESS_TOKEN);
  store.delete(COOKIE_KEYS.REFRESH_TOKEN);
};

/** An admin is a Supabase user whose `app_metadata.role` is `admin`; only the service role can write that field. */
export const isAdminMetadata = (appMetadata: unknown): boolean =>
  (appMetadata as { role?: unknown } | null | undefined)?.role === RoleEnum.ADMIN;

const verify = async (accessToken: string): Promise<IAdminUser | null> => {
  const { data, error } = (await getSupabaseClient()?.auth.getUser(accessToken)) ?? { data: null, error: true };

  if (error || !data?.user || !isAdminMetadata(data.user.app_metadata)) return null;

  return { id: data.user.id, email: data.user.email ?? '' };
};

/**
 * The signed-in admin, or `null`. The token is verified with Supabase on every call, so a forged cookie fails.
 * With `renew`, an expired access token is exchanged once using the refresh token (Route Handlers only: Server
 * Components cannot write cookies, the proxy renews for them).
 */
export const getAdminUser = async ({ renew = false } = {}): Promise<IAdminUser | null> => {
  const store = await cookies();
  const accessToken = store.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
  const refreshToken = store.get(COOKIE_KEYS.REFRESH_TOKEN)?.value;

  const user = accessToken ? await verify(accessToken) : null;

  if (user || !renew || !refreshToken) return user;

  const { data } = (await getSupabaseClient()?.auth.refreshSession({ refresh_token: refreshToken })) ?? { data: null };

  if (!data?.session || !isAdminMetadata(data.session.user.app_metadata)) return null;

  await setAuthCookies({ accessToken: data.session.access_token, refreshToken: data.session.refresh_token });

  return { id: data.session.user.id, email: data.session.user.email ?? '' };
};

/** Throws a 401 the handler wrapper turns into a response. */
export const requireAdmin = async (): Promise<IAdminUser> => {
  const user = await getAdminUser({ renew: true });

  if (!user) throw { status: HttpStatus.UNAUTHORIZED, message: 'Admin session required' };

  return user;
};

type Handler<Context> = (req: Request, context: Context, admin: IAdminUser) => Promise<Response>;

/**
 * Wrap an `/api/admin/*` Route Handler: reject foreign origins on mutations (CSRF), require an admin session and
 * turn thrown `{ status, message }` errors into JSON responses.
 */
export const withAdmin =
  <Context = unknown>(handler: Handler<Context>) =>
  async (req: Request, context: Context): Promise<Response> => {
    try {
      if (req.method !== 'GET' && !isSameOrigin(req, env.APP_URL))
        throw { status: HttpStatus.FORBIDDEN, message: 'Cross-origin request rejected' };

      const admin = await requireAdmin();

      return await handler(req, context, admin);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  };
