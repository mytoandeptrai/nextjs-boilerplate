import { HttpStatus } from '@/enums/enum';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const getApiErrorStatus = (error: unknown): number => {
  if (isRecord(error)) {
    const status = typeof error.status === 'number' ? error.status : error.code;

    if (typeof status === 'number' && status >= 400 && status <= 599) return status;
  }

  return HttpStatus.INTERNAL_SERVER_ERROR;
};

export const getApiErrorMessage = (error: unknown, fallbackMessage = 'Something went wrong'): string => {
  if (typeof error === 'string') return error;
  if (isRecord(error) && typeof error.message === 'string' && error.message) return error.message;

  return fallbackMessage;
};

/** Build the `Response` a Route Handler returns when the upstream request fails. */
export const createApiErrorResponse = (error: unknown, fallbackMessage?: string): Response =>
  Response.json({ message: getApiErrorMessage(error, fallbackMessage) }, { status: getApiErrorStatus(error) });
