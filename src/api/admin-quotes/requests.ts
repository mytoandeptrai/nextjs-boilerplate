import type { QuoteStatus } from '@/constants/const';
import { buildRoute } from '@/constants/routes';
import type { IQuoteRequest } from '@/types/catalog';
import { requestInternal } from '../axios';
import { ADMIN_QUOTE_KEYS } from './keys';
import type { IQuoteListParams, IQuoteListResponse } from './type';

export const getQuotesRequest = async (params: IQuoteListParams): Promise<IQuoteListResponse> =>
  (await requestInternal.get<IQuoteListResponse>(ADMIN_QUOTE_KEYS.LIST, { params })).data;

export const updateQuoteStatusRequest = async ({
  id,
  status,
}: {
  id: string;
  status: QuoteStatus;
}): Promise<IQuoteRequest> =>
  (await requestInternal.patch<IQuoteRequest>(buildRoute(ADMIN_QUOTE_KEYS.DETAIL, { id }), { status })).data;

export const deleteQuoteRequest = async (id: string): Promise<void> => {
  await requestInternal.delete(buildRoute(ADMIN_QUOTE_KEYS.DETAIL, { id }));
};
