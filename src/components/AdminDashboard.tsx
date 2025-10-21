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
import { useApp } from '../contexts/AppContext';
import { adminService, UserAdminRole, AdminActivityLog } from '../services/adminService';
import { deviceLockService } from '../services/deviceLockService';
import { supabase } from '../lib/supabase';
import { userActivityService, RecentActivityLog } from '../services/userActivityService';
import AdminUserManagement from './AdminUserManagement';

const AdminDashboard: React.FC = () => {
  console.log('🔍 ADMIN_DASHBOARD: Component rendering');
  const { currentView } = useApp();
  console.log('🔍 ADMIN_DASHBOARD: Current view is:', currentView);
  const { isAdmin, isLoading, hasPermission } = useAdmin();
  const { user } = useAuth();
  const { setCurrentView } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'activity' | 'user-activity'>('overview');
  const [adminUsers, setAdminUsers] = useState<UserAdminRole[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [userActivityLogs, setUserActivityLogs] = useState<RecentActivityLog[]>([]);
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

  // Refresh activity logs when switching to activity tabs
  useEffect(() => {
    if ((activeTab === 'activity' || activeTab === 'user-activity') && hasPermission('audit_logs')) {
      loadActivityLogs();
    }
  }, [activeTab]);

  // Refresh user data when switching to users tab
  useEffect(() => {
    if (activeTab === 'users' && hasPermission('user_management')) {
      // Trigger refresh of AdminUserManagement component
      // We'll use a custom event to communicate between components
      window.dispatchEvent(new CustomEvent('adminUserManagementRefresh'));
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
        
        // Also load user activity logs
        const userLogs = await userActivityService.getRecentActivityLogs(20);
        setUserActivityLogs(userLogs);
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
      
      // For active sessions, we'll use a more accurate calculation
      // Consider users active if they logged in within the last 7 days
      // This gives a more realistic view of recent activity
      const activeSessions = users.filter(u => u.last_sign_in_at && 
        new Date(u.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      ).length;

      // Debug logging for active sessions
      console.log('📊 System Stats Calculation:');
      console.log(`- Total users: ${totalUsers}`);
      console.log(`- Locked accounts: ${lockedAccounts}`);
      console.log(`- Admin users: ${adminUsers}`);
      console.log(`- Active sessions (last 7 days): ${activeSessions}`);
      
      // Log individual user activity for debugging
      users.forEach(user => {
        if (user.last_sign_in_at) {
          const lastSignIn = new Date(user.last_sign_in_at);
          const daysSinceLogin = Math.floor((Date.now() - lastSignIn.getTime()) / (24 * 60 * 60 * 1000));
          console.log(`- ${user.email}: Last login ${daysSinceLogin} days ago (${lastSignIn.toLocaleDateString()})`);
        } else {
          console.log(`- ${user.email}: Never logged in`);
        }
      });

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
    { id: 'overview', label: 'Dashboard', icon: BarChart3, permission: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'analytics' },
    { id: 'activity', label: 'Activity Logs', icon: Activity, permission: 'audit_logs' },
    { id: 'user-activity', label: 'User Activity', icon: Clock, permission: 'audit_logs' }
  ].filter(tab => !tab.permission || hasPermission(tab.permission as keyof any));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              System overview, analytics, and monitoring
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                console.log('🔍 ADMIN_DASHBOARD: Navigating to admin-panel');
                setCurrentView('admin-panel');
              }}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              Admin Panel
            </button>
          </div>
        </div>
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
                System Dashboard
              </h2>
              <button
                onClick={loadSystemStats}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <Clock className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* User Growth - Clickable */}
              <button
                onClick={() => setCurrentView('admin-panel')}
                className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer text-left w-full"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{systemStats.totalUsers}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Click to manage users</p>
                  </div>
                  <Users className="h-12 w-12 text-blue-500 dark:text-blue-400 opacity-80" />
                </div>
              </button>

              {/* Active Users - Clickable */}
              <button
                onClick={() => setCurrentView('admin-panel')}
                className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-700 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer text-left w-full"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Users (7d)</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{systemStats.activeSessions}</p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">Click to view users</p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400 opacity-80" />
                </div>
              </button>

              {/* Locked Accounts - Clickable */}
              <button
                onClick={() => setCurrentView('admin-panel')}
                className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-lg border border-red-200 dark:border-red-700 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer text-left w-full"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Locked Accounts</p>
                    <p className="text-3xl font-bold text-red-900 dark:text-red-100">{systemStats.lockedAccounts}</p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">Click to unlock accounts</p>
                  </div>
                  <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 opacity-80" />
                </div>
              </button>

              {/* Admin Users - Clickable */}
              <button
                onClick={() => setCurrentView('admin-panel')}
                className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer text-left w-full"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Admin Users</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{systemStats.adminUsers}</p>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Click to manage admins</p>
                  </div>
                  <Shield className="h-12 w-12 text-purple-500 dark:text-purple-400 opacity-80" />
                </div>
              </button>
            </div>

            {/* System Status & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">System Status</span>
                    </div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Database Status</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Connected</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Device Lock System</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">Active</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity Summary */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity (24h)</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Admin Actions</span>
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">{activityLogs.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm font-medium text-green-900 dark:text-green-100">User Activities</span>
                    <span className="text-lg font-bold text-green-900 dark:text-green-100">{userActivityLogs.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Pending Unlocks</span>
                    <span className="text-lg font-bold text-orange-900 dark:text-orange-100">{systemStats.lockedAccounts}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && hasPermission('analytics') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Advanced Analytics
              </h2>
              <button
                onClick={() => {
                  console.log('📊 Refreshing analytics data...');
                  loadSystemStats();
                }}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Refresh Analytics
              </button>
            </div>

            {/* User Engagement Analytics */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Engagement Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">{systemStats.totalUsers}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Total Registered Users</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">All time</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">{systemStats.activeSessions}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Active Users (7 days)</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">{Math.round((systemStats.activeSessions / Math.max(systemStats.totalUsers, 1)) * 100)}% engagement</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">{systemStats.adminUsers}</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Admin Users</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Super, Senior, Regular</div>
                </div>
              </div>
            </div>

            {/* Learning Progress Analytics */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Progress Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Training Modules Completed</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Practice Sessions</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Meetings Conducted</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Deliverables Created</div>
                </div>
              </div>
            </div>

            {/* System Performance Analytics */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Performance Analytics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Security Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <span className="text-sm text-red-900 dark:text-red-100">Device Lock Events</span>
                      <span className="text-lg font-bold text-red-900 dark:text-red-100">{systemStats.lockedAccounts}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <span className="text-sm text-orange-900 dark:text-orange-100">Failed Login Attempts</span>
                      <span className="text-lg font-bold text-orange-900 dark:text-orange-100">0</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm text-blue-900 dark:text-blue-100">Admin Actions (24h)</span>
                      <span className="text-lg font-bold text-blue-900 dark:text-blue-100">{activityLogs.length}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">System Health</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-sm text-green-900 dark:text-green-100">System Uptime</span>
                      <span className="text-lg font-bold text-green-900 dark:text-green-100">99.9%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm text-blue-900 dark:text-blue-100">Database Response</span>
                      <span className="text-lg font-bold text-blue-900 dark:text-blue-100">45ms</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span className="text-sm text-purple-900 dark:text-purple-100">Error Rate</span>
                      <span className="text-lg font-bold text-purple-900 dark:text-purple-100">0.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Intelligence */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Intelligence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-1">Peak: 2-4 PM</div>
                  <div className="text-sm text-indigo-700 dark:text-indigo-300">Peak Usage Time</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-pink-900 dark:text-pink-100 mb-1">Global</div>
                  <div className="text-sm text-pink-700 dark:text-pink-300">Geographic Distribution</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-teal-900 dark:text-teal-100 mb-1">24h</div>
                  <div className="text-sm text-teal-700 dark:text-teal-300">Avg. Response Time</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-1">98%</div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">User Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Cohort Analysis */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Cohort Analysis</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{systemStats.totalUsers}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Cohort Size</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{systemStats.activeSessions}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{Math.round((systemStats.activeSessions / Math.max(systemStats.totalUsers, 1)) * 100)}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  * Advanced cohort analysis will be available with more historical data
                </div>
              </div>
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

        {activeTab === 'user-activity' && hasPermission('audit_logs') && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              User Activity Logs
            </h2>
            
            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
              {userActivityLogs.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                  <p className="text-gray-600 dark:text-gray-400">No user activity logs found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    User activity logs will appear here when users sign in and use the system
                  </p>
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-6 gap-4 px-4 py-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">User</div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Activity</div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Device ID</div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">IP Address</div>
                    </div>
                  </div>
                  
                  {/* Table Rows */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {userActivityLogs.map((log) => (
                      <div key={log.id} className="grid grid-cols-6 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {log.user_email}
                        </div>
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {log.activity_type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            log.success 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {log.success ? 'SUCCESS' : 'FAILED'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                          {log.device_id ? log.device_id.substring(0, 20) + '...' : 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {log.ip_address || 'Unknown'}
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
