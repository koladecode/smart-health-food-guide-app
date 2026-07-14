import { getSupabaseAdminClient } from '../services/supabase';

async function run() {
  try {
    const supabase = getSupabaseAdminClient();
    console.log('Inspecting Supabase DB...');

    // 1. Get all users from auth
    console.log('\n--- AUTH USERS ---');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Error listing auth users:', authError);
    } else {
      console.log(`Found ${users?.length || 0} auth users:`);
      for (const u of users || []) {
        console.log(`- ID: ${u.id}, Email: ${u.email}`);
        console.log(`  User Metadata:`, JSON.stringify(u.user_metadata, null, 2));
      }
    }

    // 2. Get health profiles
    console.log('\n--- HEALTH PROFILES ---');
    const { data: profiles, error: profilesError } = await supabase
      .from('health_profiles')
      .select('*');
    if (profilesError) {
      console.error('Error fetching health profiles:', profilesError);
    } else {
      console.log(`Found ${profiles?.length || 0} health profiles:`);
      for (const p of profiles || []) {
        console.log(`- ID: ${p.id}, UserID: ${p.user_id}, Name: ${p.full_name}, Goal: ${p.health_goal}`);
      }
    }

  } catch (err) {
    console.error('Unexpected error in inspect script:', err);
  }
}

run();
