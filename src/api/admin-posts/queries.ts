import { useQuery } from '@tanstack/react-query';

import type { IBlogPost } from '@/types/catalog';
import type { IApiError } from '@/types/type';
import { ADMIN_POST_KEYS } from './keys';
import { getAdminPostRequest, getAdminPostsRequest } from './requests';

export const useAdminPostsQuery = () =>
  useQuery<IBlogPost[], IApiError>({
    queryKey: ADMIN_POST_KEYS.list,
    queryFn: getAdminPostsRequest,
    refetchOnMount: true,
  });

export const useAdminPostQuery = (id: string) =>
  useQuery<IBlogPost, IApiError>({
    queryKey: ADMIN_POST_KEYS.detail(id),
    queryFn: () => getAdminPostRequest(id),
    refetchOnMount: 'always',
    gcTime: 0,
  });
