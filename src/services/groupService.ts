import { supabase } from '../lib/supabase';
import { slackService } from './slackService';

export interface Group {
  id: string;
  name: string;
  type: 'cohort' | 'graduate' | 'mentor' | 'custom';
  slack_channel_id: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  members?: GroupMember[];
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role?: 'member' | 'admin';
  joined_at: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

class GroupService {
  // Get user's groups
  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups (
            id,
            name,
            type,
            slack_channel_id,
            start_date,
            end_date,
            created_at
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user groups:', error);
        return [];
      }

      return data?.map(item => item.groups).filter(Boolean) || [];
    } catch (error) {
      console.error('Error in getUserGroups:', error);
      return [];
    }
  }

  // Get group members
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          user:user_id(id, email)
        `)
        .eq('group_id', groupId);

      if (error) {
        console.error('Error fetching group members:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getGroupMembers:', error);
      return [];
    }
  }

  // Create new group (admin only)
  async createGroup(
    name: string,
    type: 'cohort' | 'graduate' | 'mentor' | 'custom',
    startDate?: string,
    endDate?: string
  ): Promise<Group | null> {
    try {
      // Identify creator (if available)
      const { data: authData } = await supabase.auth.getUser();
      const createdBy = authData?.user?.id ?? null;

      // Create Slack channel (if token configured)
      const token = import.meta.env.VITE_SLACK_BOT_TOKEN;
      const slackChannel = token ? await slackService.createGroupChannel(name, type) : null;
      
      // Create group in database
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name,
          type,
          slack_channel_id: slackChannel?.id || null,
          start_date: startDate || null,
          end_date: endDate || null,
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating group:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createGroup:', error);
      return null;
    }
  }

  // Backfill: create Slack channel for existing group and save ID
  async ensureSlackChannelForGroup(groupId: string, name: string, type: Group['type']): Promise<string | null> {
    try {
      const token = import.meta.env.VITE_SLACK_BOT_TOKEN;
      if (!token) {
        console.warn('Slack token not configured; cannot create channel');
        return null;
      }

      const channel = await slackService.createGroupChannel(name, type);
      if (!channel?.id) return null;

      const { error } = await supabase
        .from('groups')
        .update({ slack_channel_id: channel.id })
        .eq('id', groupId);

      if (error) {
        console.error('Failed to save slack_channel_id:', error);
        return null;
      }

      return channel.id;
    } catch (e) {
      console.error('Error ensuring Slack channel for group:', e);
      return null;
    }
  }

  // Add member to group
  async addMemberToGroup(groupId: string, userId: string, _role: 'member' | 'admin' = 'member'): Promise<boolean> {
    try {
      // Add to database
      const { error: dbError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
        });

      if (dbError) {
        console.error('Error adding member to group:', dbError);
        return false;
      }

      // Add to Slack channel if it exists
      const { data: group } = await supabase
        .from('groups')
        .select('slack_channel_id')
        .eq('id', groupId)
        .single();

      if (group?.slack_channel_id) {
        // Note: In production, you'd need to get the user's Slack ID
        // For now, we'll just log this requirement
        console.log(`TODO: Add user ${userId} to Slack channel ${group.slack_channel_id}`);
      }

      return true;
    } catch (error) {
      console.error('Error in addMemberToGroup:', error);
      return false;
    }
  }

  // Remove member from group
  async removeMemberFromGroup(groupId: string, userId: string): Promise<boolean> {
    try {
      // Remove from database
      const { error: dbError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (dbError) {
        console.error('Error removing member from group:', dbError);
        return false;
      }

      // Remove from Slack channel if it exists
      const { data: group } = await supabase
        .from('groups')
        .select('slack_channel_id')
        .eq('id', groupId)
        .single();

      if (group?.slack_channel_id) {
        // Note: In production, you'd need to get the user's Slack ID
        console.log(`TODO: Remove user ${userId} from Slack channel ${group.slack_channel_id}`);
      }

      return true;
    } catch (error) {
      console.error('Error in removeMemberFromGroup:', error);
      return false;
    }
  }

  // Get all groups (admin only)
  async getAllGroups(): Promise<Group[]> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          members:group_members(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all groups:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllGroups:', error);
      return [];
    }
  }

  // Archive group (admin only)
  async archiveGroup(groupId: string): Promise<boolean> {
    try {
      // In a real implementation, you might want to add an 'archived' field
      // For now, we'll just delete the group
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) {
        console.error('Error archiving group:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in archiveGroup:', error);
      return false;
    }
  }

  // Search users for adding to groups
  async searchUsers(query: string): Promise<Array<{ id: string; email: string; name?: string }>> {
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
}

export const groupService = new GroupService();
export default groupService;
