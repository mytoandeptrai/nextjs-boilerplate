import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { QuoteStatus } from '@/constants/const';
import type { IQuoteRequest } from '@/types/catalog';
import type { IApiError } from '@/types/type';
import { ADMIN_QUOTE_KEYS } from './keys';
import { deleteQuoteRequest, updateQuoteStatusRequest } from './requests';

export const useUpdateQuoteStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<IQuoteRequest, IApiError, { id: string; status: QuoteStatus }>({
    mutationFn: updateQuoteStatusRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_QUOTE_KEYS.all }),
  });
};

export const useDeleteQuoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, IApiError, string>({
    mutationFn: deleteQuoteRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_QUOTE_KEYS.all }),
  });
};
