import 'server-only';

import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { cookies } from 'next/headers';

import { request } from '@/api/axios';
import { COOKIE_KEYS } from '@/constants/const';
import { HttpStatus } from '@/enums/enum';
import type { ITokenPair } from '@/types/type';

const REFRESH_PATH = '/users/token/refresh';
const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24; // 1 day
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge,
});

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
    const { data } = await request.post<ITokenPair>(REFRESH_PATH, { refreshToken });
    await setAuthCookies(data);

    return data.accessToken;
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
