import { useQuery } from '@tanstack/react-query';

import type { ICategory, IProduct } from '@/types/catalog';
import { CATALOG_KEYS } from './keys';
import { getCategories, getProductsByIds } from './requests';

export const useCategoriesQuery = () =>
  useQuery<ICategory[]>({ queryKey: CATALOG_KEYS.categories, queryFn: getCategories, staleTime: 5 * 60_000 });

/** Current data of the products in the cart, to re-validate prices and availability. */
export const useProductsByIdsQuery = (ids: string[], enabled = true) =>
  useQuery<IProduct[]>({
    queryKey: CATALOG_KEYS.productsByIds(ids),
    queryFn: () => getProductsByIds(ids),
    enabled: enabled && ids.length > 0,
    staleTime: 30_000,
    refetchOnMount: true,
  });
