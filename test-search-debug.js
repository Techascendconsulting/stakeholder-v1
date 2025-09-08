import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ckppwcsnkbrgekxtwccq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrcHB3Y3Nua2JyZ2VreHR3Y2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODU0NDgsImV4cCI6MjA2NzY2MTQ0OH0.ki1ybDPuBnwBLvvdiuRPLT42nqAtGMuZSGQvpFf5Ctg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearchWithAdmin() {
  console.log('🔍 Testing search with admin account...');
  
  // First, sign in as admin
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'admin@batraining.com',
    password: 'Enterprise2024!'
  });
  
  if (signInError) {
    console.error('❌ Error signing in as admin:', signInError);
    return;
  }
  
  console.log('✅ Signed in as admin:', signInData.user.email);
  
  // Check what messages exist
  console.log('📝 Checking all messages...');
  const { data: allMessages, error: allMessagesError } = await supabase
    .from('messages')
    .select('*')
    .limit(10);
  
  if (allMessagesError) {
    console.error('❌ Error fetching messages:', allMessagesError);
    return;
  }
  
  console.log('📝 Total messages found:', allMessages.length);
  console.log('📝 Sample messages:', allMessages.map(m => ({ id: m.id, body: m.body?.substring(0, 50), channel_id: m.channel_id })));
  
  // Test search with different queries
  const searchQueries = ['hello', 'hi', 'everyone', 'welcome', 'whats', 'send'];
  
  for (const query of searchQueries) {
    console.log(`🔍 Searching for: "${query}"`);
    
    const { data: searchResults, error: searchError } = await supabase
      .from('messages')
      .select('*')
      .ilike('body', `%${query}%`)
      .limit(5);
    
    if (searchError) {
      console.error(`❌ Search error for "${query}":`, searchError);
    } else {
      console.log(`✅ Found ${searchResults.length} results for "${query}"`);
      if (searchResults.length > 0) {
        console.log(`📝 Sample result:`, searchResults[0].body);
      }
    }
  }
  
  // Check channels
  console.log('📋 Checking channels...');
  const { data: channels, error: channelsError } = await supabase
    .from('channels')
    .select('*');
  
  if (channelsError) {
    console.error('❌ Error fetching channels:', channelsError);
  } else {
    console.log('📋 Channels found:', channels.length);
    console.log('📋 Channel names:', channels.map(c => c.name));
  }
}

testSearchWithAdmin();




