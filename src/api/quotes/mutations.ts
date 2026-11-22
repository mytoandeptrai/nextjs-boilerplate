import { useMutation } from '@tanstack/react-query';

import type { IApiError } from '@/types/type';
import { createQuoteRequest } from './requests';
import type { QuoteBody } from './schema';
import type { ICreateQuoteResponse } from './type';

export const useCreateQuoteMutation = () =>
  useMutation<ICreateQuoteResponse, IApiError, QuoteBody>({
    mutationKey: ['create-quote'],
    mutationFn: createQuoteRequest,
  });
