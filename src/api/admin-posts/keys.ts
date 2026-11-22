/** Paths under `/api` (see `src/app/api/admin/posts`) and the matching query keys. */
export const ADMIN_POST_KEYS = {
  LIST: '/admin/posts',
  DETAIL: '/admin/posts/:id',
  list: ['admin', 'posts'] as const,
  detail: (id: string) => ['admin', 'posts', id] as const,
};
