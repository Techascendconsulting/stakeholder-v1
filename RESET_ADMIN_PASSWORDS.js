// Script to reset admin passwords via Supabase Auth API
// Run this in browser console or Node.js

const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';

// Admin emails to reset
const adminEmails = [
  'techascendconsulting@gmail.com',
  'obyj1st@gmail.com'
];

async function resetAdminPasswords() {
  for (const email of adminEmails) {
    try {
      // This will send a password reset email
      const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email: email,
          options: {
            emailRedirectTo: `${window.location.origin}/reset-password`
          }
        })
      });

      if (response.ok) {
        console.log(`Password reset email sent to ${email}`);
      } else {
        console.error(`Failed to send reset email to ${email}`);
      }
    } catch (error) {
      console.error(`Error resetting password for ${email}:`, error);
    }
  }
}

// Run the function
resetAdminPasswords();













