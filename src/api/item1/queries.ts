import { useQuery } from '@tanstack/react-query';

import type { IApiError } from '@/types/type';
import { item1QueryKeys } from './keys';
import { getItem1DetailRequest, getItem1ListRequest } from './requests';
import type { IGetItem1ListParams, IItem1 } from './type';

export const useItem1ListQuery = (params: IGetItem1ListParams) =>
  useQuery<Awaited<ReturnType<typeof getItem1ListRequest>>, IApiError>({
    queryKey: item1QueryKeys.list(params),
    queryFn: () => getItem1ListRequest(params),
  });

export const useItem1DetailQuery = (id: string) =>
  useQuery<IItem1, IApiError>({
    queryKey: item1QueryKeys.detail(id),
    queryFn: () => getItem1DetailRequest(id),
  });
