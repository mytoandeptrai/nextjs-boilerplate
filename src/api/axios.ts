import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { INTERNAL_API_PREFIX } from '@/constants/const';
import { env, isServer } from '@/constants/env';
import { attachInterceptors } from './interceptors';

const defaultConfig: AxiosRequestConfig = {
  responseType: 'json',
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
};

/**
 * BFF client: talks to this app's own Route Handlers (`src/app/api/**`). The browser never sees a token:
 * the handlers read the httpOnly session cookies and talk to Supabase.
 */
export const requestInternal: AxiosInstance = axios.create({
  ...defaultConfig,
  baseURL: `${isServer ? env.APP_URL : ''}${INTERNAL_API_PREFIX}`,
  withCredentials: !isServer,
});

attachInterceptors(requestInternal);
