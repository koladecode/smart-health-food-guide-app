import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runMigration() {
  console.log('----------------------------------------------------');
  console.log('Smart Health & Food Guide - Database Migration Runner');
  console.log('----------------------------------------------------');

  const supabaseUrl = process.env.SUPABASE_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.argv[2];

  if (!supabaseUrl) {
    console.error('❌ Error: SUPABASE_URL is not set in environment variables.');
    process.exit(1);
  }

  if (!dbPassword) {
    console.error('❌ Error: Database password is not set.');
    console.log('\nPlease run this command with your Supabase Database Password:');
    console.log('  SUPABASE_DB_PASSWORD=your_password npm run migrate');
    console.log('or:');
    console.log('  npm run migrate -- your_password\n');
    process.exit(1);
  }

  // Extract project reference ID from Supabase URL
  let projectRef = '';
  try {
    const urlObj = new URL(supabaseUrl);
    projectRef = urlObj.hostname.split('.')[0];
  } catch (err) {
    // Fallback if URL parsing fails
    const match = supabaseUrl.match(/https?:\/\/([^.]+)\./);
    if (match) {
      projectRef = match[1];
    }
  }

  if (!projectRef || projectRef === 'localhost' || projectRef === '127') {
    console.error('❌ Error: Could not extract a valid Supabase project reference from SUPABASE_URL:', supabaseUrl);
    process.exit(1);
  }

  const dbHost = `db.${projectRef}.supabase.co`;
  const connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@${dbHost}:5432/postgres`;

  console.log(`Connecting to database at: ${dbHost}...`);

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Supabase SSL connections
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully to remote database!');

    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/schema.sql');
    console.log(`Reading SQL schema file from: ${migrationPath}...`);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at path: ${migrationPath}`);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('Applying database schema (creating tables, triggers, indexes, and RLS policies)...');

    // Run the migration as a single transaction block
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    console.log('----------------------------------------------------');
    console.log('🎉 SUCCESS: Database schema applied successfully!');
    console.log('----------------------------------------------------');
  } catch (err: any) {
    console.error('❌ Migration failed!');
    console.error('Error Details:', err.message || err);
    
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      // Ignore rollback errors if transaction hasn't started or already failed
    }
  } finally {
    await client.end();
  }
}

runMigration();
