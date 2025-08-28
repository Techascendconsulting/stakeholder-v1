import { supabase } from './supabase';

// Test credentials for development
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

// Second test account for testing interactions
const TEST_EMAIL_2 = 'test2@example.com';
const TEST_PASSWORD_2 = 'testpassword123';

// Admin account credentials
const ADMIN_EMAIL = 'admin@batraining.com';
const ADMIN_PASSWORD = 'Enterprise2024!';

export async function ensureTestUserAuthenticated() {
  try {
    console.log('🔐 Ensuring test user is authenticated...');
    
    // Check if user is already authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error checking user:', userError);
      return { success: false, message: 'Error checking user' };
    }
    
    if (user) {
      console.log('✅ User already authenticated:', user.email);
      return { success: true, message: 'User already authenticated', user };
    }
    
    console.log('🔐 No user authenticated, attempting to sign in with test credentials...');
    
    // Try to sign in with test credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (signInError) {
      console.log('⚠️ Sign in failed, attempting to create test user...');
      
      // If sign in fails, try to create the test user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      
      if (signUpError) {
        console.error('❌ Error creating test user:', signUpError);
        return { success: false, message: 'Error creating test user' };
      }
      
      console.log('✅ Test user created successfully');
      
      // Try to sign in again
      const { data: retrySignInData, error: retrySignInError } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      
      if (retrySignInError) {
        console.error('❌ Error signing in after user creation:', retrySignInError);
        return { success: false, message: 'Error signing in after user creation' };
      }
      
      console.log('✅ Test user signed in successfully');
      return { success: true, message: 'Test user created and signed in', user: retrySignInData.user };
      
    } else {
      console.log('✅ Test user signed in successfully');
      return { success: true, message: 'Test user signed in', user: signInData.user };
    }
    
  } catch (error) {
    console.error('❌ Error in ensureTestUserAuthenticated:', error);
    return { success: false, message: 'Unexpected error' };
  }
}

export async function signOutTestUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Error signing out:', error);
      return { success: false, message: 'Error signing out' };
    }
    console.log('✅ Test user signed out');
    return { success: true, message: 'Test user signed out' };
  } catch (error) {
    console.error('❌ Error in signOutTestUser:', error);
    return { success: false, message: 'Unexpected error' };
  }
}

export async function ensureTestUser2Authenticated() {
  try {
    console.log('🔐 Ensuring test user 2 is authenticated...');
    
    // Check if user is already authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error checking user:', userError);
      return { success: false, message: 'Error checking user' };
    }
    
    if (user && user.email === TEST_EMAIL_2) {
      console.log('✅ Test user 2 already authenticated:', user.email);
      return { success: true, message: 'Test user 2 already authenticated', user };
    }
    
    console.log('🔐 Switching to test user 2...');
    
    // Sign out current user if different
    if (user && user.email !== TEST_EMAIL_2) {
      await supabase.auth.signOut();
    }
    
    // Try to sign in with test user 2 credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL_2,
      password: TEST_PASSWORD_2
    });
    
    if (signInError) {
      console.log('⚠️ Sign in failed, attempting to create test user 2...');
      
      // If sign in fails, try to create the test user 2
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: TEST_EMAIL_2,
        password: TEST_PASSWORD_2
      });
      
      if (signUpError) {
        console.error('❌ Error creating test user 2:', signUpError);
        return { success: false, message: 'Error creating test user 2' };
      }
      
      console.log('✅ Test user 2 created successfully');
      
      // Try to sign in again
      const { data: retrySignInData, error: retrySignInError } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL_2,
        password: TEST_PASSWORD_2
      });
      
      if (retrySignInError) {
        console.error('❌ Error signing in after user creation:', retrySignInError);
        return { success: false, message: 'Error signing in after user creation' };
      }
      
      console.log('✅ Test user 2 signed in successfully');
      return { success: true, message: 'Test user 2 created and signed in', user: retrySignInData.user };
      
    } else {
      console.log('✅ Test user 2 signed in successfully');
      return { success: true, message: 'Test user 2 signed in', user: signInData.user };
    }
    
  } catch (error) {
    console.error('❌ Error in ensureTestUser2Authenticated:', error);
    return { success: false, message: 'Unexpected error' };
  }
}

export function getTestCredentials() {
  return {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  };
}

export async function ensureAdminAuthenticated() {
  try {
    console.log('🔐 Ensuring admin user is authenticated...');
    
    // Check if user is already authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error checking user:', userError);
      return { success: false, message: 'Error checking user' };
    }
    
    if (user && user.email === ADMIN_EMAIL) {
      console.log('✅ Admin already authenticated:', user.email);
      return { success: true, message: 'Admin already authenticated', user };
    }
    
    console.log('🔐 Switching to admin account...');
    
    // Sign out current user if different
    if (user && user.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
    }
    
    // Try to sign in with admin credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (signInError) {
      console.error('❌ Error signing in as admin:', signInError);
      return { success: false, message: 'Error signing in as admin' };
    }
    
    console.log('✅ Admin signed in successfully');
    return { success: true, message: 'Admin signed in', user: signInData.user };
    
  } catch (error) {
    console.error('❌ Error in ensureAdminAuthenticated:', error);
    return { success: false, message: 'Unexpected error' };
  }
}

export function getTestCredentials2() {
  return {
    email: TEST_EMAIL_2,
    password: TEST_PASSWORD_2
  };
}

export function getAdminCredentials() {
  return {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  };
}
