import { postSchema, toPostRow } from '@/api/admin-posts/schema';
import { toBlogPost } from '@/api/catalog/schema';
import { getId, type IIdContext, parseBody } from '@/lib/server/admin-handler';
import { withAdmin } from '@/lib/server/admin-session';
import { unwrap } from '@/lib/server/db-error';
import { removeImages } from '@/lib/server/storage';
import { revalidateStorefront } from '@/lib/server/revalidate';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const findPost = async (id: string) =>
  toBlogPost(unwrap(await getSupabaseAdmin().from('blog_posts').select('*').eq('id', id).single()));

export const GET = withAdmin<IIdContext>(async (_req, context) => Response.json(await findPost(await getId(context))));

export const PUT = withAdmin<IIdContext>(async (req, context) => {
  const id = await getId(context);
  const body = await parseBody(req, postSchema);
  const previous = await findPost(id);
  const row = unwrap(
    await getSupabaseAdmin()
      .from('blog_posts')
      .update(toPostRow(body, previous.published_at))
      .eq('id', id)
      .select('*')
      .single()
  );

  if (previous.thumbnail_url !== body.thumbnail_url) await removeImages([previous.thumbnail_url]);

  revalidateStorefront();

  return Response.json(toBlogPost(row));
});

export const DELETE = withAdmin<IIdContext>(async (_req, context) => {
  const id = await getId(context);
  const previous = await findPost(id);

  unwrap(await getSupabaseAdmin().from('blog_posts').delete().eq('id', id));
  await removeImages([previous.thumbnail_url]);

  revalidateStorefront();

  return new Response(null, { status: 204 });
});
