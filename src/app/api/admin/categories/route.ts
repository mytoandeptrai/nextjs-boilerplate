import { categorySchema } from '@/api/admin-categories/schema';
import { HttpStatus } from '@/enums/enum';
import { parseBody } from '@/lib/server/admin-handler';
import { withAdmin } from '@/lib/server/admin-session';
import { unwrap } from '@/lib/server/db-error';
import { revalidateStorefront } from '@/lib/server/revalidate';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { IAdminCategory, ICategory } from '@/types/catalog';

/** Every category in display order, with the number of products (active or not) filed under it. */
export const GET = withAdmin(async () => {
  const db = getSupabaseAdmin();
  const [categories, products] = await Promise.all([
    db.from('categories').select('*').order('display_order').order('title'),
    db.from('products').select('category_id').not('category_id', 'is', null),
  ]);
  const counts = new Map<string, number>();

  for (const { category_id } of unwrap<{ category_id: string }[]>(products))
    counts.set(category_id, (counts.get(category_id) ?? 0) + 1);

  return Response.json(
    unwrap<ICategory[]>(categories).map(
      (category): IAdminCategory => ({ ...category, product_count: counts.get(category.id) ?? 0 })
    )
  );
});

export const POST = withAdmin(async (req) => {
  const body = await parseBody(req, categorySchema);
  const row = unwrap<ICategory>(await getSupabaseAdmin().from('categories').insert(body).select('*').single());

  revalidateStorefront();

  return Response.json(row, { status: HttpStatus.CREATED });
});
