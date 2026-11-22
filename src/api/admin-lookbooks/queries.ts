import { useQuery } from '@tanstack/react-query';

import type { ILookbook } from '@/types/catalog';
import type { IApiError } from '@/types/type';
import { ADMIN_LOOKBOOK_KEYS } from './keys';
import { getAdminLookbookRequest, getAdminLookbooksRequest } from './requests';

export const useAdminLookbooksQuery = () =>
  useQuery<ILookbook[], IApiError>({
    queryKey: ADMIN_LOOKBOOK_KEYS.list,
    queryFn: getAdminLookbooksRequest,
    refetchOnMount: true,
  });

export const useAdminLookbookQuery = (id: string) =>
  useQuery<ILookbook, IApiError>({
    queryKey: ADMIN_LOOKBOOK_KEYS.detail(id),
    queryFn: () => getAdminLookbookRequest(id),
    refetchOnMount: 'always',
    gcTime: 0,
  });
