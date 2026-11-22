import { useQuery } from '@tanstack/react-query';

import type { IProduct } from '@/types/catalog';
import type { IApiError } from '@/types/type';
import { ADMIN_PRODUCT_KEYS } from './keys';
import { getAdminProductRequest, getAdminProductsRequest } from './requests';

export const useAdminProductsQuery = () =>
  useQuery<IProduct[], IApiError>({
    queryKey: ADMIN_PRODUCT_KEYS.list,
    queryFn: getAdminProductsRequest,
    refetchOnMount: true,
  });

export const useAdminProductQuery = (id: string) =>
  useQuery<IProduct, IApiError>({
    queryKey: ADMIN_PRODUCT_KEYS.detail(id),
    queryFn: () => getAdminProductRequest(id),
    refetchOnMount: 'always',
    gcTime: 0,
  });
