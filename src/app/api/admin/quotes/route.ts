import { quoteListQuerySchema } from '@/api/admin-quotes/schema';
import { QUOTE_STATUSES } from '@/constants/const';
import { HttpStatus } from '@/enums/enum';
import { withAdmin } from '@/lib/server/admin-session';
import { toApiError } from '@/lib/server/db-error';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { IQuoteRequest } from '@/types/catalog';
import type { IPaginatedListResponse } from '@/types/type';

/** Quote inbox: newest first, optional status filter, plus the number of leads in each status for the filter tabs. */
export const GET = withAdmin(async (req) => {
  const parsed = quoteListQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));

  if (!parsed.success) throw { status: HttpStatus.BAD_REQUEST, message: 'Invalid query' };

  const { status, page, pageSize } = parsed.data;
  const db = getSupabaseAdmin();
  const from = (page - 1) * pageSize;

  let query = db.from('quote_requests').select('*', { count: 'exact' }).order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const [list, ...counts] = await Promise.all([
    query.range(from, from + pageSize - 1),
    ...QUOTE_STATUSES.map((value) =>
      db.from('quote_requests').select('id', { count: 'exact', head: true }).eq('status', value)
    ),
  ]);

  if (list.error) throw toApiError(list.error);

  const total = list.count ?? 0;
  const items = (list.data ?? []).map(
    (row) => ({ ...row, total_estimate: Number(row.total_estimate) }) as IQuoteRequest
  );

  return Response.json({
    items,
    meta: {
      total,
      count: items.length,
      per_page: pageSize,
      current_page: page,
      total_pages: Math.max(1, Math.ceil(total / pageSize)),
    },
    statusCounts: Object.fromEntries(QUOTE_STATUSES.map((value, index) => [value, counts[index].count ?? 0])),
  } satisfies IPaginatedListResponse<IQuoteRequest> & { statusCounts: Record<string, number> });
});
