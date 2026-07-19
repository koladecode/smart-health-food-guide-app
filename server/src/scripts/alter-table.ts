import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runAlter() {
  console.log('--- ALTERING HEALTH PROFILES TABLE ---');

  const supabaseUrl = process.env.SUPABASE_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!supabaseUrl) {
    console.error('❌ Error: SUPABASE_URL is not set in environment variables.');
    return;
  }

  if (!dbPassword) {
    console.error('❌ Error: SUPABASE_DB_PASSWORD is not set in environment variables.');
    return;
  }

  // Extract project reference ID from Supabase URL
  let projectRef = '';
  try {
    const urlObj = new URL(supabaseUrl);
    projectRef = urlObj.hostname.split('.')[0];
  } catch (err) {
    const match = supabaseUrl.match(/https?:\/\/([^.]+)\./);
    if (match) {
      projectRef = match[1];
    }
  }

  if (!projectRef) {
    console.error('❌ Error: Could not extract a valid Supabase project reference.');
    return;
  }

  const dbHost = `db.${projectRef}.supabase.co`;
  const connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@${dbHost}:5432/postgres`;

  console.log(`Connecting to database at ${dbHost}...`);
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!');

    console.log('Adding column country_or_region to public.health_profiles table if it does not exist...');
    const alterQuery = `
      ALTER TABLE public.health_profiles 
      ADD COLUMN IF NOT EXISTS country_or_region TEXT DEFAULT 'Global/Other' NOT NULL;
    `;
    await client.query(alterQuery);
    console.log('✅ Column country_or_region added successfully or already exists!');

    // Let's also verify the columns on the table
    const verifyQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'health_profiles';
    `;
    const res = await client.query(verifyQuery);
    console.log('Current columns in public.health_profiles:');
    res.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

  } catch (err: any) {
    console.error('❌ Failed to alter table:', err.message || err);
  } finally {
    await client.end();
  }
}

runAlter();
