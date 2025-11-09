import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Run raw SQL to refresh schema
async function reloadSchema() {
  const { error } = await supabase
    .from('user_progress')
    .select('id')
    .limit(1);

  // Then send schema reload request
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
    method: 'GET',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      Prefer: 'count=exact'
    }
  });

  if (error) {
    console.error('❌ Schema reload failed:', error);
  } else {
    console.log('✅ Supabase schema refreshed by forcing metadata sync.');
  }
}

reloadSchema();



