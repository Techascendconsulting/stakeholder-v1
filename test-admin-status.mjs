import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminStatus() {
  console.log('🔍 Testing admin status for superadmin@test.com...');
  
  try {
    // First, get the user ID from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail('superadmin@test.com');
    
    if (authError) {
      console.error('❌ Error getting auth user:', authError);
      return;
    }
    
    if (!authUser.user) {
      console.error('❌ User not found in auth.users');
      return;
    }
    
    console.log('✅ Found user in auth.users:', authUser.user.id);
    
    // Now check user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id, is_admin, is_super_admin, is_senior_admin, locked, registered_device')
      .eq('user_id', authUser.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Error getting user profile:', profileError);
      return;
    }
    
    console.log('✅ User profile:', profile);
    
    const isAdmin = profile.is_admin || profile.is_super_admin || profile.is_senior_admin;
    console.log('🔐 Is admin?', isAdmin);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminStatus();
