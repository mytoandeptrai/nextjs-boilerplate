import { useQuery } from '@tanstack/react-query';

import type { IApiError } from '@/types/type';
import { CHAT_KEYS } from './keys';
import { getChatStatusRequest } from './requests';
import type { IChatStatus } from './type';

/** Asked once per visit: the key is a runtime setting of the server, unknown when the pages are prerendered. */
export const useChatStatusQuery = () =>
  useQuery<IChatStatus, IApiError>({
    queryKey: CHAT_KEYS.status,
    queryFn: getChatStatusRequest,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
