import { productSchema } from '@/api/admin-products/schema';
import { toProduct } from '@/api/catalog/schema';
import { getId, type IIdContext, parseBody } from '@/lib/server/admin-handler';
import { withAdmin } from '@/lib/server/admin-session';
import { unwrap } from '@/lib/server/db-error';
import { removeImages } from '@/lib/server/storage';
import { revalidateStorefront } from '@/lib/server/revalidate';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const findProduct = async (id: string) =>
  toProduct(unwrap(await getSupabaseAdmin().from('products').select('*').eq('id', id).single()));

export const GET = withAdmin<IIdContext>(async (_req, context) =>
  Response.json(await findProduct(await getId(context)))
);

export const PUT = withAdmin<IIdContext>(async (req, context) => {
  const id = await getId(context);
  const body = await parseBody(req, productSchema);
  const previous = await findProduct(id);
  const row = unwrap(await getSupabaseAdmin().from('products').update(body).eq('id', id).select('*').single());

  // Photos removed in the form are deleted from the bucket.
  await removeImages(previous.images.filter((url) => !body.images.includes(url)));

  revalidateStorefront();

  return Response.json(toProduct(row));
});

export const DELETE = withAdmin<IIdContext>(async (_req, context) => {
  const id = await getId(context);
  const previous = await findProduct(id);

  unwrap(await getSupabaseAdmin().from('products').delete().eq('id', id));
  await removeImages(previous.images);

  revalidateStorefront();

  return new Response(null, { status: 204 });
});
