import { clearAuthCookies } from '@/lib/server/backend';

export async function POST() {
  await clearAuthCookies();

  return new Response(null, { status: 204 });
}
