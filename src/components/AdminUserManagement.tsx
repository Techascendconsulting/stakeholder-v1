import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Unlock, 
  Lock, 
  Shield, 
  UserCheck, 
  UserX, 
  Mail, 
  AlertCircle,
  CheckCircle,
  EyeOff,
  Key,
  LogIn
} from 'lucide-react';
import ActionDropdown from './ui/ActionDropdown';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/adminService';
import { deviceLockService } from '../services/deviceLockService';
import { adminInviteService } from '../services/adminInviteService';
import AdminCreateUserModal from './AdminCreateUserModal';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  last_sign_in_at?: string;
  locked?: boolean;
  registered_device?: string;
  is_admin?: boolean;
  is_super_admin?: boolean;
  is_senior_admin?: boolean;
  blocked?: boolean;
  user_type?: 'new' | 'existing';
  subscription_tier?: 'free' | 'premium' | 'enterprise';
  max_projects?: number;
  subscription_status?: string;
}

const AdminUserManagement: React.FC = () => {
  const { hasPermission } = useAdmin();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const lockedCount = users.filter(u => !!u.locked).length;
  const [loading, setLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<{
    is_super_admin: boolean;
    is_senior_admin: boolean;
    is_admin: boolean;
  }>({ is_super_admin: false, is_senior_admin: false, is_admin: false });
  
  // Admin invite states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'senior_admin' | 'super_admin'>('admin');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  
  // Unlock/Reset Device modal states
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showResetDeviceModal, setShowResetDeviceModal] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<{ id: string; email: string } | null>(null);
  const [deviceComparison, setDeviceComparison] = useState<any>(null);
  const [verifyingDevice, setVerifyingDevice] = useState(false);
  
  // Block/Unblock modal states
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [resendingWelcomeFor, setResendingWelcomeFor] = useState<string | null>(null);
  const [welcomeModal, setWelcomeModal] = useState<{ email: string; resetLink: string; emailSent: boolean } | null>(null);
  
  // Reset Password modal states
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (hasPermission('user_management')) {
      loadUsers();
      loadCurrentUserRole();
    }
  }, [hasPermission]);

  // Refresh data when component becomes visible (e.g., when admin switches tabs)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && hasPermission('user_management')) {
        console.log('🔄 AdminUserManagement - Page became visible, refreshing user data');
        await loadUsers();
      }
    };

    // Listen for custom refresh event from AdminDashboard
    const handleCustomRefresh = async () => {
      if (hasPermission('user_management')) {
        console.log('🔄 AdminUserManagement - Custom refresh event received, refreshing user data');
        await loadUsers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('adminUserManagementRefresh', handleCustomRefresh);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('adminUserManagementRefresh', handleCustomRefresh);
    };
  }, [hasPermission]);


  const loadCurrentUserRole = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_super_admin, is_senior_admin, is_admin')
        .eq('user_id', user.id)
        .single();
      
      if (data && !error) {
        setCurrentUserRole({
          is_super_admin: data.is_super_admin || false,
          is_senior_admin: data.is_senior_admin || false,
          is_admin: data.is_admin || false
        });
      }
    } catch (error) {
      console.error('Error loading current user role:', error);
    }
  };

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Try to get user data with emails using database functions first
      const { data: userData, error: userDataError } = await supabase
        .rpc('get_user_details_with_emails');
      
      if (userDataError) {
        console.error('Error loading user data with emails:', userDataError);
        console.log('Falling back to manual join...');
        
        // Fallback: Get user profiles and auth users separately
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select(`
            user_id,
            display_name,
            created_at,
            locked,
            registered_device,
            is_admin,
            is_super_admin,
            is_senior_admin,
            blocked,
            user_type,
            subscription_tier,
            max_projects,
            subscription_status
          `)
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Error loading user profiles:', profilesError);
          return;
        }

        // Skip auth.users query (not accessible) and use profiles only
        // Since auth users are not accessible, use profiles only
        console.error('Auth users not accessible, using profiles only');
        // Use profiles without emails
        const formattedUsers = profiles?.map((item: any) => ({
            id: item.user_id,
            email: `user_${item.user_id.substring(0, 8)}@unknown.com`,
            display_name: item.display_name || 'No name',
            created_at: item.created_at,
            last_sign_in_at: null,
            locked: item.locked,
            registered_device: item.registered_device,
            is_admin: item.is_admin,
            is_super_admin: item.is_super_admin,
            is_senior_admin: item.is_senior_admin,
            blocked: item.blocked,
            user_type: item.user_type,
            subscription_tier: item.subscription_tier,
            max_projects: item.max_projects,
            subscription_status: item.subscription_status
          })) || [];
        setUsers(formattedUsers);
        return;
      }

      let formattedUsers = (userData as any[]) || [];
      // If RPC doesn't include locked/registered_device, merge from user_profiles
      const needsMerge = formattedUsers.some(u => typeof u.locked === 'undefined' || typeof u.registered_device === 'undefined');
      if (needsMerge) {
        try {
          const userIds = formattedUsers.map((u: any) => u.id).filter(Boolean);
          const { data: profiles } = await supabase
            .from('user_profiles')
            .select('user_id, locked, registered_device')
            .in('user_id', userIds);
          const map = new Map<string, { locked?: boolean; registered_device?: string | null }>();
          (profiles || []).forEach((p: any) => map.set(p.user_id, { locked: p.locked, registered_device: p.registered_device }));
          formattedUsers = formattedUsers.map(u => ({
            ...u,
            locked: typeof u.locked === 'undefined' ? map.get(u.id)?.locked ?? false : u.locked,
            registered_device: typeof u.registered_device === 'undefined' ? map.get(u.id)?.registered_device ?? null : u.registered_device,
          }));
        } catch (e) {
          console.warn('Admin merge fallback failed; showing RPC data only');
        }
      }

      setUsers(formattedUsers as any);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockUser = async (userId: string, email: string) => {
    setSelectedUserForAction({ id: userId, email });
    setShowUnlockModal(true);
    setVerifyingDevice(true);
    
    // Get device comparison data
    const comparison = await deviceLockService.compareDevicesForAdmin(userId);
    setDeviceComparison(comparison);
    setVerifyingDevice(false);
  };

  const confirmUnlockUser = async (resetDevice: boolean) => {
    if (!selectedUserForAction) return;

    try {
      setLoading(true);
      
      console.log('🔓 Calling admin_unlock_user RPC:', { 
        targetUserId: selectedUserForAction.id, 
        resetDevice 
      });
      
      // Use secure server-side RPC function to bypass RLS
      const { data, error } = await supabase.rpc('admin_unlock_user', {
        p_target_user_id: selectedUserForAction.id,
        p_reset_device: resetDevice
      });

      console.log('🔓 RPC result:', { data, error });

      if (error) {
        console.error('❌ Error unlocking user (RPC):', error);
        alert(`Failed to unlock user: ${error.message}`);
        return;
      }

      if (data && !data.success) {
        console.error('❌ Unlock failed:', data.error);
        alert(`Failed to unlock user: ${data.error}`);
        return;
      }

      console.log('✅ User unlocked successfully:', data);

      // Log the action
      console.log('🔍 Logging unlock account action...');
      try {
        await adminService.logActivity(
          user?.id || '',
          'unlock_account',
          selectedUserForAction.id,
          { 
            email: selectedUserForAction.email, 
            action: resetDevice ? 'account_unlocked_and_device_reset' : 'account_unlocked_same_device',
            device_reset: resetDevice,
            similarity: deviceComparison?.similarity || 0,
            recommendation: deviceComparison?.recommendation || 'manual'
          }
        );
        console.log('✅ Activity logged successfully');
      } catch (logError) {
        console.error('❌ Failed to log activity:', logError);
      }
      
      // Refresh users
      loadUsers();
      setShowUnlockModal(false);
      setSelectedUserForAction(null);
      setDeviceComparison(null);
    } catch (error) {
      console.error('Error unlocking account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearDeviceBinding = async (userId: string, email: string) => {
    setSelectedUserForAction({ id: userId, email });
    setShowResetDeviceModal(true);
  };

  const confirmResetDevice = async () => {
    if (!selectedUserForAction) return;

    try {
      setLoading(true);
      
      // Clear the registered device (Step 1: Admin Action)
      const { error } = await supabase
        .from('user_profiles')
        .update({ registered_device: null })
        .eq('user_id', selectedUserForAction.id);

      if (error) {
        throw error;
      }

      // Send email notification to student (Step 1: Email Notification)
      // TODO: Implement sendDeviceResetNotification in EmailService
      console.log('📧 Device reset - email notification temporarily disabled');
      const emailSent = false;
      // const emailSent = await EmailService.sendDeviceResetNotification(selectedUserForAction.email);

      // Log the action
      console.log('🔍 Logging clear device binding action...');
      try {
        await adminService.logActivity(
          user?.id || '',
          'clear_device_binding',
          selectedUserForAction.id,
          { 
            email: selectedUserForAction.email, 
            action: 'device_binding_cleared',
            email_notification_sent: emailSent
          }
        );
        console.log('✅ Activity logged successfully');
      } catch (logError) {
        console.error('❌ Failed to log activity:', logError);
      }
      
      // Refresh users
      loadUsers();
      setShowResetDeviceModal(false);
      setSelectedUserForAction(null);
    } catch (error) {
      console.error('Error clearing device binding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, email: string, isBlocked: boolean) => {
    setSelectedUserForAction({ id: userId, email });
    if (isBlocked) {
      setShowUnblockModal(true);
    } else {
      setBlockReason('');
      setShowBlockModal(true);
    }
  };

  const confirmBlockUser = async () => {
    if (!selectedUserForAction || !blockReason.trim()) return;

    try {
      setLoading(true);
      
      // Call database function to block with reason
      const { error } = await supabase.rpc('block_user', {
        target_user_id: selectedUserForAction.id,
        reason: blockReason.trim()
      });

      if (error) {
        console.error('Error blocking user:', error);
        return;
      }

      // Log the action with reason
      await adminService.logActivity(
        user?.id || '',
        'user_blocked',
        selectedUserForAction.id,
        { email: selectedUserForAction.email, reason: blockReason.trim(), action: 'blocked', success: true }
      );

      await loadUsers();
      setShowBlockModal(false);
      setSelectedUserForAction(null);
      setBlockReason('');
      
    } catch (error) {
      console.error('Error blocking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmUnblockUserAction = async () => {
    if (!selectedUserForAction) return;

    try {
      setLoading(true);
      
      // Call database function to unblock
      const { error } = await supabase.rpc('unblock_user', {
        target_user_id: selectedUserForAction.id
      });

      if (error) {
        console.error('Error unblocking user:', error);
        return;
      }

      // Log the action
      await adminService.logActivity(
        user?.id || '',
        'user_unblocked',
        selectedUserForAction.id,
        { email: selectedUserForAction.email, action: 'unblocked', success: true }
      );

      await loadUsers();
      setShowUnblockModal(false);
      setSelectedUserForAction(null);
      
    } catch (error) {
      console.error('Error unblocking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId: string, email: string, role: 'admin' | 'senior_admin' | 'super_admin') => {
    const roleNames = {
      admin: 'Regular Admin',
      senior_admin: 'Senior Admin', 
      super_admin: 'Super Admin'
    };

    if (!confirm(`Are you sure you want to promote ${email} to ${roleNames[role]}?`)) {
      return;
    }

    try {
      setLoading(true);
      
      let updateData: any = {};
      
      switch (role) {
        case 'admin':
          updateData = { is_admin: true, is_senior_admin: false, is_super_admin: false };
          break;
        case 'senior_admin':
          updateData = { is_admin: true, is_senior_admin: true, is_super_admin: false };
          break;
        case 'super_admin':
          updateData = { is_admin: true, is_senior_admin: true, is_super_admin: true };
          break;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        console.error('Error assigning role:', error);
        alert('Failed to assign role. Please try again.');
        return;
      }

      // Log the action
      await adminService.logActivity(
        user?.id || '',
        'role_assigned',
        userId,
        { email, action: `promoted_to_${role}` }
      );

      alert(`${email} has been promoted to ${roleNames[role]}.`);
      
      // Reload users to reflect changes
      await loadUsers();
      
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Failed to assign role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdminRole = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove admin privileges from ${email}? They will become a regular student.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Remove all admin roles
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_admin: false, is_senior_admin: false, is_super_admin: false })
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing admin role:', error);
        alert('Failed to remove admin role. Please try again.');
        return;
      }

      // Also remove from user_admin_roles table if it exists
      await supabase
        .from('user_admin_roles')
        .delete()
        .eq('user_id', userId);

      // Log the action
      await adminService.logActivity(
        user?.id || '',
        'admin_role_removed',
        userId,
        { email, action: 'admin_role_removed' }
      );

      alert(`Admin privileges removed from ${email}. They are now a regular student.`);
      
      // Reload users to reflect changes
      await loadUsers();
      
    } catch (error) {
      console.error('Error removing admin role:', error);
      alert('Failed to remove admin role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeSubscription = async (userId: string, email: string, tier: 'free' | 'premium' | 'enterprise') => {
    const tierLimits = {
      free: 1,
      premium: 5,
      enterprise: 999
    };
    
    const maxProjects = tierLimits[tier];
    
    if (!confirm(`Upgrade ${email} to ${tier.toUpperCase()} tier (${maxProjects === 999 ? 'Unlimited' : maxProjects} projects)?`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          subscription_tier: tier,
          max_projects: maxProjects,
          subscription_status: 'active',
          subscription_started_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error upgrading subscription:', error);
        alert('Failed to upgrade subscription. Please try again.');
        return;
      }
      
      alert(`✅ ${email} upgraded to ${tier.toUpperCase()} tier!`);
      await loadUsers();
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      alert('Failed to upgrade subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteAdmin = async () => {
    if (!inviteEmail || !inviteRole) {
      alert('Please enter email and select role');
      return;
    }

    if (!user?.id) {
      alert('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      // Create the invitation
      const token = await adminInviteService.createInvite(
        { email: inviteEmail, role: inviteRole },
        user.id
      );

      // Send invitation email (placeholder)
      await adminInviteService.sendInviteEmail(inviteEmail, inviteRole, token);

      // Log the action
      await adminService.logActivity(
        user.id,
        'invite_admin',
        undefined,
        { email: inviteEmail, role: inviteRole, action: 'admin_invited' }
      );

      alert(`Admin invitation sent to ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('admin');
    } catch (error) {
      console.error('Error inviting admin:', error);
      alert('Failed to send admin invitation');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleAdminResetPassword = async (_userId: string, email: string) => {
    setSelectedUserForAction({ id: _userId, email });
    setShowResetPasswordModal(true);
    setResetPasswordSuccess(false);
    setResetPasswordError(null);
  };

  const confirmResetPassword = async () => {
    if (!selectedUserForAction) return;

    try {
      setResetPasswordLoading(true);
      setResetPasswordError(null);
      setResetPasswordSuccess(false);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { email: selectedUserForAction.email },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (error || !data?.success) {
        setResetPasswordError(error?.message || data?.error || 'Unknown error');
      } else {
        setResetPasswordSuccess(true);
        
        // Log the action
        await adminService.logActivity(
          user?.id || '',
          'admin_reset_password',
          selectedUserForAction.id,
          { email: selectedUserForAction.email, action: 'password_reset_email_sent', success: true }
        );
      }
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      setResetPasswordError(error.message || 'Unknown error');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleAdminLoginAsUser = async (userId: string, email: string) => {
    if (!confirm(`Login as ${email}? This will create a 2-hour impersonation session.`)) {
      return;
    }

    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const { data, error } = await supabase.functions.invoke('admin-login-as-user', {
        body: { targetUserId: userId },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (error || !data?.success || !data?.access_token) {
        alert(`Failed to create impersonation session: ${error?.message || data?.error || 'Unknown error'}`);
        return;
      }

      // Set the session with the impersonated user's tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token || ''
      });

      if (sessionError) {
        alert(`Failed to set impersonation session: ${sessionError.message}`);
        return;
      }

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Error creating impersonation session:', error);
      alert(`Failed to create impersonation session: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };


  // Helper function to build actions array for a user
  const buildUserActions = (targetUser: User) => {
    const currentUserId = user?.id;
    const isCurrentUser = targetUser.id === currentUserId;
    const actions: Array<{label: string, onClick: () => void, className: string, icon: React.ReactNode, variant?: string}> = [];
    

    // Super Admin can manage everyone except themselves
    if (currentUserRole.is_super_admin && !isCurrentUser) {
      if (!targetUser.is_super_admin) {
        actions.push({
          label: 'Promote to Super Admin',
          onClick: () => handleAssignRole(targetUser.id, targetUser.email, 'super_admin'),
          className: 'inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors',
          icon: <Shield className="h-3 w-3 mr-1" />
        });
      }
      
      if (!targetUser.is_senior_admin && !targetUser.is_super_admin) {
        actions.push({
          label: 'Promote to Senior Admin',
          onClick: () => handleAssignRole(targetUser.id, targetUser.email, 'senior_admin'),
          className: 'inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors',
          icon: <Shield className="h-3 w-3 mr-1" />
        });
      }
      
      if (!targetUser.is_admin && !targetUser.is_senior_admin && !targetUser.is_super_admin) {
        actions.push({
          label: 'Promote to Admin',
          onClick: () => handleAssignRole(targetUser.id, targetUser.email, 'admin'),
          className: 'inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors',
          icon: <Shield className="h-3 w-3 mr-1" />
        });
      }
      
      if (targetUser.is_admin || targetUser.is_senior_admin || targetUser.is_super_admin) {
        actions.push({
          label: 'Remove Admin Role',
          onClick: () => handleRemoveAdminRole(targetUser.id, targetUser.email),
          className: 'inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors',
          icon: <UserX className="h-3 w-3 mr-1" />
        });
      }
      
      if (!isCurrentUser) {
        actions.push({
          label: targetUser.blocked ? 'Unblock User' : 'Block User',
          onClick: () => handleBlockUser(targetUser.id, targetUser.email, targetUser.blocked || false),
          className: `inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${
            targetUser.blocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`,
          icon: targetUser.blocked ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />
        });
      }
    }
    
    // Senior Admin can manage Regular Admins and Students
    else if (currentUserRole.is_senior_admin && !isCurrentUser && !targetUser.is_super_admin && !targetUser.is_senior_admin) {
      if (!targetUser.is_admin) {
        actions.push({
          label: 'Promote to Admin',
          onClick: () => handleAssignRole(targetUser.id, targetUser.email, 'admin'),
          className: 'inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors',
          icon: <Shield className="h-3 w-3 mr-1" />
        });
      }
      
      if (targetUser.is_admin) {
        actions.push({
          label: 'Remove Admin Role',
          onClick: () => handleRemoveAdminRole(targetUser.id, targetUser.email),
          className: 'inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors',
          icon: <UserX className="h-3 w-3 mr-1" />
        });
      }
      
      if (!isCurrentUser) {
        actions.push({
          label: targetUser.blocked ? 'Unblock User' : 'Block User',
          onClick: () => handleBlockUser(targetUser.id, targetUser.email, targetUser.blocked || false),
          className: `inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${
            targetUser.blocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`,
          icon: targetUser.blocked ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />
        });
      }
    }
    
    // Regular Admin can only manage Students
    else if (currentUserRole.is_admin && !isCurrentUser && !targetUser.is_admin && !targetUser.is_senior_admin && !targetUser.is_super_admin) {
      actions.push({
        label: targetUser.blocked ? 'Unblock User' : 'Block User',
        onClick: () => handleBlockUser(targetUser.id, targetUser.email, targetUser.blocked || false),
        className: `inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${
          targetUser.blocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
        }`,
        icon: targetUser.blocked ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />
      });
    }
    
    // Student actions (for all admin levels) - add these for any student user
    if (!targetUser.is_admin && !targetUser.is_senior_admin && !targetUser.is_super_admin) {
      // Resend welcome email (password reset link)
      actions.push({
        label: resendingWelcomeFor === targetUser.id ? 'Sending…' : 'Resend Welcome Email',
        onClick: async () => {
          try {
            setResendingWelcomeFor(targetUser.id);
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            const { data, error } = await supabase.functions.invoke('resend-welcome', {
              body: { email: targetUser.email, name: targetUser.display_name },
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (error || !data?.success) {
              setWelcomeModal({ email: targetUser.email, resetLink: '', emailSent: false });
            } else {
              setWelcomeModal({ email: targetUser.email, resetLink: data.resetLink || '', emailSent: !!data.emailSent });
            }
          } catch (e) {
            setWelcomeModal({ email: targetUser.email, resetLink: '', emailSent: false });
          } finally {
            setResendingWelcomeFor(null);
          }
        },
        className: 'inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors',
        icon: <Mail className="h-3 w-3 mr-1" />
      });
      if (targetUser.locked) {
        actions.push({
          label: 'Unlock Account',
          onClick: () => handleUnlockUser(targetUser.id, targetUser.email),
          className: 'inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors',
          icon: <Unlock className="h-3 w-3 mr-1" />,
          variant: 'success' as const
        });
      }
      
      // Only show Reset Device if account is NOT locked (for legitimate device changes)
      // If locked, use "Unlock Account" which handles both
      if (targetUser.registered_device && !targetUser.locked) {
        actions.push({
          label: 'Reset Device',
          onClick: () => handleClearDeviceBinding(targetUser.id, targetUser.email),
          className: 'inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors',
          icon: <EyeOff className="h-3 w-3 mr-1" />,
          variant: 'warning' as const
        });
      }
    }
    
    // Add "Reset Password" button for all users (admin-only)
    if (!isCurrentUser && (currentUserRole.is_admin || currentUserRole.is_senior_admin || currentUserRole.is_super_admin)) {
      actions.push({
        label: 'Reset Password',
        onClick: () => handleAdminResetPassword(targetUser.id, targetUser.email),
        className: 'inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors',
        icon: <Key className="h-3 w-3 mr-1" />
      });
    }
    
    // Add "Login as User" button for admins (except for higher-level admins)
    if (!isCurrentUser && 
        (currentUserRole.is_super_admin || currentUserRole.is_senior_admin || currentUserRole.is_admin) &&
        !(targetUser.is_super_admin && !currentUserRole.is_super_admin) &&
        !(targetUser.is_senior_admin && !currentUserRole.is_super_admin)) {
      actions.push({
        label: 'Login as User',
        onClick: () => handleAdminLoginAsUser(targetUser.id, targetUser.email),
        className: 'inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors',
        icon: <LogIn className="h-3 w-3 mr-1" />
      });
    }
    
    return actions;
  };

  // Helper function to render action buttons or dropdown
  const renderActions = (actions: Array<{label: string, onClick: () => void, className: string, icon: React.ReactNode, variant?: 'default' | 'danger' | 'warning' | 'success'}>, _userId: string) => {
    if (actions.length <= 3) {
      // Show individual buttons
      return (
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={action.className}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      );
    } else {
      // Show modern dropdown
      const dropdownActions = actions.map(action => ({
        label: action.label,
        onClick: action.onClick,
        icon: action.icon,
        variant: (action.variant || 'default') as 'default' | 'danger' | 'warning' | 'success'
      }));

      return (
        <ActionDropdown 
          actions={dropdownActions}
          triggerLabel="Actions"
        />
      );
    }
  };

  const getStatusBadge = (user: User) => {
    // ⚠️ CRITICAL: Check locked status FIRST, before admin roles
    // A locked admin should show as "Locked", not "Admin"
    if (user.locked) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          <Lock className="w-3 h-3 mr-1" />
          Locked
        </span>
      );
    }
    
    if (user.blocked) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <UserX className="w-3 h-3 mr-1" />
          Blocked
        </span>
      );
    }
    
    if (user.is_super_admin) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <Shield className="w-3 h-3 mr-1" />
          Super Admin
        </span>
      );
    }
    
    if (user.is_senior_admin) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <Shield className="w-3 h-3 mr-1" />
          Senior Admin
        </span>
      );
    }
    
    if (user.is_admin) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    );
  };

  if (!hasPermission('user_management')) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700 dark:text-red-300">
            You don't have permission to manage users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {welcomeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Welcome Email</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{welcomeModal.email}</p>
            {welcomeModal.emailSent ? (
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">Email sent successfully.</p>
            ) : (
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">Email not sent. You can copy the reset link below and send manually.</p>
            )}
            {welcomeModal.resetLink && (
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3 mb-4">
                <p className="text-xs break-all text-gray-800 dark:text-gray-200">{welcomeModal.resetLink}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              {welcomeModal.resetLink && (
                <button
                  onClick={() => navigator.clipboard.writeText(welcomeModal.resetLink)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Copy Link
                </button>
              )}
              <button
                onClick={() => setWelcomeModal(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          User Management
        </h2>
        <div className="flex space-x-3">
          {/* Create User Button - visible for Admin/Senior/Super */}
          {(currentUserRole.is_admin || currentUserRole.is_senior_admin || currentUserRole.is_super_admin) && (
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <UserCheck className="h-4 w-4" />
              <span>Create User</span>
            </button>
          )}
          {/* Invite Admin Button - Only for Super Admin and Senior Admin */}
          {(currentUserRole.is_super_admin || currentUserRole.is_senior_admin) && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Mail className="h-4 w-4" />
              <span>Invite Admin</span>
            </button>
          )}
          <button
            onClick={() => {
              console.log('Refresh button clicked');
              loadUsers();
            }}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Users className="h-4 w-4" />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search users by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Users ({filteredUsers.length})
          </h3>
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              <Lock className="w-3 h-3 mr-1" /> Locked: {lockedCount}
            </span>
          </div>
        </div>
        
        <div>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map(targetUser => (
                <React.Fragment key={targetUser.id}>
                  <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    targetUser.id === user?.id 
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500' 
                      : ''
                  }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {targetUser.display_name || 'No name'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {targetUser.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(targetUser)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {targetUser.last_sign_in_at 
                      ? formatDate(targetUser.last_sign_in_at)
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setExpandedUser(expandedUser === targetUser.id ? null : targetUser.id);
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
                        title="Toggle Details"
                      >
                        {expandedUser === targetUser.id ? (
                          <>
                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Hide Details
                          </>
                        ) : (
                          <>
                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Show Details
                          </>
                        )}
                      </button>
                      
                      {/* Action Buttons - Smart Dropdown Logic */}
                      {(() => {
                        const currentUserId = user?.id;
                        const isCurrentUser = targetUser.id === currentUserId;
                        
                        // Show status for users that can't be managed
                        if (isCurrentUser) {
                          return (
                            <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-md dark:bg-blue-900 dark:text-blue-200">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              You
                            </span>
                          );
                        }
                        
                        if ((targetUser.is_super_admin && !currentUserRole.is_super_admin) ||
                            (targetUser.is_senior_admin && !currentUserRole.is_super_admin)) {
                          return (
                            <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-gray-400">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              {targetUser.is_super_admin ? 'Super Admin' : 'Senior Admin'}
                            </span>
                          );
                        }
                        
                        // Build actions array and render with smart dropdown logic
                        const actions = buildUserActions(targetUser);
                        return renderActions(actions as Array<{label: string, onClick: () => void, className: string, icon: React.ReactNode, variant?: 'default' | 'danger' | 'warning' | 'success'}>, targetUser.id);
                      })()}
                      
                    </div>
                  </td>
                </tr>
                
                {/* Expanded Details Row */}
                {expandedUser === targetUser.id && (
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <td colSpan={4} className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <p className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-600 p-2 rounded border">{targetUser.email}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                            <p className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-600 p-2 rounded border">{targetUser.display_name || 'Not set'}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Type</label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              targetUser.is_super_admin 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : targetUser.is_senior_admin
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : targetUser.is_admin 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {targetUser.is_super_admin ? 'Super Admin' :
                               targetUser.is_senior_admin ? 'Senior Admin' :
                               targetUser.is_admin ? 'Admin' : 'Student'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Created</label>
                            <p className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-600 p-2 rounded border">{formatDate(targetUser.created_at)}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Sign In</label>
                            <p className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-600 p-2 rounded border">
                              {targetUser.last_sign_in_at ? formatDate(targetUser.last_sign_in_at) : 'Never signed in'}
                            </p>
                          </div>
                          
                          {targetUser.registered_device && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registered Device</label>
                              <p className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-600 p-2 rounded border break-all font-mono">{targetUser.registered_device}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Subscription Management Section */}
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Subscription Management</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Tier</label>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold ${
                                targetUser.subscription_tier === 'enterprise' 
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  : targetUser.subscription_tier === 'premium'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}>
                                {(targetUser.subscription_tier || 'free').toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                ({targetUser.max_projects === 999 ? 'Unlimited' : targetUser.max_projects || 1} projects)
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upgrade Tier</label>
                            <div className="flex space-x-2">
                              {targetUser.subscription_tier !== 'free' && (
                                <button
                                  onClick={() => handleUpgradeSubscription(targetUser.id, targetUser.email, 'free')}
                                  className="px-3 py-1.5 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                  Free
                                </button>
                              )}
                              {targetUser.subscription_tier !== 'premium' && (
                                <button
                                  onClick={() => handleUpgradeSubscription(targetUser.id, targetUser.email, 'premium')}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Premium
                                </button>
                              )}
                              {targetUser.subscription_tier !== 'enterprise' && (
                                <button
                                  onClick={() => handleUpgradeSubscription(targetUser.id, targetUser.email, 'enterprise')}
                                  className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                  Enterprise
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unlock Account Modal with Device Verification */}
      {showUnlockModal && selectedUserForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Unlock className="w-5 h-5 mr-2 text-green-600" />
              Unlock Account - Device Verification
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">User to unlock:</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">{selectedUserForAction.email}</p>
              </div>
              
              {/* Device Verification Results */}
              {verifyingDevice ? (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verifying device...</p>
                </div>
              ) : deviceComparison ? (
                <>
                  {/* System Recommendation */}
                  <div className={`p-4 rounded-lg border ${
                    deviceComparison.recommendation === 'unlock_only' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                      : deviceComparison.recommendation === 'reset_device'
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                  }`}>
                    <p className="text-sm font-bold mb-2 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      System Analysis: {deviceComparison.similarity}% Match
                    </p>
                    <p className={`text-sm ${
                      deviceComparison.recommendation === 'unlock_only'
                        ? 'text-green-800 dark:text-green-200'
                        : deviceComparison.recommendation === 'reset_device'
                        ? 'text-orange-800 dark:text-orange-200'
                        : 'text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {deviceComparison.explanation}
                    </p>
                  </div>

                  {/* Device Comparison - Side by Side */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Registered Device */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Original Device (Registered)
                      </p>
                      {deviceComparison.registeredDeviceInfo ? (
                        <div className="space-y-2 text-xs">
                          <div>
                            <p className="text-blue-600 dark:text-blue-400">Platform:</p>
                            <p className="font-mono text-blue-900 dark:text-blue-100">{deviceComparison.registeredDeviceInfo.platform}</p>
                          </div>
                          <div>
                            <p className="text-blue-600 dark:text-blue-400">CPU Cores:</p>
                            <p className="font-mono text-blue-900 dark:text-blue-100">{deviceComparison.registeredDeviceInfo.cores}</p>
                          </div>
                          <div>
                            <p className="text-blue-600 dark:text-blue-400">GPU:</p>
                            <p className="font-mono text-blue-900 dark:text-blue-100">{deviceComparison.registeredDeviceInfo.gpu}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-blue-600 dark:text-blue-400">No device registered</p>
                      )}
                    </div>

                    {/* Current Device */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                      <p className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-3 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Current Device (Attempting Login)
                      </p>
                      {deviceComparison.currentDeviceInfo ? (
                        <div className="space-y-2 text-xs">
                          <div>
                            <p className="text-purple-600 dark:text-purple-400">Platform:</p>
                            <p className="font-mono text-purple-900 dark:text-purple-100">{deviceComparison.currentDeviceInfo.platform}</p>
                          </div>
                          <div>
                            <p className="text-purple-600 dark:text-purple-400">CPU Cores:</p>
                            <p className="font-mono text-purple-900 dark:text-purple-100">{deviceComparison.currentDeviceInfo.cores}</p>
                          </div>
                          <div>
                            <p className="text-purple-600 dark:text-purple-400">GPU:</p>
                            <p className="font-mono text-purple-900 dark:text-purple-100">{deviceComparison.currentDeviceInfo.gpu}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-purple-600 dark:text-purple-400">Unable to detect</p>
                      )}
                    </div>
                  </div>

                  {/* Warning about device changes */}
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                    <p className="text-sm text-red-900 dark:text-red-100 font-medium mb-2">Device Change Policy:</p>
                    <ul className="text-xs text-red-800 dark:text-red-200 space-y-1">
                      <li>• Device changes should be RARE (new laptop, lost device, etc.)</li>
                      <li>• Frequent device changes (&gt;2 per year) indicate account sharing</li>
                      <li>• User will be warned this is a ONE-TIME courtesy</li>
                      <li>• Future violations may result in permanent termination</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unable to verify device</p>
                </div>
              )}
            </div>
            
            {/* Action Buttons with Explanations */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Option 1: Unlock Only (Same Device) */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600">
                  <div className="flex items-start space-x-2 mb-3">
                    <Unlock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Option 1: Unlock Account Only</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        • Account is unlocked<br/>
                        • Device binding stays the same<br/>
                        • User logs back in on their registered device<br/>
                        • Use when: Same device, different browser
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => confirmUnlockUser(false)}
                    disabled={loading || verifyingDevice}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>{loading ? 'Processing...' : 'Unlock Only'}</span>
                  </button>
                </div>

                {/* Option 2: Unlock + Reset Device */}
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600">
                  <div className="flex items-start space-x-2 mb-3">
                    <EyeOff className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-orange-900 dark:text-orange-100">Option 2: Unlock + Reset Device</p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                        • Account is unlocked<br/>
                        • Device binding is cleared<br/>
                        • User can register a new device<br/>
                        • Use when: Legitimate device change
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => confirmUnlockUser(true)}
                    disabled={loading || verifyingDevice}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all"
                  >
                    <EyeOff className="w-4 h-4" />
                    <span>{loading ? 'Processing...' : 'Unlock + Reset'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowUnlockModal(false);
                    setSelectedUserForAction(null);
                    setDeviceComparison(null);
                  }}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Device Modal */}
      {showResetDeviceModal && selectedUserForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <EyeOff className="w-5 h-5 mr-2 text-orange-600" />
              Reset Device Binding
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">User:</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">{selectedUserForAction.email}</p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                <p className="text-sm text-orange-900 dark:text-orange-100 font-medium mb-2">What happens:</p>
                <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                  <li>• Clears registered device from database</li>
                  <li>• User can login from ANY device</li>
                  <li>• First device they login with becomes new registered device</li>
                  <li>• Old device will be blocked</li>
                  <li>• Email notification sent (if configured)</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                <p className="text-sm text-red-900 dark:text-red-100 font-medium">Warning: This is permanent!</p>
                <p className="text-xs text-red-800 dark:text-red-200 mt-1">Use only for legitimate device changes (new laptop, stolen device, etc.)</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowResetDeviceModal(false);
                  setSelectedUserForAction(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmResetDevice}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <EyeOff className="w-4 h-4" />
                <span>{loading ? 'Resetting...' : 'Reset Device'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {showBlockModal && selectedUserForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <UserX className="w-5 h-5 mr-2 text-red-600" />
              Block User
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">User to block:</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">{selectedUserForAction.email}</p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                <p className="text-sm text-red-900 dark:text-red-100 font-medium mb-2">This will:</p>
                <ul className="text-xs text-red-800 dark:text-red-200 space-y-1">
                  <li>• Sign them out immediately if logged in</li>
                  <li>• Prevent all future login attempts</li>
                  <li>• Block all API and database access</li>
                  <li>• Display blocked account message on login</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for blocking (required):
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g., Policy violation, Account sharing, Terms of Service breach..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedUserForAction(null);
                  setBlockReason('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmBlockUser}
                disabled={loading || !blockReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <UserX className="w-4 h-4" />
                <span>{loading ? 'Blocking...' : 'Block User'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unblock User Modal */}
      {showUnblockModal && selectedUserForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-green-600" />
              Unblock User
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">User to unblock:</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">{selectedUserForAction.email}</p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-sm text-green-900 dark:text-green-100 font-medium mb-2">This will:</p>
                <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                  <li>• Restore full platform access</li>
                  <li>• Allow them to login immediately</li>
                  <li>• Enable all API and database access</li>
                  <li>• Remove blocked account restrictions</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUnblockModal(false);
                  setSelectedUserForAction(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmUnblockUserAction}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>{loading ? 'Unblocking...' : 'Unblock User'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Admin Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Invite Admin
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Admin Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'senior_admin' | 'super_admin')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {currentUserRole.is_super_admin && (
                    <option value="super_admin">Super Admin</option>
                  )}
                  {(currentUserRole.is_super_admin || currentUserRole.is_senior_admin) && (
                    <option value="senior_admin">Senior Admin</option>
                  )}
                  <option value="admin">Regular Admin</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteRole('admin');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteAdmin}
                disabled={loading || !inviteEmail}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <AdminCreateUserModal
          onClose={() => setShowCreateUserModal(false)}
          onUserCreated={() => loadUsers()}
        />
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUserForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2 text-blue-600" />
              Reset Password
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">User:</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">{selectedUserForAction.email}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-2">This will:</p>
                <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>• Send a password reset email to {selectedUserForAction.email}</li>
                  <li>• The reset link will expire in 2 hours</li>
                  <li>• The user can set a new password using the link</li>
                  <li>• The user's current session (if any) will remain active</li>
                </ul>
              </div>

              {resetPasswordSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">Password reset email sent successfully!</p>
                      <p className="text-xs text-green-800 dark:text-green-200 mt-1">
                        The user will receive an email with instructions to reset their password.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {resetPasswordError && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">Failed to send password reset email</p>
                      <p className="text-xs text-red-800 dark:text-red-200 mt-1">
                        {resetPasswordError}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setSelectedUserForAction(null);
                  setResetPasswordSuccess(false);
                  setResetPasswordError(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                disabled={resetPasswordLoading}
              >
                {resetPasswordSuccess ? 'Close' : 'Cancel'}
              </button>
              {!resetPasswordSuccess && (
                <button
                  onClick={confirmResetPassword}
                  disabled={resetPasswordLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 transition-colors"
                >
                  {resetPasswordLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Send Reset Email</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
















