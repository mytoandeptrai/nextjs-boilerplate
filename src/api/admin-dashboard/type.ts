import type { QuoteStatus } from '@/constants/const';
import type { IQuoteRequest } from '@/types/catalog';

export interface IDashboardResponse {
  statusCounts: Record<QuoteStatus, number>;
  totalQuotes: number;
  products: number;
  lookbooks: number;
  posts: number;
  recentQuotes: IQuoteRequest[];
}
