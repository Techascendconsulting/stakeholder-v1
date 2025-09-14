import React, { useState, useEffect } from 'react';
import { Shield, Unlock, AlertCircle, Lock } from 'lucide-react';
import { deviceLockService } from '../services/deviceLockService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const AdminDeviceUnlock: React.FC = () => {
  const { user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userStatus, setUserStatus] = useState<{ locked: boolean; registered_device: string | null } | null>(null);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAuthorized(false);
        setCheckingAuth(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAuthorized(false);
        } else {
          setIsAuthorized(profile?.is_admin === true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAuthorized(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleCheckStatus = async () => {
    if (!email) return;

    setLoading(true);
    setMessage('');
    setUserStatus(null);

    try {
      // First get the user from auth.users, then get their profile
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (authError || !authUser.user) {
        setMessage('User not found');
        return;
      }

      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('user_id, locked, registered_device')
        .eq('user_id', authUser.user.id)
        .single();

      if (error) {
        setMessage('User not found');
        return;
      }

      setUserStatus(user);
      setMessage(`User found: ${user.locked ? 'LOCKED' : 'UNLOCKED'}`);
    } catch (error) {
      setMessage('Error checking user status');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!userStatus) return;

    setLoading(true);
    setMessage('');

    try {
      // First get the user from auth.users, then get their profile
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (authError || !authUser.user) {
        setMessage('User not found');
        return;
      }

      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', authUser.user.id)
        .single();

      if (error) {
        setMessage('User not found');
        return;
      }

      const success = await deviceLockService.unlockAccount(user.id);
      if (success) {
        setMessage('Account unlocked successfully');
        setUserStatus({ ...userStatus, locked: false });
      } else {
        setMessage('Failed to unlock account');
      }
    } catch (error) {
      setMessage('Error unlocking account');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking admin status
  if (checkingAuth) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Checking admin access...</span>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not admin
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <Lock className="h-8 w-8 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Access Denied
          </h2>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-700 dark:text-red-300">
            You don't have admin privileges to access this tool.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-8 w-8 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Admin Device Unlock
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            User Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Enter user email"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleCheckStatus}
            disabled={loading || !email}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </div>

        {userStatus && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              {userStatus.locked ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Unlock className="h-5 w-5 text-green-500" />
              )}
              <span className="font-medium text-gray-900 dark:text-white">
                Status: {userStatus.locked ? 'LOCKED' : 'UNLOCKED'}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Device ID: {userStatus.registered_device || 'Not registered'}
            </p>
            {userStatus.locked && (
              <button
                onClick={handleUnlock}
                disabled={loading}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Unlocking...' : 'Unlock Account'}
              </button>
            )}
          </div>
        )}

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('success') || message.includes('UNLOCKED')
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}>
            {message}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> This is an admin tool for testing. In production, 
          account unlocking should be done through the Supabase dashboard.
        </p>
      </div>
    </div>
  );
};

export default AdminDeviceUnlock;
