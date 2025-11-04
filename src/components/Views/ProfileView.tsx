import React, { useState, useEffect } from 'react';
import { User, Mail, Settings, Bell, Shield, Palette, Globe, Save, Edit3, Camera, Lock, Eye, EyeOff, Sun, Moon, Monitor, RefreshCw, Cpu, Laptop, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { supabase } from '../../lib/supabase';
import { getUserProfile, updateUserProfile } from '../../utils/profileUtils';
import { deviceLockService } from '../../services/deviceLockService';

export const ProfileView: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { setCurrentView } = useApp();
  const { resetOnboarding } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'security'>('profile');

  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('Business Analyst');
  const [company, setCompany] = useState('');

  // Preferences state
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');

  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Device registration state
  const [deviceStatusLoading, setDeviceStatusLoading] = useState(false);
  const [registeredDevice, setRegisteredDevice] = useState<string | null>(null);
  const [deviceMessage, setDeviceMessage] = useState<string>('');

  // Photo state
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    const scrollToTop = () => {
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        mainContainer.scrollTop = 0;
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    scrollToTop();
    setTimeout(scrollToTop, 0);
    setTimeout(scrollToTop, 50);
  }, []);

  useEffect(() => {
    loadProfile();
    loadDeviceStatus();
  }, [user?.id]);

  const loadProfile = () => {
    if (user?.email) {
      setDisplayName(user.email.split('@')[0]);
      // Load other profile data from localStorage or API
      const savedProfile = localStorage.getItem(`profile-${user.id}`);
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setBio(profile.bio || '');
        setRole(profile.role || 'Business Analyst');
        setCompany(profile.company || '');
        setLanguage(profile.language || 'en');
        setTimezone(profile.timezone || 'UTC');
        setEmailNotifications(profile.emailNotifications !== false);
        setMeetingReminders(profile.meetingReminders !== false);
        setWeeklyDigest(profile.weeklyDigest || false);
        setProfilePhoto(profile.profilePhoto || null);
      }
    }
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const profile = {
        displayName,
        bio,
        role,
        company,
        language,
        timezone,
        emailNotifications,
        meetingReminders,
        weeklyDigest,
        profilePhoto,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`profile-${user.id}`, JSON.stringify(profile));
      
      // Show success message (could be replaced with toast notification)
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDeviceStatus = async () => {
    if (!user?.id) return;
    setDeviceStatusLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('registered_device')
        .eq('user_id', user.id)
        .single();
      if (!error) {
        setRegisteredDevice(data?.registered_device || null);
      }
    } finally {
      setDeviceStatusLoading(false);
    }
  };

  const registerThisDevice = async () => {
    if (!user?.id) return;
    setDeviceStatusLoading(true);
    setDeviceMessage('');
    try {
      const deviceId = await deviceLockService.getDeviceId();
      if (!deviceId) {
        setDeviceMessage('Unable to identify this device. Please try again.');
        return;
      }
      const { error } = await supabase
        .from('user_profiles')
        .update({ registered_device: deviceId })
        .eq('user_id', user.id);
      if (error) {
        setDeviceMessage('Failed to register device.');
      } else {
        setRegisteredDevice(deviceId);
        setDeviceMessage('Device registered successfully.');
      }
    } finally {
      setDeviceStatusLoading(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);
    try {
      // First verify the current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });

      if (verifyError) {
        alert('Current password is incorrect.');
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        alert('Error updating password: ' + updateError.message);
        return;
      }

      // Clear the form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred while changing your password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    setPhotoLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfilePhoto(result);
      setPhotoLoading(false);
      
      // Auto-save photo
      if (user?.id) {
        const profile = JSON.parse(localStorage.getItem(`profile-${user.id}`) || '{}');
        profile.profilePhoto = result;
        profile.updatedAt = new Date().toISOString();
        localStorage.setItem(`profile-${user.id}`, JSON.stringify(profile));
      }
    };
    
    reader.onerror = () => {
      setPhotoLoading(false);
      alert('Error reading file. Please try again.');
    };
    
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    if (user?.id) {
      const profile = JSON.parse(localStorage.getItem(`profile-${user.id}`) || '{}');
      profile.profilePhoto = null;
      profile.updatedAt = new Date().toISOString();
      localStorage.setItem(`profile-${user.id}`, JSON.stringify(profile));
    }
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLastSignIn = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-gray-100 mb-2">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>
        
        {/* Theme Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setTheme('light')}
            className={`p-2 rounded-md transition-colors ${
              theme === 'light' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
            title="Light mode"
          >
            <Sun size={18} />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-2 rounded-md transition-colors ${
              theme === 'dark' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
            title="Dark mode"
          >
            <Moon size={18} />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-2 rounded-md transition-colors ${
              theme === 'system' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
            title="System preference"
          >
            <Monitor size={18} />
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
              />
            ) : (
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                {displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
              disabled={photoLoading}
            />
            <label
              htmlFor="photo-upload"
              className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-800 text-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {photoLoading ? (
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Camera size={16} />
              )}
            </label>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">
              {displayName || user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-indigo-100 mb-2">{user?.email}</p>
            <div className="flex items-center space-x-4 text-sm">
              <p className="text-indigo-200">{role} • {company || 'Independent'}</p>
              <span className="text-indigo-300">•</span>
              <p className="text-indigo-200">
                Joined {user?.created_at ? formatJoinDate(user.created_at) : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Photo Section */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Camera className="mr-2 text-indigo-600" size={20} />
                  Profile Photo
                </h3>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
                        {displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Upload a profile photo to personalize your meetings and make them more engaging.
                    </p>
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload-profile"
                        disabled={photoLoading}
                      />
                      <label
                        htmlFor="photo-upload-profile"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer flex items-center space-x-2 disabled:bg-gray-400"
                      >
                        {photoLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Camera size={16} />
                        )}
                        <span>{photoLoading ? 'Uploading...' : profilePhoto ? 'Change Photo' : 'Upload Photo'}</span>
                      </label>
                      {profilePhoto && (
                        <button
                          onClick={removePhoto}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Supports JPG, PNG, GIF. Max size: 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Business Analyst">Business Analyst</option>
                    <option value="Senior Business Analyst">Senior Business Analyst</option>
                    <option value="Lead Business Analyst">Lead Business Analyst</option>
                    <option value="Business Analyst Trainee">Business Analyst Trainee</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Student">Student</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company/Organization
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Enter your company or organization"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself and your experience..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-gray-100"
                  >
                    <option value="light">☀️ Light</option>
                    <option value="dark">🌙 Dark</option>
                    <option value="system">💻 System</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {theme === 'system' ? 'Matches your device preference' : `Always use ${theme} mode`}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="pt">Português</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
              </div>

              {/* Restart Tour Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">Interactive Platform Tour</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                        Take the 60-second interactive tour that shows you around the platform. It walks you through actual pages and explains how everything works.
                      </p>
                      <button
                        onClick={() => {
                          // Go to dashboard (tour will be triggered from "How to Navigate" button)
                          setCurrentView('dashboard');
                        }}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Go to Dashboard</span>
                      </button>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                        💡 Click the "How to Navigate" button on the Dashboard to start the tour
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive important updates via email</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      emailNotifications ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Meeting Reminders</h4>
                    <p className="text-sm text-gray-600">Get notified before scheduled meetings</p>
                  </div>
                  <button
                    onClick={() => setMeetingReminders(!meetingReminders)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      meetingReminders ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        meetingReminders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Weekly Digest</h4>
                    <p className="text-sm text-gray-600">Weekly summary of your activity</p>
                  </div>
                  <button
                    onClick={() => setWeeklyDigest(!weeklyDigest)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      weeklyDigest ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Account Information */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Shield className="mr-2 text-indigo-600" size={20} />
                  Account Information
                </h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                   <div>
                     <span className="font-medium text-gray-700">Email:</span>
                     <span className="ml-2 text-gray-600">{user?.email}</span>
                   </div>
                   <div>
                     <span className="font-medium text-gray-700">Account Created:</span>
                     <span className="ml-2 text-gray-600">
                       {user?.created_at ? formatJoinDate(user.created_at) : 'Unknown'}
                     </span>
                   </div>
                   <div>
                     <span className="font-medium text-gray-700">User ID:</span>
                     <span className="ml-2 text-gray-600 dark:text-gray-400 font-mono text-xs">{user?.id}</span>
                   </div>
                   <div>
                     <span className="font-medium text-gray-700">Last Password Sign In:</span>
                     <span className="ml-2 text-gray-600">
                       {user?.last_sign_in_at ? formatLastSignIn(user.last_sign_in_at) : 'Never'}
                     </span>
                     <div className="text-xs text-gray-500 mt-1">
                       Active session • Currently signed in
                     </div>
                   </div>
                   <div>
                     <span className="font-medium text-gray-700">Session Status:</span>
                     <span className="ml-2 text-green-600 font-medium">
                       ✓ Active
                     </span>
                     <div className="text-xs text-gray-500 mt-1">
                       Last updated: {user?.updated_at ? formatLastSignIn(user.updated_at) : 'Unknown'}
                     </div>
                   </div>
                </div>
              </div>

              {/* Device Registration */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Laptop className="mr-2 text-indigo-600" size={20} />
                  Device Registration
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Register this laptop so we recognize it the next time you sign in. You can re-register at any time.
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">Status:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {deviceStatusLoading ? 'Checking…' : registeredDevice ? 'Registered' : 'Not registered'}
                    </span>
                  </div>
                  {registeredDevice && (
                    <div className="mt-2 text-xs text-gray-500 break-all">
                      ID: {registeredDevice}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={registerThisDevice}
                    disabled={deviceStatusLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
                  >
                    {registeredDevice ? 'Re-register this device' : 'Register this device'}
                  </button>
                  {deviceMessage && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">{deviceMessage}</span>
                  )}
                </div>
              </div>

              {/* Change Password */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Lock className="mr-2 text-indigo-600" size={20} />
                  Change Password
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Enter your current password and choose a new secure password.
                </p>

                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password (min. 6 characters)"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        At least 6 characters long
                      </li>
                      <li className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${newPassword !== confirmPassword || !confirmPassword ? 'bg-gray-300' : newPassword === confirmPassword ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Passwords match
                      </li>
                    </ul>
                  </div>

                  {/* Change Password Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={changePassword}
                      disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                      className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Lock size={18} />
                      )}
                      <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button - Only show for non-security tabs */}
          {activeTab !== 'security' && (
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
              <button
                onClick={saveProfile}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={18} />
                )}
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};