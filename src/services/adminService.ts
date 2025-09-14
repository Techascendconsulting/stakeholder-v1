import { supabase } from '../lib/supabase';

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: AdminPermissions;
  created_at: string;
  updated_at: string;
}

export interface AdminPermissions {
  user_management: boolean;
  device_unlock: boolean;
  system_settings: boolean;
  analytics: boolean;
  admin_management: boolean;
  audit_logs: boolean;
}

export interface UserAdminRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by?: string;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
  role: AdminRole;
}

export interface AdminActivityLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_user_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export class AdminService {
  /**
   * Check if user has a specific admin permission
   */
  async checkPermission(userId: string, permission: keyof AdminPermissions): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_admin_permission', {
        user_uuid: userId,
        permission_name: permission
      });

      if (error) {
        console.error('Error checking admin permission:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error checking admin permission:', error);
      return false;
    }
  }

  /**
   * Get all admin roles for a user
   */
  async getUserAdminRoles(userId: string): Promise<AdminRole[]> {
    try {
      // First try the RPC function
      const { data, error } = await supabase.rpc('get_user_admin_roles', {
        user_uuid: userId
      });

      if (error) {
        console.error('Error getting user admin roles via RPC:', error);
        
        // Fallback: Check user_profiles.is_admin and user_admin_roles
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('user_id', userId)
          .single();

        if (profileError) {
          console.error('Error getting user profile:', profileError);
          return [];
        }

        if (profile?.is_admin) {
          // Return a default super admin role
          return [{
            id: 'super_admin',
            name: 'super_admin',
            description: 'Super Administrator',
            permissions: {
              user_management: true,
              device_unlock: true,
              system_settings: true,
              analytics: true,
              admin_management: true,
              audit_logs: true
            },
            created_at: '',
            updated_at: ''
          }];
        }

        return [];
      }

      // Convert the RPC result to AdminRole format
      const roles: AdminRole[] = (data || []).map((item: any) => ({
        id: '', // We don't have the role ID from the RPC
        name: item.role_name,
        description: '',
        permissions: item.permissions,
        created_at: '',
        updated_at: ''
      }));

      return roles;
    } catch (error) {
      console.error('Error getting user admin roles:', error);
      return [];
    }
  }

  /**
   * Get all admin roles
   */
  async getAllAdminRoles(): Promise<AdminRole[]> {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error getting admin roles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting admin roles:', error);
      return [];
    }
  }

  /**
   * Assign admin role to user
   */
  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_admin_roles')
        .insert({
          user_id: userId,
          role_id: roleId,
          assigned_by: assignedBy
        });

      if (error) {
        console.error('Error assigning admin role:', error);
        return false;
      }

      // Log the action
      await this.logActivity(assignedBy, 'assign_role', userId, {
        role_id: roleId,
        action: 'role_assigned'
      });

      return true;
    } catch (error) {
      console.error('Error assigning admin role:', error);
      return false;
    }
  }

  /**
   * Remove admin role from user
   */
  async removeRole(userId: string, roleId: string, removedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_admin_roles')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('role_id', roleId);

      if (error) {
        console.error('Error removing admin role:', error);
        return false;
      }

      // Log the action
      await this.logActivity(removedBy, 'remove_role', userId, {
        role_id: roleId,
        action: 'role_removed'
      });

      return true;
    } catch (error) {
      console.error('Error removing admin role:', error);
      return false;
    }
  }

  /**
   * Get all users with admin roles
   */
  async getAdminUsers(): Promise<UserAdminRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_admin_roles')
        .select(`
          *,
          role:admin_roles(*)
        `)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (error) {
        console.error('Error getting admin users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting admin users:', error);
      return [];
    }
  }

  /**
   * Get admin activity logs
   */
  async getActivityLogs(limit: number = 50): Promise<AdminActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting activity logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting activity logs:', error);
      return [];
    }
  }

  /**
   * Log admin activity
   */
  async logActivity(
    adminUserId: string,
    action: string,
    targetUserId?: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_user_id: adminUserId,
          action,
          target_user_id: targetUserId,
          details,
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }

  /**
   * Get client IP address (simplified)
   */
  private async getClientIP(): Promise<string | null> {
    try {
      // This is a simplified approach - in production you'd get this from your backend
      return 'unknown';
    } catch {
      return null;
    }
  }

  /**
   * Check if user is any type of admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const roles = await this.getUserAdminRoles(userId);
      return roles.length > 0;
    } catch (error) {
      console.error('Error checking if user is admin:', error);
      return false;
    }
  }

  /**
   * Get user profile with admin status
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting user profile:', error);
        return null;
      }

      // Get admin roles
      const adminRoles = await this.getUserAdminRoles(userId);
      
      return {
        ...data,
        admin_roles: adminRoles
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
