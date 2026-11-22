export const CATALOG_KEYS = {
  categories: ['catalog', 'categories'] as const,
  productsByIds: (ids: string[]) => ['catalog', 'products', 'by-ids', [...ids].sort()] as const,
};
