import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { INTERNAL_API_PREFIX } from '@/constants/const';
import { env, isServer } from '@/constants/env';
import { attachInterceptors } from './interceptors';

const defaultConfig: AxiosRequestConfig = {
  responseType: 'json',
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
};

/** Direct backend client. Use it on the server only (Route Handlers, Server Components). */
export const request: AxiosInstance = axios.create({ ...defaultConfig, baseURL: env.API_URL });

/**
 * BFF client: talks to this app's own Route Handlers (`src/app/api/**`). The browser never sees a token:
 * the handlers read the httpOnly cookies and forward them to the backend.
 */
export const requestInternal: AxiosInstance = axios.create({
  ...defaultConfig,
  baseURL: `${isServer ? env.APP_URL : ''}${INTERNAL_API_PREFIX}`,
  withCredentials: !isServer,
});

/** Server code calls the backend directly; browser code always goes through the BFF. */
export const getApiRequestClient = (): AxiosInstance => (isServer ? request : requestInternal);

attachInterceptors(requestInternal);
