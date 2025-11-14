#!/usr/bin/env node

/**
 * Run SQL Fix Script
 * Executes FIX_CAREER_JOURNEY_TABLES.sql against Supabase database
 * 
 * Requires SUPABASE_ACCESS_TOKEN environment variable
 * Get it from: https://supabase.com/dashboard/account/tokens
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'https://ckppwcsnkbrgekxtwccq.supabase.co';
const SUPABASE_PROJECT_REF = 'ckppwcsnkbrgekxtwccq';

// Read the SQL file
const sqlFile = join(__dirname, 'FIX_CAREER_JOURNEY_TABLES.sql');
const sql = readFileSync(sqlFile, 'utf-8');

// Get access token from environment
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN environment variable is required');
  console.error('\nTo get your access token:');
  console.error('1. Go to https://supabase.com/dashboard/account/tokens');
  console.error('2. Create a new access token');
  console.error('3. Run: SUPABASE_ACCESS_TOKEN=your_token node run-sql-fix.js');
  process.exit(1);
}

async function executeSQL() {
  try {
    console.log('🚀 Executing SQL fix script...');
    console.log(`📝 SQL file: ${sqlFile}`);
    console.log(`🔗 Supabase URL: ${SUPABASE_URL}\n`);

    // Use Supabase Management API
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: sql,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error executing SQL:');
      console.error(`Status: ${response.status} ${response.statusText}`);
      console.error(`Response: ${errorText}`);
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ SQL executed successfully!');
    console.log('\n📊 Verification results:');
    if (result.data) {
      console.log(JSON.stringify(result.data, null, 2));
    }
    
    console.log('\n✅ Tables should now be created. Check your Supabase dashboard to verify.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Alternative: Run the SQL directly in Supabase Dashboard:');
    console.error('1. Go to https://supabase.com/dashboard/project/ckppwcsnkbrgekxtwccq/sql/new');
    console.error('2. Copy and paste the contents of FIX_CAREER_JOURNEY_TABLES.sql');
    console.error('3. Click "Run"');
    process.exit(1);
  }
}

executeSQL();

