import { requestInternal } from '../axios';
import { QUOTE_KEYS } from './keys';
import type { QuoteBody } from './schema';
import type { ICreateQuoteResponse } from './type';

export const createQuoteRequest = async (body: QuoteBody): Promise<ICreateQuoteResponse> => {
  const { data } = await requestInternal.post<ICreateQuoteResponse>(QUOTE_KEYS.CREATE, body);

  return data;
};
