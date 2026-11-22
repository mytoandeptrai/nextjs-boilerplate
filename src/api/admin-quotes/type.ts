import type { QuoteStatus } from '@/constants/const';
import type { IQuoteRequest } from '@/types/catalog';
import type { IPaginatedListResponse } from '@/types/type';

export interface IQuoteListParams {
  status?: QuoteStatus;
  /** 1-based. */
  page: number;
  pageSize: number;
}

export interface IQuoteListResponse extends IPaginatedListResponse<IQuoteRequest> {
  /** Leads in each status, for the filter tabs. */
  statusCounts: Record<QuoteStatus, number>;
}
