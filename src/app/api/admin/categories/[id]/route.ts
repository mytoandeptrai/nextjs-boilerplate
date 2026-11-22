import { categorySchema } from '@/api/admin-categories/schema';
import { getId, type IIdContext, parseBody } from '@/lib/server/admin-handler';
import { withAdmin } from '@/lib/server/admin-session';
import { unwrap } from '@/lib/server/db-error';
import { revalidateStorefront } from '@/lib/server/revalidate';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { ICategory } from '@/types/catalog';

export const PUT = withAdmin<IIdContext>(async (req, context) => {
  const id = await getId(context);
  const body = await parseBody(req, categorySchema);
  const row = unwrap<ICategory>(
    await getSupabaseAdmin().from('categories').update(body).eq('id', id).select('*').single()
  );

  revalidateStorefront();

  return Response.json(row);
});

/** Products of a deleted category are kept and become uncategorised (`products.category_id` is `on delete set null`). */
export const DELETE = withAdmin<IIdContext>(async (_req, context) => {
  const id = await getId(context);

  unwrap(await getSupabaseAdmin().from('categories').delete().eq('id', id));
  revalidateStorefront();

  return new Response(null, { status: 204 });
});
