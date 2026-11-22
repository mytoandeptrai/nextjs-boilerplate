import { type SettingsBody, settingsSchema } from '@/api/admin-settings/schema';
import { SETTING_KEYS } from '@/constants/const';
import { parseBody } from '@/lib/server/admin-handler';
import { withAdmin } from '@/lib/server/admin-session';
import { unwrap } from '@/lib/server/db-error';
import { revalidateStorefront } from '@/lib/server/revalidate';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const readSettings = async (): Promise<SettingsBody> => {
  const rows = unwrap(await getSupabaseAdmin().from('site_settings').select('key, value')) as {
    key: string;
    value: string;
  }[];
  const value = (key: string) => rows.find((row) => row.key === key)?.value ?? '';

  return {
    zalo_hotline: value(SETTING_KEYS.ZALO_HOTLINE),
    quote_notification_email: value(SETTING_KEYS.QUOTE_NOTIFICATION_EMAIL),
  };
};

export const GET = withAdmin(async () => Response.json(await readSettings()));

export const PUT = withAdmin(async (req) => {
  const body = await parseBody(req, settingsSchema);
  const updated_at = new Date().toISOString();

  unwrap(
    await getSupabaseAdmin()
      .from('site_settings')
      .upsert([
        // The hotline is shown on the storefront; the recipient address stays private.
        { key: SETTING_KEYS.ZALO_HOTLINE, value: body.zalo_hotline, is_public: true, updated_at },
        {
          key: SETTING_KEYS.QUOTE_NOTIFICATION_EMAIL,
          value: body.quote_notification_email,
          is_public: false,
          updated_at,
        },
      ])
  );

  revalidateStorefront();

  return Response.json(await readSettings());
});
