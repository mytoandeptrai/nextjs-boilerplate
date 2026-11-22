import { z } from 'zod';

import { QUOTE_STATUSES } from '@/constants/const';

export const quoteStatusSchema = z.object({ status: z.enum(QUOTE_STATUSES) });

export const quoteListQuerySchema = z.object({
  status: z.enum(QUOTE_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});
