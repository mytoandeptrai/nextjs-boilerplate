import 'server-only';

import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { cookies } from 'next/headers';

import { request } from '@/api/axios';
import { COOKIE_KEYS } from '@/constants/const';
import { env } from '@/constants/env';
import { HttpStatus } from '@/enums/enum';
import type { ITokenPair } from '@/types/type';

const REFRESH_PATH = '/users/token/refresh';
const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24; // 1 day
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  // A `Secure` cookie is dropped by browsers on plain http (LAN IP, docker over http), so follow the app URL.
  secure: env.APP_URL.startsWith('https://'),
  sameSite: 'lax' as const,
  path: '/',
  maxAge,
});

const isToken = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

/**
 * Read the token pair from a backend response, plain (`{ accessToken, refreshToken }`) or wrapped in the usual
 * `{ data: { ... } }` envelope. Returns `null` when a token is missing, so an empty cookie is never written.
 */
export const parseTokenPair = (body: unknown): ITokenPair | null => {
  const candidates = [body, (body as { data?: unknown } | null)?.data];

  for (const candidate of candidates) {
    const { accessToken, refreshToken } = (candidate ?? {}) as Partial<Record<keyof ITokenPair, unknown>>;

    if (isToken(accessToken) && isToken(refreshToken)) return { accessToken, refreshToken };
  }

  return null;
};

export const setAuthCookies = async ({ accessToken, refreshToken }: ITokenPair) => {
  const store = await cookies();

  store.set(COOKIE_KEYS.ACCESS_TOKEN, accessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE));
  store.set(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, cookieOptions(REFRESH_TOKEN_MAX_AGE));
};

export const clearAuthCookies = async () => {
  const store = await cookies();

  store.delete(COOKIE_KEYS.ACCESS_TOKEN);
  store.delete(COOKIE_KEYS.REFRESH_TOKEN);
};

const refreshSession = async (refreshToken: string): Promise<string | null> => {
  try {
    const { data } = await request.post(REFRESH_PATH, { refreshToken });
    const tokens = parseTokenPair(data);

    if (!tokens) throw new Error('Refresh response has no tokens');

    await setAuthCookies(tokens);

    return tokens.accessToken;
  } catch {
    await clearAuthCookies();

    return null;
  }
};

/**
 * Call the backend on behalf of the signed-in user: attach the access token from the httpOnly cookie and, on a 401,
 * renew it once with the refresh token before giving up.
 */
export const backendRequest = async <T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  const store = await cookies();
  const accessToken = store.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
  const refreshToken = store.get(COOKIE_KEYS.REFRESH_TOKEN)?.value;

  const send = (token?: string) =>
    request<T>({ ...config, headers: { ...config.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) } });

  try {
    return await send(accessToken);
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;

    if (status !== HttpStatus.UNAUTHORIZED || !refreshToken) throw error;

    const renewed = await refreshSession(refreshToken);

    if (!renewed) throw error;

    return send(renewed);
  }
};
