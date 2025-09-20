import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key required

if (!url || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

async function run() {
  let page = 1;
  let elevated = 0;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const batch = data?.users || [];
    if (batch.length === 0) break;

    for (const u of batch) {
      const app_metadata = { ...(u.app_metadata || {}), role: 'admin' };
      const { error: updErr } = await supabase.auth.admin.updateUserById(u.id, { app_metadata });
      if (updErr) {
        console.error(`Failed to elevate ${u.email}: ${updErr.message}`);
      } else {
        elevated++;
        console.log(`Elevated ${u.email}`);
      }
    }
    page++;
  }
  console.log(`Done. Elevated ${elevated} users to admin.`);
}

run().catch((e) => { console.error(e); process.exit(1); });


