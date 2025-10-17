import { supabase } from '../lib/supabase';

export interface AdminInvite {
  id: string;
  email: string;
  invited_by: string;
  role: 'admin' | 'senior_admin' | 'super_admin';
  token: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

export interface CreateInviteRequest {
  email: string;
  role: 'admin' | 'senior_admin' | 'super_admin';
}

class AdminInviteService {
  /**
   * Create an admin invitation
   */
  async createInvite(inviteData: CreateInviteRequest, inviterId: string): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_admin_invite', {
        invite_email: inviteData.email,
        inviter_id: inviterId,
        admin_role: inviteData.role
      });

      if (error) {
        console.error('Error creating admin invite:', error);
        throw new Error('Failed to create admin invitation');
      }

      return data;
    } catch (error) {
      console.error('Error in createInvite:', error);
      throw error;
    }
  }

  /**
   * Get all pending invitations
   */
  async getPendingInvites(): Promise<AdminInvite[]> {
    try {
      const { data, error } = await supabase
        .from('admin_invites')
        .select('*')
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending invites:', error);
        throw new Error('Failed to fetch pending invitations');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPendingInvites:', error);
      throw error;
    }
  }

  /**
   * Cancel an invitation
   */
  async cancelInvite(inviteId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', inviteId);

      if (error) {
        console.error('Error canceling invite:', error);
        throw new Error('Failed to cancel invitation');
      }

      return true;
    } catch (error) {
      console.error('Error in cancelInvite:', error);
      throw error;
    }
  }

  /**
   * Use an invitation token (called during signup)
   */
  async useInvite(token: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('use_admin_invite', {
        invite_token: token,
        user_id: userId
      });

      if (error) {
        console.error('Error using invite:', error);
        throw new Error('Failed to use invitation');
      }

      return data;
    } catch (error) {
      console.error('Error in useInvite:', error);
      throw error;
    }
  }

  /**
   * Send invitation email (placeholder - you'll need to implement email service)
   */
  async sendInviteEmail(email: string, role: string, token: string): Promise<boolean> {
    // TODO: Implement email service
    // For now, just log the invitation details
    console.log('Admin invitation details:', {
      email,
      role,
      inviteLink: `${window.location.origin}/signup?invite=${token}`,
      expiresIn: '7 days'
    });

    // In a real implementation, you would:
    // 1. Send email with invitation link
    // 2. Include role information
    // 3. Include expiration date
    // 4. Include instructions for signup

    return true;
  }

  /**
   * Get invitation by token
   */
  async getInviteByToken(token: string): Promise<AdminInvite | null> {
    try {
      const { data, error } = await supabase
        .from('admin_invites')
        .select('*')
        .eq('token', token)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No invitation found
        }
        console.error('Error fetching invite by token:', error);
        throw new Error('Failed to fetch invitation');
      }

      return data;
    } catch (error) {
      console.error('Error in getInviteByToken:', error);
      throw error;
    }
  }
}

export const adminInviteService = new AdminInviteService();







