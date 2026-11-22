import { productSchema } from '@/api/admin-products/schema';
import { toProduct } from '@/api/catalog/schema';
import { HttpStatus } from '@/enums/enum';
import { parseBody } from '@/lib/server/admin-handler';
import { withAdmin } from '@/lib/server/admin-session';
import { unwrap } from '@/lib/server/db-error';
import { revalidateStorefront } from '@/lib/server/revalidate';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/** Every product, including inactive ones (the public key only sees active products). */
export const GET = withAdmin(async () => {
  const rows = unwrap(await getSupabaseAdmin().from('products').select('*').order('created_at', { ascending: false }));

  return Response.json((rows as Record<string, unknown>[]).map(toProduct));
});

export const POST = withAdmin(async (req) => {
  const body = await parseBody(req, productSchema);
  const row = unwrap(await getSupabaseAdmin().from('products').insert(body).select('*').single());

  revalidateStorefront();

  return Response.json(toProduct(row), { status: HttpStatus.CREATED });
});
