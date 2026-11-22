import { ROUTES } from '@/constants/routes';

/** Catalogue orders, as they appear in `?sort=`. The first one is the default and is left out of the address. */
export const PRODUCT_SORTS = ['newest', 'popular', 'price-asc', 'price-desc'] as const;

export type ProductSort = (typeof PRODUCT_SORTS)[number];

/** Products per page of the storefront catalogue. */
export const PRODUCTS_PAGE_SIZE = 12;

export const DEFAULT_PRODUCT_SORT: ProductSort = PRODUCT_SORTS[0];

/** An unknown or missing `?sort=` value is the default order. */
export const parseProductSort = (value: unknown): ProductSort =>
  PRODUCT_SORTS.find((sort) => sort === value) ?? DEFAULT_PRODUCT_SORT;

/** Address of a catalogue view. Defaults (no category, newest first, page 1) are left out. */
export const buildProductsHref = ({
  category,
  sort = DEFAULT_PRODUCT_SORT,
  page = 1,
}: {
  category?: string;
  sort?: ProductSort;
  page?: number;
} = {}): string => {
  const params = new URLSearchParams();

  if (category) params.set('category', category);
  if (sort !== DEFAULT_PRODUCT_SORT) params.set('sort', sort);
  if (page > 1) params.set('page', String(page));

  return params.size > 0 ? `${ROUTES.PRODUCTS}?${params}` : ROUTES.PRODUCTS;
};
