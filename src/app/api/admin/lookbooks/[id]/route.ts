import { lookbookSchema } from '@/api/admin-lookbooks/schema';
import { toLookbook } from '@/api/catalog/schema';
import { getId, type IIdContext, parseBody } from '@/lib/server/admin-handler';
import { withAdmin } from '@/lib/server/admin-session';
import { unwrap } from '@/lib/server/db-error';
import { removeImages } from '@/lib/server/storage';
import { revalidateStorefront } from '@/lib/server/revalidate';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const findLookbook = async (id: string) =>
  toLookbook(unwrap(await getSupabaseAdmin().from('lookbooks').select('*').eq('id', id).single()));

export const PUT = withAdmin<IIdContext>(async (req, context) => {
  const id = await getId(context);
  const body = await parseBody(req, lookbookSchema);
  const previous = await findLookbook(id);
  const row = unwrap(await getSupabaseAdmin().from('lookbooks').update(body).eq('id', id).select('*').single());

  if (previous.image_url !== body.image_url) await removeImages([previous.image_url]);

  revalidateStorefront();

  return Response.json(toLookbook(row));
});

export const DELETE = withAdmin<IIdContext>(async (_req, context) => {
  const id = await getId(context);
  const previous = await findLookbook(id);

  unwrap(await getSupabaseAdmin().from('lookbooks').delete().eq('id', id));
  await removeImages([previous.image_url]);

  revalidateStorefront();

  return new Response(null, { status: 204 });
});
