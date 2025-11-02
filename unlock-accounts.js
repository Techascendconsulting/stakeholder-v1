// Run this script to unlock all locked accounts
// Usage: node unlock-accounts.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in env.local');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY (or VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function unlockAllAccounts() {
  try {
    console.log('🔓 Unlocking all locked accounts...\n');

    // Get count of locked accounts before
    const { data: beforeData, error: beforeError } = await supabase
      .from('user_profiles')
      .select('user_id, locked, display_name', { count: 'exact' })
      .eq('locked', true);

    if (beforeError) {
      throw beforeError;
    }

    const lockedCount = beforeData?.length || 0;
    console.log(`📊 Found ${lockedCount} locked account(s):\n`);
    
    if (lockedCount > 0) {
      beforeData.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.display_name || user.user_id}`);
      });
      console.log('');
    }

    // Unlock all accounts
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ locked: false })
      .eq('locked', true)
      .select();

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ Successfully unlocked ${updateData?.length || 0} account(s)!\n`);

    // Show current status
    const { data: statusData, error: statusError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, locked, registered_device')
      .order('display_name');

    if (statusError) {
      throw statusError;
    }

    console.log('📋 Current Account Status:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    statusData?.forEach((user, index) => {
      const status = user.locked ? '🔒 LOCKED' : '🔓 Unlocked';
      const device = user.registered_device ? '✓ Has device' : '✗ No device';
      const name = user.display_name || user.user_id.substring(0, 8);
      console.log(`${index + 1}. ${name}`);
      console.log(`   Status: ${status} | Device: ${device}`);
      console.log('');
    });

    console.log('✨ Done! All accounts are now unlocked and ready to use.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

unlockAllAccounts();

