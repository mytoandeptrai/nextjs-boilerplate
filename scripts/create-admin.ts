/**
 * Create (or promote) an admin account for the /admin portal.
 *
 *   pnpm admin:create <email> <password>
 *
 * An admin is a Supabase Auth user whose `app_metadata.role` is `admin`. Only the service role can write
 * `app_metadata`, so nobody can grant themselves the role from the browser. Running it again for the same email
 * resets the password.
 */
import { createClient } from '@supabase/supabase-js';

const [email, password] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (see .env.example).');
  process.exit(1);
}

if (!email || !password || password.length < 10) {
  console.error('Usage: pnpm admin:create <email> <password>   (password: at least 10 characters)');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

const findUser = async (address: string) => {
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });

    if (error) throw error;

    const user = data.users.find((item) => item.email?.toLowerCase() === address.toLowerCase());

    if (user || data.users.length < 200) return user;
  }

  return undefined;
};

const existing = await findUser(email);
const { error } = existing
  ? await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      app_metadata: { ...existing.app_metadata, role: 'admin' },
    })
  : await supabase.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role: 'admin' } });

if (error) {
  console.error(`Could not ${existing ? 'update' : 'create'} the admin:`, error.message);
  process.exit(1);
}

console.log(`${existing ? 'Updated' : 'Created'} admin ${email}. Sign in at /admin/login.`);
