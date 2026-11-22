import { clearAuthCookies } from '@/lib/server/admin-session';

export async function POST() {
  await clearAuthCookies();

  return new Response(null, { status: 204 });
}
