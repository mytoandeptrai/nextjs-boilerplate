import type { IGetMediaListParams } from './type';

/** Backend paths. The BFF mirrors them under `/api` (see `src/app/api/media`). */
export const MEDIA_KEYS = {
  MEDIA: '/media',
  MEDIA_DETAIL: '/media/:id',
} as const;

export const mediaQueryKeys = {
  all: ['media'] as const,
  list: (params?: IGetMediaListParams) => [...mediaQueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...mediaQueryKeys.all, 'detail', id] as const,
};
