import 'server-only';

import { HttpStatus } from '@/enums/enum';

interface IPostgrestError {
  code?: string;
  message?: string;
  details?: string | null;
}

/** Postgres `unique_violation`. */
export const UNIQUE_VIOLATION = '23505';

/** Turn a PostgREST error into the `{ status, message }` shape `createApiErrorResponse` understands. */
export const toApiError = (error: IPostgrestError, fallback = 'Database request failed') => {
  if (error.code === UNIQUE_VIOLATION)
    return { status: HttpStatus.CONFLICT, message: 'Slug already in use', code: 'slug_taken' };
  // PGRST116: `.single()` found no row.
  if (error.code === 'PGRST116') return { status: HttpStatus.NOT_FOUND, message: 'Not found' };

  console.error('[db]', error.code, error.message, error.details);

  return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: fallback };
};

/** Unwrap a Supabase response or throw the mapped error. */
export const unwrap = <T = any>({ data, error }: { data: unknown; error: IPostgrestError | null }): T => {
  if (error) throw toApiError(error);

  return data as T;
};
