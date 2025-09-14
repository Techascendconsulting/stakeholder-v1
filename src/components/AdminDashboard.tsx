import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Unlock, 
  BarChart3, 
  Settings, 
  Activity,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import { adminService, UserAdminRole, AdminActivityLog } from '../services/adminService';
import { deviceLockService } from '../services/deviceLockService';
import { supabase } from '../lib/supabase';
import AdminUserManagement from './AdminUserManagement';

const AdminDashboard: React.FC = () => {
  const { isAdmin, isLoading, hasPermission } = useAdmin();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'activity'>('overview');
  const [adminUsers, setAdminUsers] = useState<UserAdminRole[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    lockedAccounts: 0,
    activeSessions: 0,
    adminUsers: 0
  });

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Refresh activity logs when switching to activity tab
  useEffect(() => {
    if (activeTab === 'activity' && hasPermission('audit_logs')) {
      loadActivityLogs();
    }
  }, [activeTab]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      if (hasPermission('admin_management')) {
        const users = await adminService.getAdminUsers();
        setAdminUsers(users);
      }
      
      if (hasPermission('audit_logs')) {
        const logs = await adminService.getActivityLogs(20);
        setActivityLogs(logs);
      }
      
      // Load system statistics
      await loadSystemStats();
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      if (hasPermission('audit_logs')) {
        const logs = await adminService.getActivityLogs(20);
        setActivityLogs(logs);
      }
    } catch (error) {
      console.error('Error loading activity logs:', error);
    }
  };

  const loadSystemStats = async () => {
    try {
      // Get all users with their details
      const { data: users, error } = await supabase.rpc('get_user_details_with_emails');
      
      if (error) {
        console.error('Error loading system stats:', error);
        return;
      }

      const totalUsers = users.length;
      const lockedAccounts = users.filter(u => u.locked).length;
      const adminUsers = users.filter(u => u.is_admin || u.is_senior_admin || u.is_super_admin).length;
      
      // For active sessions, we'll use a simple approximation
      // In a real system, you'd track actual sessions
      const activeSessions = users.filter(u => u.last_sign_in_at && 
        new Date(u.last_sign_in_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      ).length;

      setSystemStats({
        totalUsers,
        lockedAccounts,
        activeSessions,
        adminUsers
      });
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const handleUnlockUser = async (userId: string, email: string) => {
    try {
      const success = await deviceLockService.unlockAccount(userId);
      if (success) {
        // Log the action
        await adminService.logActivity(
          user?.id || '',
          'unlock_account',
          userId,
          { email, action: 'account_unlocked' }
        );
        
        // Refresh data
        loadAdminData();
        alert(`Account unlocked successfully for ${email}`);
      } else {
        alert('Failed to unlock account');
      }
    } catch (error) {
      console.error('Error unlocking account:', error);
      alert('Error unlocking account');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading admin dashboard...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-8 w-8 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Access Denied
          </h2>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-700 dark:text-red-300">
            You don't have admin privileges to access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, permission: null },
    { id: 'users', label: 'User Management', icon: Users, permission: 'user_management' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'analytics' },
    { id: 'activity', label: 'Activity Logs', icon: Activity, permission: 'audit_logs' }
  ].filter(tab => !tab.permission || hasPermission(tab.permission as keyof any));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage users, roles, device locks, and system access
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                System Overview
              </h2>
              <button
                onClick={loadSystemStats}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <Clock className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-900">{systemStats.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-red-600">Locked Accounts</p>
                    <p className="text-2xl font-bold text-red-900">{systemStats.lockedAccounts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Active Sessions</p>
                    <p className="text-2xl font-bold text-green-900">{systemStats.activeSessions}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Admin Users</p>
                    <p className="text-2xl font-bold text-purple-900">{systemStats.adminUsers}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && hasPermission('user_management') && (
          <AdminUserManagement />
        )}


        {activeTab === 'analytics' && hasPermission('analytics') && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Analytics
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">
                Analytics dashboard will be implemented here.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'activity' && hasPermission('audit_logs') && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Activity Logs
            </h2>
            
            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
              {activityLogs.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                  <p className="text-gray-600 dark:text-gray-400">No activity logs found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Activity logs will appear here when admin actions are performed
                  </p>
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-4 gap-4 px-4 py-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Action</div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Target</div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Device ID</div>
                    </div>
                  </div>
                  
                  {/* Table Rows */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {log.action.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {log.details?.email || 'System Action'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                          {log.details?.device_id || 'Unknown Device'}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
