// Reset all device IDs to allow fresh registration with new ultra-stable format
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetDeviceIds() {
  try {
    console.log('🔄 Resetting all device IDs to new ultra-stable format...\n');

    // Get all users with registered devices
    const { data: users, error: fetchError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, registered_device, locked');

    if (fetchError) {
      throw fetchError;
    }

    const totalUsers = users?.length || 0;
    const withDevices = users?.filter(u => u.registered_device) || [];
    const lockedUsers = users?.filter(u => u.locked) || [];

    console.log(`📊 Current Status:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with old device IDs: ${withDevices.length}`);
    console.log(`   Locked users: ${lockedUsers.length}\n`);

    // Reset all device IDs and unlock all accounts
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        registered_device: null,
        locked: false
      })
      .not('user_id', 'is', null)
      .select();

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ Successfully reset ${updateData?.length || 0} accounts!\n`);
    console.log(`📝 What happened:`);
    console.log(`   • Cleared all old device IDs (they were generated with vendorFlavors)`);
    console.log(`   • Unlocked all accounts`);
    console.log(`   • Next login will register new ultra-stable device ID\n`);
    
    console.log(`🔐 New device ID format:`);
    console.log(`   Generated from: Platform | CPU Cores | GPU Vendor`);
    console.log(`   Example: MacIntel|8|Google Inc.`);
    console.log(`   Hash: 6416f20a70d93bce21575e912974ae19\n`);
    
    console.log(`✨ All users can now login and will be assigned new stable device IDs!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetDeviceIds();












