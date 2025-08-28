import { supabase } from './supabase';

export async function setupTestUser() {
  try {
    console.log('🔧 Setting up test user...');
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('🔐 No authenticated user found. Please log in first.');
      return { success: false, message: 'User not authenticated' };
    }
    
    console.log('✅ User authenticated:', user.email);
    
    // Check if spaces exist
    const { data: spaces, error: spacesError } = await supabase
      .from('spaces')
      .select('*')
      .limit(1);
    
    if (spacesError) {
      console.error('❌ Error checking spaces:', spacesError);
      return { success: false, message: 'Error checking spaces' };
    }
    
    if (!spaces || spaces.length === 0) {
      console.log('⚠️ No spaces found. Creating test space...');
      
      // Create a test space
      const { data: newSpace, error: createSpaceError } = await supabase
        .from('spaces')
        .insert({
          name: 'Test Space',
          description: 'A test space for development',
          created_by: user.id
        })
        .select()
        .single();
      
      if (createSpaceError) {
        console.error('❌ Error creating space:', createSpaceError);
        return { success: false, message: 'Error creating space' };
      }
      
      console.log('✅ Created test space:', newSpace.id);
      
      // Add user to space as owner
      const { error: spaceMemberError } = await supabase
        .from('space_members')
        .insert({
          space_id: newSpace.id,
          user_id: user.id,
          role: 'owner'
        });
      
      if (spaceMemberError) {
        console.error('❌ Error adding user to space:', spaceMemberError);
        return { success: false, message: 'Error adding user to space' };
      }
      
      console.log('✅ Added user to space as owner');
      
      // Create a test channel
      const { data: newChannel, error: createChannelError } = await supabase
        .from('channels')
        .insert({
          space_id: newSpace.id,
          name: 'general',
          description: 'General discussion',
          is_private: false,
          is_staff_only: false
        })
        .select()
        .single();
      
      if (createChannelError) {
        console.error('❌ Error creating channel:', createChannelError);
        return { success: false, message: 'Error creating channel' };
      }
      
      console.log('✅ Created test channel:', newChannel.id);
      
      // Add user to channel
      const { error: channelMemberError } = await supabase
        .from('channel_members')
        .insert({
          channel_id: newChannel.id,
          user_id: user.id
        });
      
      if (channelMemberError) {
        console.error('❌ Error adding user to channel:', channelMemberError);
        return { success: false, message: 'Error adding user to channel' };
      }
      
      console.log('✅ Added user to channel');
      
      return { 
        success: true, 
        message: 'Test setup complete',
        spaceId: newSpace.id,
        channelId: newChannel.id
      };
      
    } else {
      console.log('✅ Spaces exist:', spaces.length);
      
      // Check if user is a member of any space
      const { data: spaceMembers, error: membersError } = await supabase
        .from('space_members')
        .select('space_id')
        .eq('user_id', user.id);
      
      if (membersError) {
        console.error('❌ Error checking space members:', membersError);
        return { success: false, message: 'Error checking space members' };
      }
      
      if (!spaceMembers || spaceMembers.length === 0) {
        console.log('⚠️ User not a member of any space. Adding to first space...');
        
        const firstSpace = spaces[0];
        
        // Add user to the first space
        const { error: addMemberError } = await supabase
          .from('space_members')
          .insert({
            space_id: firstSpace.id,
            user_id: user.id,
            role: 'student'
          });
        
        if (addMemberError) {
          console.error('❌ Error adding user to space:', addMemberError);
          return { success: false, message: 'Error adding user to space' };
        }
        
        console.log('✅ Added user to space');
        
        // Check if there are channels in this space
        const { data: channels, error: channelsError } = await supabase
          .from('channels')
          .select('*')
          .eq('space_id', firstSpace.id);
        
        if (channelsError) {
          console.error('❌ Error checking channels:', channelsError);
          return { success: false, message: 'Error checking channels' };
        }
        
        if (channels && channels.length > 0) {
          // Add user to the first channel
          const { error: addChannelMemberError } = await supabase
            .from('channel_members')
            .insert({
              channel_id: channels[0].id,
              user_id: user.id
            });
          
          if (addChannelMemberError) {
            console.error('❌ Error adding user to channel:', addChannelMemberError);
            return { success: false, message: 'Error adding user to channel' };
          }
          
          console.log('✅ Added user to channel');
        }
      }
      
      return { 
        success: true, 
        message: 'User setup complete',
        spaceId: spaces[0].id
      };
    }
    
  } catch (error) {
    console.error('❌ Error in setupTestUser:', error);
    return { success: false, message: 'Unexpected error' };
  }
}
