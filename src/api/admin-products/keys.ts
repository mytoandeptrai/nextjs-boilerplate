/** Paths under `/api` (see `src/app/api/admin/products`) and the matching query keys. */
export const ADMIN_PRODUCT_KEYS = {
  LIST: '/admin/products',
  DETAIL: '/admin/products/:id',
  list: ['admin', 'products'] as const,
  detail: (id: string) => ['admin', 'products', id] as const,
};
