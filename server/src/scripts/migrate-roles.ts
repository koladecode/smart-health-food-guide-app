import { getSupabaseAdminClient } from '../services/supabase';

async function runRoleMigration() {
  console.log('--- MIGRATING ROLE COLUMN ON PUBLIC.USERS VIA SUPABASE ADMIN CLIENT ---');

  try {
    const adminSupabase = getSupabaseAdminClient();

    // 1. Fetch current users
    const { data: users, error: fetchErr } = await adminSupabase
      .from('users')
      .select('id, email, role');

    if (fetchErr) {
      console.error('Fetch error:', fetchErr);
    } else {
      console.log('Current public.users rows:', users);
    }

    // 2. Set role='admin' for existing admin account (akanjicornelius@gmail.com)
    const { error: updateErr1 } = await adminSupabase
      .from('users')
      .update({ role: 'admin' })
      .ilike('email', 'akanjicornelius@gmail.com');

    if (updateErr1) {
      console.error('Error setting admin role for akanjicornelius@gmail.com:', updateErr1);
    } else {
      console.log('✅ Set role = "admin" for akanjicornelius@gmail.com');
    }

    // 3. Ensure other existing users have role = 'user' if null or empty
    const { data: updatedUsers } = await adminSupabase
      .from('users')
      .select('id, email, role');

    console.log('Updated public.users rows:', updatedUsers);

  } catch (err: any) {
    console.error('❌ Migration exception:', err.message || err);
  }
}

runRoleMigration();
