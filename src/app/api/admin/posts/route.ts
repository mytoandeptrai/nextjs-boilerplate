import { postSchema, toPostRow } from '@/api/admin-posts/schema';
import { toBlogPost } from '@/api/catalog/schema';
import { HttpStatus } from '@/enums/enum';
import { parseBody } from '@/lib/server/admin-handler';
import { withAdmin } from '@/lib/server/admin-session';
import { unwrap } from '@/lib/server/db-error';
import { revalidateStorefront } from '@/lib/server/revalidate';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/** Every guide, drafts included. */
export const GET = withAdmin(async () => {
  const rows = unwrap(
    await getSupabaseAdmin()
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: true })
  );

  return Response.json((rows as Record<string, unknown>[]).map(toBlogPost));
});

export const POST = withAdmin(async (req) => {
  const body = await parseBody(req, postSchema);
  const row = unwrap(await getSupabaseAdmin().from('blog_posts').insert(toPostRow(body)).select('*').single());

  revalidateStorefront();

  return Response.json(toBlogPost(row), { status: HttpStatus.CREATED });
});
