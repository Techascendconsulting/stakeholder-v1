import React, { useState } from 'react';
import { X, Mail, User, Lock, Shield, Eye, EyeOff, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminCreateUserModalProps {
  onClose: () => void;
  onUserCreated: () => void;
  prefillData?: {
    email?: string;
    name?: string;
    accessRequestId?: string;
  };
}

const AdminCreateUserModal: React.FC<AdminCreateUserModalProps> = ({ onClose, onUserCreated, prefillData }) => {
  const [formData, setFormData] = useState({
    email: prefillData?.email || '',
    name: prefillData?.name || '',
    password: '',
    userType: 'existing' as 'new' | 'existing',
    subscriptionTier: 'free' as 'free' | 'premium' | 'enterprise',
    maxProjects: 1,
    sendEmail: true
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [createdUser, setCreatedUser] = useState<{email: string; password: string} | null>(null);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(formData.password);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const handleCopyCredentials = () => {
    const credentials = `Email: ${createdUser?.email}\nPassword: ${createdUser?.password}`;
    navigator.clipboard.writeText(credentials);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Get current user session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to create users');
      }

      // Call Edge Function to create user server-side
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          name: formData.name,
          password: formData.password,
          userType: formData.userType,
          subscriptionTier: formData.subscriptionTier,
          maxProjects: formData.maxProjects,
          sendEmail: formData.sendEmail,
          accessRequestId: prefillData?.accessRequestId
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create user');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create user');
      }

      console.log('✅ User created successfully:', data.user);
      
      // Show warning if email failed
      if (formData.sendEmail && !data.emailSent) {
        const emailError = data.emailError || 'Email not sent';
        console.warn('⚠️ Email not sent:', emailError);
        if (emailError.includes('RESEND_API_KEY')) {
          alert(`User created successfully, but email was not sent.\n\nTo enable emails, set RESEND_API_KEY in Supabase:\nDashboard → Project Settings → Edge Functions → Secrets\n\nUser can still sign in with the temporary password below.`);
        }
      }

      // Show success with credentials
      setCreatedUser({
        email: formData.email,
        password: formData.password
      });

    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Failed to create user: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Success screen after user creation
  if (createdUser) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              User Created Successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {formData.sendEmail 
                ? 'Welcome email sent with login credentials.'
                : 'Copy the credentials below and send them to the user manually.'}
            </p>
          </div>

          {/* Credentials Box */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Login Credentials:</p>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Email:</span>
                <p className="font-mono text-sm text-gray-900 dark:text-white">{createdUser.email}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Password:</span>
                <p className="font-mono text-sm text-gray-900 dark:text-white">{createdUser.password}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleCopyCredentials}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Credentials</span>
            </button>
            <button
              onClick={() => {
                onUserCreated();
                onClose();
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New User
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="user@example.com"
                required
                readOnly={!!prefillData?.email}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Temporary Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-24 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                placeholder="Enter or generate password"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Copy password"
                >
                  {passwordCopied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={generatePassword}
              className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Generate Secure Password</span>
            </button>
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              User Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, userType: 'new' }))}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.userType === 'new'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">New User</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Progressive unlock system</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, userType: 'existing' }))}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.userType === 'existing'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Existing User</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Full access immediately</p>
                </div>
              </button>
            </div>
          </div>

          {/* Subscription Tier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subscription Tier
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, subscriptionTier: 'free', maxProjects: 1 }))}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.subscriptionTier === 'free'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Free</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">1 project</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, subscriptionTier: 'premium', maxProjects: 3 }))}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.subscriptionTier === 'premium'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Premium</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">3 projects</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, subscriptionTier: 'enterprise', maxProjects: 999 }))}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.subscriptionTier === 'enterprise'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Enterprise</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Unlimited</p>
                </div>
              </button>
            </div>
          </div>

          {/* Max Projects (if not enterprise) */}
          {formData.subscriptionTier !== 'enterprise' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Projects
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxProjects}
                onChange={(e) => setFormData(prev => ({ ...prev, maxProjects: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Send Email */}
          <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <input
              type="checkbox"
              id="sendEmail"
              checked={formData.sendEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, sendEmail: e.target.checked }))}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="sendEmail" className="text-sm text-gray-700 dark:text-gray-300">
              Send welcome email with login credentials (Recommended)
            </label>
          </div>

          {/* Submit */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating User...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Create User Account</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateUserModal;









