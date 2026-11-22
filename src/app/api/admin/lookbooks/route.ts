import { lookbookSchema } from '@/api/admin-lookbooks/schema';
import { toLookbook } from '@/api/catalog/schema';
import { HttpStatus } from '@/enums/enum';
import { parseBody } from '@/lib/server/admin-handler';
import { withAdmin } from '@/lib/server/admin-session';
import { unwrap } from '@/lib/server/db-error';
import { revalidateStorefront } from '@/lib/server/revalidate';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const GET = withAdmin(async () => {
  const rows = unwrap(await getSupabaseAdmin().from('lookbooks').select('*').order('created_at', { ascending: false }));

  return Response.json((rows as Record<string, unknown>[]).map(toLookbook));
});

export const POST = withAdmin(async (req) => {
  const body = await parseBody(req, lookbookSchema);
  const row = unwrap(await getSupabaseAdmin().from('lookbooks').insert(body).select('*').single());

  revalidateStorefront();

  return Response.json(toLookbook(row), { status: HttpStatus.CREATED });
});
