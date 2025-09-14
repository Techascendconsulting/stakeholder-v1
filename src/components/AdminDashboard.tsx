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
import AdminUserManagement from './AdminUserManagement';

const AdminDashboard: React.FC = () => {
  const { isAdmin, isLoading, hasPermission } = useAdmin();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'activity'>('overview');
  const [adminUsers, setAdminUsers] = useState<UserAdminRole[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

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
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
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
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              System Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-900">-</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-red-600">Locked Accounts</p>
                    <p className="text-2xl font-bold text-red-900">-</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Active Sessions</p>
                    <p className="text-2xl font-bold text-green-900">-</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Admin Users</p>
                    <p className="text-2xl font-bold text-purple-900">{adminUsers.length}</p>
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
            
            <div className="space-y-4">
              {activityLogs.map((log) => (
                <div key={log.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {log.action.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {log.details?.email || 'System Action'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
