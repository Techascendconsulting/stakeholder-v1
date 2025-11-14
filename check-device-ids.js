// Check what device IDs are stored vs generated
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDeviceIds() {
  try {
    console.log('🔍 Checking device IDs in database...\n');

    // Get all users with registered devices
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, registered_device, locked')
      .not('registered_device', 'is', null);

    if (error) {
      throw error;
    }

    console.log(`Found ${users?.length || 0} users with registered devices:\n`);
    
    users?.forEach((user, index) => {
      console.log(`${index + 1}. ${user.display_name || user.user_id.substring(0, 8)}`);
      console.log(`   User ID: ${user.user_id}`);
      console.log(`   Locked: ${user.locked ? '🔒 YES' : '🔓 NO'}`);
      console.log(`   Registered Device: ${user.registered_device}`);
      console.log(`   Device Length: ${user.registered_device?.length || 0} chars`);
      console.log('');
    });

    console.log('\n📝 Expected device ID format (from logs):');
    console.log('   6416f20a70d93bce21575e912974ae19');
    console.log('   (32 characters - SHA-256 hash of: MacIntel|8|Google Inc.)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDeviceIds();












