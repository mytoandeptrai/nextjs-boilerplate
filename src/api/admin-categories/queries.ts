import { useQuery } from '@tanstack/react-query';

import type { IAdminCategory } from '@/types/catalog';
import type { IApiError } from '@/types/type';
import { ADMIN_CATEGORY_KEYS } from './keys';
import { getAdminCategoriesRequest } from './requests';

export const useAdminCategoriesQuery = () =>
  useQuery<IAdminCategory[], IApiError>({
    queryKey: ADMIN_CATEGORY_KEYS.list,
    queryFn: getAdminCategoriesRequest,
    refetchOnMount: true,
  });
