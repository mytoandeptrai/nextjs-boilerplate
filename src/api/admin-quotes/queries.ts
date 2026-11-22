import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { IApiError } from '@/types/type';
import { ADMIN_QUOTE_KEYS } from './keys';
import { getQuotesRequest } from './requests';
import type { IQuoteListParams, IQuoteListResponse } from './type';

export const useQuotesQuery = (params: IQuoteListParams) =>
  useQuery<IQuoteListResponse, IApiError>({
    queryKey: ADMIN_QUOTE_KEYS.list(params),
    queryFn: () => getQuotesRequest(params),
    placeholderData: keepPreviousData,
    refetchOnMount: true,
  });
