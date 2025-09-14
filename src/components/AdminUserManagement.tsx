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
  EyeOff
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/adminService';
import { deviceLockService } from '../services/deviceLockService';
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

  useEffect(() => {
    if (hasPermission('user_management')) {
      loadUsers();
      loadCurrentUserRole();
    }
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
      // Get all users with their profiles
      // Get user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          display_name,
          created_at,
          locked,
          registered_device,
          is_admin
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error loading user profiles:', profilesError);
        return;
      }

      // Get user data with emails using database functions
      const { data: userData, error: userDataError } = await supabase
        .rpc('get_user_details_with_emails');
      
      if (userDataError) {
        console.error('Error loading user data:', userDataError);
        // Fallback to basic profiles data
        const formattedUsers = profiles?.map(item => ({
          id: item.user_id,
          email: `user_${item.user_id.substring(0, 8)}@unknown.com`,
          display_name: item.display_name || 'No name',
          created_at: item.created_at,
          last_sign_in_at: null,
          locked: item.locked,
          registered_device: item.registered_device,
          is_admin: item.is_admin
        })) || [];
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
    if (!confirm(`Are you sure you want to unlock ${email}?`)) {
      return;
    }

    try {
      setLoading(true);
      // Use the database function to unlock the user
      const { data, error } = await supabase.rpc('unlock_user_account', {
        user_uuid: userId
      });
      
      if (error) {
        console.error('Error unlocking user:', error);
        alert(`Failed to unlock ${email}: ${error.message}`);
        return;
      }
      
      const success = data;
      
      if (success) {
        // Log the action
        await adminService.logActivity(
          user?.id || '',
          'unlock_account',
          userId,
          { email, action: 'account_unlocked' }
        );
        
        // Refresh users
        loadUsers();
        alert(`Account unlocked successfully for ${email}`);
      } else {
        alert('Failed to unlock account');
      }
    } catch (error) {
      console.error('Error unlocking account:', error);
      alert('Error unlocking account');
    } finally {
      setLoading(false);
    }
  };

  const handleClearDeviceBinding = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to clear device binding for ${email}? They will need to register a new device on next login.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Clear the registered device
      const { error } = await supabase
        .from('user_profiles')
        .update({ registered_device: null })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Log the action
      await adminService.logActivity(
        user?.id || '',
        'clear_device_binding',
        userId,
        { email, action: 'device_binding_cleared' }
      );
      
      // Refresh users
      loadUsers();
      alert(`Device binding cleared for ${email}`);
    } catch (error) {
      console.error('Error clearing device binding:', error);
      alert('Error clearing device binding');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, email: string, isBlocked: boolean) => {
    const action = isBlocked ? 'unblock' : 'block';
    const confirmMessage = isBlocked 
      ? `Are you sure you want to unblock ${email}?`
      : `Are you sure you want to block ${email}? This will prevent them from accessing the system.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      
      // Update the blocked status
      const { error } = await supabase
        .from('user_profiles')
        .update({ blocked: !isBlocked })
        .eq('user_id', userId);

      if (error) {
        console.error(`Error ${action}ing user:`, error);
        alert(`Failed to ${action} user. Please try again.`);
        return;
      }

      // Log the action
      await adminService.logActivity(
        user?.id || '',
        'user_blocked',
        userId,
        { email, action: `user_${action}ed` }
      );

      alert(`User ${email} has been ${action}ed successfully.`);
      
      // Reload users to reflect changes
      await loadUsers();
      
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Failed to ${action} user. Please try again.`);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Users className="h-4 w-4" />
          <span>{loading ? 'Loading...' : 'Refresh'}</span>
        </button>
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Users ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
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
                      ? 'bg-gray-100 dark:bg-gray-600 border-l-4 border-gray-500' 
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
                      
                      {/* Action Buttons - Based on Three-Tier Hierarchy */}
                      {(() => {
                        const currentUserId = user?.id;
                        const isCurrentUser = targetUser.id === currentUserId;
                        
                        // Super Admin can manage everyone except themselves
                        if (currentUserRole.is_super_admin && !isCurrentUser) {
                          return (
                            <>
                              {/* Role Assignment Buttons */}
                              {!targetUser.is_super_admin && (
                                <button
                                  onClick={() => handleAssignRole(targetUser.id, targetUser.email, 'super_admin')}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                  title="Promote to Super Admin"
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  Make Super Admin
                                </button>
                              )}
                              
                              {!targetUser.is_senior_admin && !targetUser.is_super_admin && (
                                <button
                                  onClick={() => handleAssignRole(targetUser.id, targetUser.email, 'senior_admin')}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                  title="Promote to Senior Admin"
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  Make Senior Admin
                                </button>
                              )}
                              
                              {!targetUser.is_admin && !targetUser.is_senior_admin && !targetUser.is_super_admin && (
                                <button
                                  onClick={() => handleAssignRole(targetUser.id, targetUser.email, 'admin')}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                                  title="Promote to Regular Admin"
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  Make Admin
                                </button>
                              )}
                              
                              {/* Remove Admin Role */}
                              {(targetUser.is_admin || targetUser.is_senior_admin || targetUser.is_super_admin) && (
                                <button
                                  onClick={() => handleRemoveAdminRole(targetUser.id, targetUser.email)}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                  title="Remove Admin Role"
                                >
                                  <UserX className="h-3 w-3 mr-1" />
                                  Remove Admin
                                </button>
                              )}
                              
                              {/* Block/Unblock - Don't show for current user */}
                              {!isCurrentUser && (
                                <button
                                  onClick={() => handleBlockUser(targetUser.id, targetUser.email, targetUser.blocked || false)}
                                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${
                                    targetUser.blocked 
                                      ? 'bg-green-600 hover:bg-green-700' 
                                      : 'bg-red-600 hover:bg-red-700'
                                  }`}
                                  title={targetUser.blocked ? "Unblock User" : "Block User"}
                                >
                                  {targetUser.blocked ? (
                                    <>
                                      <UserCheck className="h-3 w-3 mr-1" />
                                      Unblock
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="h-3 w-3 mr-1" />
                                      Block
                                    </>
                                  )}
                                </button>
                              )}
                            </>
                          );
                        }
                        
                        // Senior Admin can manage Regular Admins and Students
                        if (currentUserRole.is_senior_admin && !isCurrentUser && !targetUser.is_super_admin && !targetUser.is_senior_admin) {
                          return (
                            <>
                              {/* Promote to Regular Admin */}
                              {!targetUser.is_admin && (
                                <button
                                  onClick={() => handleAssignRole(targetUser.id, targetUser.email, 'admin')}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                                  title="Promote to Regular Admin"
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  Make Admin
                                </button>
                              )}
                              
                              {/* Remove Admin Role */}
                              {targetUser.is_admin && (
                                <button
                                  onClick={() => handleRemoveAdminRole(targetUser.id, targetUser.email)}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                  title="Remove Admin Role"
                                >
                                  <UserX className="h-3 w-3 mr-1" />
                                  Remove Admin
                                </button>
                              )}
                              
                              {/* Block/Unblock - Don't show for current user */}
                              {!isCurrentUser && (
                                <button
                                  onClick={() => handleBlockUser(targetUser.id, targetUser.email, targetUser.blocked || false)}
                                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${
                                    targetUser.blocked 
                                      ? 'bg-green-600 hover:bg-green-700' 
                                      : 'bg-red-600 hover:bg-red-700'
                                  }`}
                                  title={targetUser.blocked ? "Unblock User" : "Block User"}
                                >
                                  {targetUser.blocked ? (
                                    <>
                                      <UserCheck className="h-3 w-3 mr-1" />
                                      Unblock
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="h-3 w-3 mr-1" />
                                      Block
                                    </>
                                  )}
                                </button>
                              )}
                            </>
                          );
                        }
                        
                        // Regular Admin can only manage Students
                        if (currentUserRole.is_admin && !isCurrentUser && !targetUser.is_admin && !targetUser.is_senior_admin && !targetUser.is_super_admin) {
                          return (
                            <>
                              {/* Block/Unblock Students */}
                              <button
                                onClick={() => handleBlockUser(targetUser.id, targetUser.email, targetUser.blocked || false)}
                                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${
                                  targetUser.blocked 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-red-600 hover:bg-red-700'
                                }`}
                                title={targetUser.blocked ? "Unblock User" : "Block User"}
                              >
                                {targetUser.blocked ? (
                                  <>
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Unblock
                                  </>
                                ) : (
                                  <>
                                    <UserX className="h-3 w-3 mr-1" />
                                    Block
                                  </>
                                )}
                              </button>
                            </>
                          );
                        }
                        
                        // Show status for users that can't be managed
                        if (isCurrentUser || 
                            (targetUser.is_super_admin && !currentUserRole.is_super_admin) ||
                            (targetUser.is_senior_admin && !currentUserRole.is_super_admin)) {
                          return (
                            <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-gray-400">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {isCurrentUser ? 'Your Account' : 
                               targetUser.is_super_admin ? 'Super Admin' :
                               targetUser.is_senior_admin ? 'Senior Admin' : 'No Actions'}
                            </span>
                          );
                        }
                        
                        return null;
                      })()}
                      
                      {/* Student Actions (for all admin levels) */}
                      {!targetUser.is_admin && !targetUser.is_senior_admin && !targetUser.is_super_admin && (
                        // Student user actions
                        <>
                          {targetUser.locked && (
                            <button
                              onClick={() => handleUnlockUser(targetUser.id, targetUser.email)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                              title="Unlock Account"
                            >
                              <Unlock className="h-3 w-3 mr-1" />
                              Unlock
                            </button>
                          )}
                          
                          {targetUser.registered_device && (
                            <button
                              onClick={() => handleClearDeviceBinding(targetUser.id, targetUser.email)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
                              title="Clear Device Binding"
                            >
                              <EyeOff className="h-3 w-3 mr-1" />
                              Clear Device
                            </button>
                          )}
                          
                          {!isCurrentUser && (
                            <button
                              onClick={() => handleBlockUser(targetUser.id, targetUser.email, targetUser.blocked || false)}
                              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${
                                targetUser.blocked 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-red-600 hover:bg-red-700'
                              }`}
                              title={targetUser.blocked ? "Unblock User" : "Block User"}
                            >
                              {targetUser.blocked ? (
                                <>
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Unblock
                                </>
                              ) : (
                                <>
                                  <UserX className="h-3 w-3 mr-1" />
                                  Block
                                </>
                              )}
                            </button>
                          )}
                          
                          {!targetUser.locked && !targetUser.registered_device && !targetUser.blocked && (
                            <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-gray-400">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Active
                            </span>
                          )}
                        </>
                      )}
                      
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
                      
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminUserManagement;