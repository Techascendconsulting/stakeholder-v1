import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function reloadSchema() {
  const { error } = await supabase.rpc('postgres_notify', {
    channel: 'pgrst',
    payload: 'reload schema'
  });

  if (error) {
    console.error('❌ Failed to reload schema:', error);
  } else {
    console.log('✅ Supabase schema successfully reloaded.');
  }
}

reloadSchema();

