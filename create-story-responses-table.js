// Create story_responses table in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: 'env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
  try {
    console.log('📝 Creating story_responses table...\n');

    // Read the SQL file
    const sql = fs.readFileSync('CREATE_STORY_RESPONSES_TABLE.sql', 'utf-8');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log('⚠️ exec_sql function not found, trying direct approach...\n');
      
      // Try creating the table directly
      const { error: createError } = await supabase.from('story_responses').select('*').limit(1);
      
      if (createError && createError.code === '42P01') {
        console.log('❌ Table does not exist and cannot be created via client.');
        console.log('📋 Please run this SQL manually in Supabase SQL Editor:\n');
        console.log('━'.repeat(80));
        console.log(sql);
        console.log('━'.repeat(80));
        console.log('\nSteps:');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Click "SQL Editor"');
        console.log('4. Click "New Query"');
        console.log('5. Paste the SQL above');
        console.log('6. Click "Run"');
        return;
      }
      
      console.log('✅ Table already exists or was created!');
      return;
    }

    console.log('✅ SQL executed successfully!');
    console.log('📊 Result:', data);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTable();












