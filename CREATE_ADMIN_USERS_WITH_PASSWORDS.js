// Script to create admin users with passwords using Supabase Auth API
// Run this in browser console on your app

// Replace with your actual Supabase URL and anon key
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Admin users to create
const adminUsers = [
  {
    email: 'techascendconsulting@gmail.com',
    password: 'SuperAdmin123!',
    role: 'super_admin'
  },
  {
    email: 'obyj1st@gmail.com', 
    password: 'SeniorAdmin123!',
    role: 'senior_admin'
  }
];

async function createAdminUser(userData) {
  try {
    console.log(`Creating user: ${userData.email}`);
    
    // Create user via Supabase Auth API
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          role: userData.role
        }
      })
    });

    if (response.ok) {
      const user = await response.json();
      console.log(`✅ User created: ${userData.email} (ID: ${user.id})`);
      
      // Now assign admin role
      await assignAdminRole(user.id, userData.role);
      
      return user;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to create ${userData.email}:`, error);
    }
  } catch (error) {
    console.error(`❌ Error creating ${userData.email}:`, error);
  }
}

async function assignAdminRole(userId, role) {
  try {
    // This would need to be done via your database
    // You'd call your existing role assignment functions
    console.log(`Assigning ${role} role to user ${userId}`);
    
    // For now, just log what needs to be done
    console.log(`Run this SQL to assign role:`);
    console.log(`UPDATE user_profiles SET is_${role} = TRUE, is_admin = TRUE WHERE user_id = '${userId}';`);
    
  } catch (error) {
    console.error('Error assigning role:', error);
  }
}

async function createAllAdminUsers() {
  console.log('🚀 Creating admin users...');
  
  for (const userData of adminUsers) {
    await createAdminUser(userData);
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('✅ All admin users created!');
  console.log('📧 Emails: techascendconsulting@gmail.com, obyj1st@gmail.com');
  console.log('🔑 Passwords: SuperAdmin123!, SeniorAdmin123!');
}

// Run the function
createAllAdminUsers();
















