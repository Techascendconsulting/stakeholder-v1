const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkAuth() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.log('❌ Error checking auth:', error);
    return;
  }
  
  if (session) {
    console.log('✅ Authenticated as:', session.user.email);
    console.log('User ID:', session.user.id);
  } else {
    console.log('❌ Not authenticated');
  }
}

checkAuth();
