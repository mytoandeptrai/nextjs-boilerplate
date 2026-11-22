import { quoteStatusSchema } from '@/api/admin-quotes/schema';
import { getId, type IIdContext, parseBody } from '@/lib/server/admin-handler';
import { withAdmin } from '@/lib/server/admin-session';
import { unwrap } from '@/lib/server/db-error';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/** Move a lead along the consultation progress. */
export const PATCH = withAdmin<IIdContext>(async (req, context) => {
  const id = await getId(context);
  const { status } = await parseBody(req, quoteStatusSchema);
  const row = unwrap(
    await getSupabaseAdmin().from('quote_requests').update({ status }).eq('id', id).select('*').single()
  );

  return Response.json({ ...row, total_estimate: Number(row.total_estimate) });
});

export const DELETE = withAdmin<IIdContext>(async (_req, context) => {
  const id = await getId(context);

  unwrap(await getSupabaseAdmin().from('quote_requests').delete().eq('id', id));

  return new Response(null, { status: 204 });
});
