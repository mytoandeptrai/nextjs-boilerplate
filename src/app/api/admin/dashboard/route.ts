import type { IDashboardResponse } from '@/api/admin-dashboard/type';
import { QUOTE_STATUSES, type QuoteStatus } from '@/constants/const';
import { withAdmin } from '@/lib/server/admin-session';
import { toApiError } from '@/lib/server/db-error';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { IQuoteRequest } from '@/types/catalog';

/** Numbers for the admin landing page: leads per status, content counts and the five newest leads. */
export const GET = withAdmin(async () => {
  const db = getSupabaseAdmin();
  const count = (table: string) => db.from(table).select('id', { count: 'exact', head: true });

  const [recent, products, lookbooks, posts, ...statuses] = await Promise.all([
    db.from('quote_requests').select('*').order('created_at', { ascending: false }).limit(5),
    count('products'),
    count('lookbooks'),
    count('blog_posts'),
    ...QUOTE_STATUSES.map((status) => count('quote_requests').eq('status', status)),
  ]);

  if (recent.error) throw toApiError(recent.error);

  const statusCounts = Object.fromEntries(
    QUOTE_STATUSES.map((status, index) => [status, statuses[index].count ?? 0])
  ) as Record<QuoteStatus, number>;

  return Response.json({
    statusCounts,
    totalQuotes: Object.values(statusCounts).reduce((sum, value) => sum + value, 0),
    products: products.count ?? 0,
    lookbooks: lookbooks.count ?? 0,
    posts: posts.count ?? 0,
    recentQuotes: (recent.data ?? []).map(
      (row) => ({ ...row, total_estimate: Number(row.total_estimate) }) as IQuoteRequest
    ),
  } satisfies IDashboardResponse);
});
