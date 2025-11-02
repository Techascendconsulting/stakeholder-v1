import { supabase } from '../lib/supabase';
import { slackService } from './slackService';

export interface BuddyPair {
  id: string;
  user1_id: string;
  user2_id: string;
  slack_channel_id: string | null;
  status: 'pending' | 'confirmed';
  created_at: string;
  user1?: {
    id: string;
    email: string;
    name?: string;
  };
  user2?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

class BuddyService {
  // Get current user's buddy pair
  async getMyBuddy(userId: string): Promise<BuddyPair | null> {
    try {
      const { data, error } = await supabase
        .from('buddy_pairs')
        .select(`
          *,
          user1:user1_id(id, email),
          user2:user2_id(id, email)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching buddy:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getMyBuddy:', error);
      return null;
    }
  }

  // Search users by name or email
  async searchUsers(query: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data?.map(user => ({
        id: user.id,
        email: user.email,
        name: user.full_name || user.email.split('@')[0],
      })) || [];
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return [];
    }
  }

  // Send buddy invitation
  async sendInvitation(fromUserId: string, toUserId: string): Promise<boolean> {
    try {
      // Check if invitation already exists
      const { data: existing } = await supabase
        .from('buddy_pairs')
        .select('id')
        .or(`user1_id.eq.${fromUserId},user2_id.eq.${fromUserId}`)
        .or(`user1_id.eq.${toUserId},user2_id.eq.${toUserId}`)
        .single();

      if (existing) {
        throw new Error('Buddy invitation already exists');
      }

      // Create buddy pair with pending status
      const { error } = await supabase
        .from('buddy_pairs')
        .insert({
          user1_id: fromUserId,
          user2_id: toUserId,
          status: 'pending',
        });

      if (error) {
        console.error('Error creating buddy pair:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in sendInvitation:', error);
      return false;
    }
  }

  // Accept buddy invitation
  async acceptInvitation(buddyPairId: string, userId: string): Promise<boolean> {
    try {
      // Get the buddy pair
      const { data: buddyPair, error: fetchError } = await supabase
        .from('buddy_pairs')
        .select('*')
        .eq('id', buddyPairId)
        .single();

      if (fetchError || !buddyPair) {
        console.error('Error fetching buddy pair:', fetchError);
        return false;
      }

      // Verify user is part of this pair
      if (buddyPair.user1_id !== userId && buddyPair.user2_id !== userId) {
        throw new Error('User not authorized to accept this invitation');
      }

      // Get user details for Slack channel creation
      const { data: users } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', [buddyPair.user1_id, buddyPair.user2_id]);

      if (!users || users.length !== 2) {
        throw new Error('Could not find both users');
      }

      const user1 = users.find(u => u.id === buddyPair.user1_id);
      const user2 = users.find(u => u.id === buddyPair.user2_id);

      if (!user1 || !user2) {
        throw new Error('Could not find user details');
      }

      // Create Slack channel
      const slackChannel = await slackService.createBuddyChannel(
        user1.full_name || user1.email.split('@')[0],
        user2.full_name || user2.email.split('@')[0]
      );

      if (!slackChannel) {
        throw new Error('Failed to create Slack channel');
      }

      // Update buddy pair status and add Slack channel ID
      const { error: updateError } = await supabase
        .from('buddy_pairs')
        .update({
          status: 'confirmed',
          slack_channel_id: slackChannel.id,
        })
        .eq('id', buddyPairId);

      if (updateError) {
        console.error('Error updating buddy pair:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in acceptInvitation:', error);
      return false;
    }
  }

  // Reject buddy invitation
  async rejectInvitation(buddyPairId: string, userId: string): Promise<boolean> {
    try {
      // Verify user is part of this pair
      const { data: buddyPair } = await supabase
        .from('buddy_pairs')
        .select('user1_id, user2_id')
        .eq('id', buddyPairId)
        .single();

      if (!buddyPair || (buddyPair.user1_id !== userId && buddyPair.user2_id !== userId)) {
        throw new Error('User not authorized to reject this invitation');
      }

      // Delete the buddy pair
      const { error } = await supabase
        .from('buddy_pairs')
        .delete()
        .eq('id', buddyPairId);

      if (error) {
        console.error('Error deleting buddy pair:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in rejectInvitation:', error);
      return false;
    }
  }

  // Get pending invitations for user
  async getPendingInvitations(userId: string): Promise<BuddyPair[]> {
    try {
      const { data, error } = await supabase
        .from('buddy_pairs')
        .select(`
          *,
          user1:user1_id(id, email),
          user2:user2_id(id, email)
        `)
        .eq('status', 'pending')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      if (error) {
        console.error('Error fetching pending invitations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPendingInvitations:', error);
      return [];
    }
  }
}

export const buddyService = new BuddyService();
export default buddyService;
