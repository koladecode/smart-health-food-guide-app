import { getSupabaseAdminClient } from '../services/supabase';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  const outputLines: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    outputLines.push(msg);
  };

  try {
    const supabase = getSupabaseAdminClient();
    log('=== COMPACT DATABASE INSPECTION ===');

    // 1. Get all users from auth
    log('\n--- AUTH USERS ---');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      log(`Error listing auth users: ${authError.message}`);
    } else {
      log(`Total Auth Users: ${users?.length || 0}`);
      for (const u of users || []) {
        log(`  - ID: ${u.id}, Email: ${u.email}`);
      }
    }

    // 2. Get public.users
    log('\n--- PUBLIC.USERS TABLE ---');
    const { data: publicUsers, error: pubUsersErr } = await supabase
      .from('users')
      .select('*');
    if (pubUsersErr) {
      log(`Error fetching public.users: ${pubUsersErr.message}`);
    } else {
      log(`Total public.users: ${publicUsers?.length || 0}`);
      for (const u of publicUsers || []) {
        log(`  - ID: ${u.id}, Email: ${u.email}, CreatedAt: ${u.created_at}`);
      }
    }

    // 3. Get health profiles
    log('\n--- HEALTH PROFILES ---');
    const { data: profiles, error: profilesError } = await supabase
      .from('health_profiles')
      .select('*');
    if (profilesError) {
      log(`Error fetching health profiles: ${profilesError.message}`);
    } else {
      log(`Total health profiles: ${profiles?.length || 0}`);
      for (const p of profiles || []) {
        log(`  - Profile ID: ${p.id}`);
        log(`    UserID: ${p.user_id}`);
        log(`    Name: ${p.full_name}`);
        log(`    Goal: ${p.health_goal}`);
        log(`    CreatedAt: ${p.created_at}`);
      }
    }

    // 4. Get health conditions
    log('\n--- HEALTH CONDITIONS ---');
    const { data: conditions, error: conditionsErr } = await supabase
      .from('health_conditions')
      .select('*');
    if (conditionsErr) {
      log(`Error fetching health conditions: ${conditionsErr.message}`);
    } else {
      log(`Total health conditions: ${conditions?.length || 0}`);
      for (const c of conditions || []) {
        log(`  - Condition ID: ${c.id}, ProfileID: ${c.profile_id}, Name: ${c.name}, Type: ${c.type}`);
      }
    }

    // 5. Get recommendations
    log('\n--- RECOMMENDATIONS ---');
    const { data: recs, error: recsError } = await supabase
      .from('recommendations')
      .select('*');
    if (recsError) {
      log(`Error fetching recommendations: ${recsError.message}`);
    } else {
      log(`Total recommendations: ${recs?.length || 0}`);
      for (const r of recs || []) {
        log(`  - Rec ID: ${r.id}`);
        log(`    UserID: ${r.user_id}`);
        log(`    BMI: ${r.bmi_value} (${r.bmi_category})`);
        log(`    Water: ${r.water_liters}L`);
        log(`    CreatedAt: ${r.created_at}`);
        log(`    UpdatedAt: ${r.updated_at}`);
      }
    }

    // 6. Get exercises counts
    log('\n--- EXERCISES TABLE ---');
    const { data: exercises, error: exercisesErr } = await supabase
      .from('exercises')
      .select('id, recommendation_id, type');
    if (exercisesErr) {
      log(`Error fetching exercises: ${exercisesErr.message}`);
    } else {
      log(`Total exercises: ${exercises?.length || 0}`);
      for (const e of exercises || []) {
        log(`  - ID: ${e.id}, RecID: ${e.recommendation_id}, Type: ${e.type}`);
      }
    }

    // 7. Get foods counts
    log('\n--- FOODS TABLE ---');
    const { data: foods, error: foodsErr } = await supabase
      .from('foods')
      .select('id, recommendation_id, title, type');
    if (foodsErr) {
      log(`Error fetching foods: ${foodsErr.message}`);
    } else {
      log(`Total foods: ${foods?.length || 0}`);
      for (const f of foods || []) {
        log(`  - ID: ${f.id}, RecID: ${f.recommendation_id}, Title: ${f.title}, Type: ${f.type}`);
      }
    }

    // Write to file at root
    const rootPath = path.join(__dirname, '../../..');
    fs.writeFileSync(path.join(rootPath, 'inspect_output.txt'), outputLines.join('\n'), 'utf8');
    console.log(`\nSuccessfully wrote output to: ${path.join(rootPath, 'inspect_output.txt')}`);

  } catch (err: any) {
    console.error('Unexpected error in inspect script:', err);
  }
}

run();



