import type { IGetItem1ListParams } from './type';

/** Backend paths. The BFF mirrors them under `/api` (see `src/app/api/item1`). */
export const ITEM1_KEYS = {
  ITEM1: '/item1',
  ITEM1_DETAIL: '/item1/:id',
} as const;

export const item1QueryKeys = {
  all: ['item1'] as const,
  list: (params?: IGetItem1ListParams) => [...item1QueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...item1QueryKeys.all, 'detail', id] as const,
};
