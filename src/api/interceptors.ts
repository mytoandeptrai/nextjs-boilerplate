import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';

import { HttpStatus } from '@/enums/enum';
import { useSessionStore } from '@/stores';
import type { IApiError } from '@/types/type';

/** Turn any axios failure into the `IApiError` shape the app relies on. */
export const normalizeApiError = (error: unknown): IApiError => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;

    return {
      status: error.response?.status ?? 0,
      message: message || error.message,
      code: error.code,
      details: error.response?.data,
    };
  }

  return {
    status: 0,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
};

export const successInterceptor = (response: AxiosResponse): AxiosResponse => response;

/**
 * The BFF already refreshes expired access tokens. A 401 that reaches the browser therefore means the session is
 * over: drop it, clear the cookies and let the proxy send the user to the login page.
 */
export const createErrorInterceptor = (instance: AxiosInstance) => async (error: AxiosError) => {
  const isAuthRequest = error.config?.url?.startsWith('/auth/');

  if (error.response?.status === HttpStatus.UNAUTHORIZED && !isAuthRequest) {
    useSessionStore.getState().clearSession();
    await instance.post('/auth/logout').catch(() => undefined);
    window.location.reload();
  }

  return Promise.reject(normalizeApiError(error));
};

/** Wire error handling into an axios instance. */
export const attachInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.response.use(successInterceptor, createErrorInterceptor(instance));
};
