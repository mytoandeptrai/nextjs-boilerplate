/** Paths under `/api` (see `src/app/api/admin/lookbooks`) and the matching query keys. */
export const ADMIN_LOOKBOOK_KEYS = {
  LIST: '/admin/lookbooks',
  DETAIL: '/admin/lookbooks/:id',
  list: ['admin', 'lookbooks'] as const,
  detail: (id: string) => ['admin', 'lookbooks', id] as const,
};
