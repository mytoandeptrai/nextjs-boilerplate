import type { QuoteStatus } from '@/constants/const';

/** Paths under `/api` (see `src/app/api/admin/quotes`) and the matching query keys. */
export const ADMIN_QUOTE_KEYS = {
  LIST: '/admin/quotes',
  DETAIL: '/admin/quotes/:id',
  all: ['admin', 'quotes'] as const,
  list: (params: { status?: QuoteStatus; page: number; pageSize: number }) => ['admin', 'quotes', params] as const,
};
