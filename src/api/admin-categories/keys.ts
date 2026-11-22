/** Paths under `/api` (see `src/app/api/admin/categories`) and the matching query key. */
export const ADMIN_CATEGORY_KEYS = {
  LIST: '/admin/categories',
  DETAIL: '/admin/categories/:id',
  list: ['admin', 'categories'] as const,
};
