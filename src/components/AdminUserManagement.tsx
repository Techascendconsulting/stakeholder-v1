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
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  MoreVertical
} from 'lucide-react';
import ActionDropdown from './ui/ActionDropdown';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/adminService';
import { deviceLockService } from '../services/deviceLockService';
import EmailService from '../services/emailService';
import { adminInviteService } from '../services/adminInviteService';
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
        const authUsers = null;
        const authError = { message: 'Auth users not accessible' };

        if (authError) {
          console.error('Error loading auth users:', authError);
          // Use profiles without emails
          const formattedUsers = profiles?.map(item => ({
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

        // Join profiles with auth users
        const formattedUsers = profiles?.map(profile => {
          const authUser = authUsers?.find(au => au.id === profile.user_id);
          return {
            id: profile.user_id,
            email: authUser?.email || `user_${profile.user_id.substring(0, 8)}@unknown.com`,
            display_name: profile.display_name || 'No name',
            created_at: profile.created_at,
            last_sign_in_at: authUser?.last_sign_in_at || null,
            locked: profile.locked,
            registered_device: profile.registered_device,
            is_admin: profile.is_admin,
            is_super_admin: profile.is_super_admin,
            is_senior_admin: profile.is_senior_admin,
            blocked: profile.blocked,
            user_type: profile.user_type,
            subscription_tier: profile.subscription_tier,
            max_projects: profile.max_projects,
            subscription_status: profile.subscription_status
          };
        }) || [];
        setUsers(formattedUsers);
        return;
      }

      const formattedUsers = userData || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to unlock ${email}? This will allow them to log in but they will still need to use their registered device.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Only unlock the account, keep device lock active
      const { error } = await supabase
        .from('user_profiles')
        .update({ locked: false })
        .eq('user_id', userId);

      if (error) {
        console.error('Error unlocking user:', error);
        alert(`Failed to unlock ${email}: ${error.message}`);
        return;
      }

      // Log the action
      console.log('🔍 Logging unlock account action...');
      try {
        await adminService.logActivity(
          user?.id || '',
          'unlock_account',
          userId,
          { email, action: 'account_unlocked' }
        );
        console.log('✅ Activity logged successfully');
      } catch (logError) {
        console.error('❌ Failed to log activity:', logError);
      }
      
      // Refresh users
      loadUsers();
      alert(`Account unlocked successfully for ${email}. They can now log in but must use their registered device.`);
    } catch (error) {
      console.error('Error unlocking account:', error);
      alert('Error unlocking account');
    } finally {
      setLoading(false);
    }
  };

  const handleClearDeviceBinding = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to reset the device access for ${email}? They will receive an email notification and need to login to register their new device.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Clear the registered device (Step 1: Admin Action)
      const { error } = await supabase
        .from('user_profiles')
        .update({ registered_device: null })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Send email notification to student (Step 1: Email Notification)
      // TODO: Implement sendDeviceResetNotification in EmailService
      console.log('📧 Device reset - email notification temporarily disabled');
      // const emailSent = await EmailService.sendDeviceResetNotification(email);
      // if (!emailSent) {
      //   console.warn('⚠️ Failed to send email notification, but device binding was cleared');
      // }

      // Log the action
      console.log('🔍 Logging clear device binding action...');
      try {
        await adminService.logActivity(
          user?.id || '',
          'clear_device_binding',
          userId,
          { 
            email, 
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
      
      const message = emailSent 
        ? `Device access reset for ${email}. They have been notified via email and can login to register their new device.`
        : `Device access reset for ${email}. Please notify them manually as the email notification failed.`;
      
      alert(message);
    } catch (error) {
      console.error('Error clearing device binding:', error);
      alert('Error clearing device binding');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, email: string, isBlocked: boolean) => {
    if (isBlocked) {
      // Unblocking - simple confirmation
      if (!confirm(`✅ Unblock ${email}?\n\nThey will regain full access to the platform.`)) {
        return;
      }
      
      try {
        setLoading(true);
        
        // Call database function to unblock
        const { error } = await supabase.rpc('unblock_user', {
          target_user_id: userId
        });

        if (error) {
          console.error('Error unblocking user:', error);
          alert(`Failed to unblock user. ${error.message || 'Please try again.'}`);
          return;
        }

        // Log the action
        await adminService.logActivity(
          user?.id || '',
          'user_unblocked',
          userId,
          { email, action: 'unblocked', success: true }
        );

        alert(`✅ User ${email} has been unblocked successfully.`);
        await loadUsers();
        
      } catch (error) {
        console.error('Error unblocking user:', error);
        alert('Failed to unblock user. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Blocking - ask for reason
      const reason = prompt(
        `🚫 Block ${email}?\n\nThis will:\n• Sign them out immediately\n• Prevent all login attempts\n• Block all API/database access\n• Show them a blocked account message\n\nEnter reason for blocking (required):`,
        'Policy violation'
      );
      
      if (!reason || !reason.trim()) {
        alert('Block cancelled - reason is required');
        return;
      }
      
      try {
        setLoading(true);
        
        // Call database function to block with reason
        const { error } = await supabase.rpc('block_user', {
          target_user_id: userId,
          reason: reason.trim()
        });

        if (error) {
          console.error('Error blocking user:', error);
          alert(`Failed to block user. ${error.message || 'Please try again.'}`);
          return;
        }

        // Log the action with reason
        await adminService.logActivity(
          user?.id || '',
          'user_blocked',
          userId,
          { email, reason: reason.trim(), action: 'blocked', success: true }
        );

        alert(`🚫 User ${email} has been blocked.\n\nReason: ${reason}\n\nThey will be signed out immediately if currently logged in.`);
        await loadUsers();
        
      } catch (error) {
        console.error('Error blocking user:', error);
        alert('Failed to block user. Please try again.');
      } finally {
        setLoading(false);
      }
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
        null,
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
      if (targetUser.locked) {
        actions.push({
          label: 'Unlock Account',
          onClick: () => handleUnlockUser(targetUser.id, targetUser.email),
          className: 'inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors',
          icon: <Unlock className="h-3 w-3 mr-1" />,
          variant: 'success'
        });
      }
      
      if (targetUser.registered_device) {
        actions.push({
          label: 'Reset Device',
          onClick: () => handleClearDeviceBinding(targetUser.id, targetUser.email),
          className: 'inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors',
          icon: <EyeOff className="h-3 w-3 mr-1" />,
          variant: 'warning'
        });
      }
    }
    
    return actions;
  };

  // Helper function to render action buttons or dropdown
  const renderActions = (actions: Array<{label: string, onClick: () => void, className: string, icon: React.ReactNode, variant?: string}>, userId: string) => {
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
        variant: action.variant || 'default'
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
    
    if (user.locked) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          <Lock className="w-3 h-3 mr-1" />
          Locked
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          User Management
        </h2>
        <div className="flex space-x-3">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-visible">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Users ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto overflow-y-visible">
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
                        return renderActions(actions, targetUser.id);
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
    </div>
  );
};

export default AdminUserManagement;













