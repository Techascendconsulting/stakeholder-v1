import React, { useState } from 'react';
import { Crown, Star, Users, ChevronDown } from 'lucide-react';

// Cohort data structure
export const cohortData = {
  'premium@example.com': {
    name: 'Premium Cohort',
    color: 'from-purple-500 to-pink-500',
    badge: 'Premium',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    icon: Crown,
    privileges: ['enhanced_reactions', 'file_sharing', 'priority_messaging', 'unlimited_channels']
  },
  'pro@example.com': {
    name: 'Pro Cohort',
    color: 'from-yellow-500 to-orange-500',
    badge: 'Pro',
    badgeColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    icon: Star,
    privileges: ['enhanced_reactions', 'file_sharing', 'priority_messaging', 'unlimited_channels', 'admin_features']
  },
  'free@example.com': {
    name: 'Free Cohort',
    color: 'from-blue-500 to-cyan-500',
    badge: 'Free',
    badgeColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    icon: Users,
    privileges: ['basic_reactions', 'limited_channels']
  }
};

// Channel data with cohort access
export const channelData = {
  'general': {
    name: 'General',
    cohort: 'all',
    description: 'General discussion for all cohorts',
    memberCount: 150,
    isPremium: false
  },
  'homework-help': {
    name: 'Homework Help',
    cohort: 'premium',
    description: 'Premium homework assistance',
    memberCount: 45,
    isPremium: true
  },
  'resources': {
    name: 'Resources',
    cohort: 'all',
    description: 'Shared learning resources',
    memberCount: 120,
    isPremium: false
  },
  'premium-resources': {
    name: 'Premium Resources',
    cohort: 'premium',
    description: 'Exclusive premium resources',
    memberCount: 45,
    isPremium: true
  },
  'admin': {
    name: 'Admin',
    cohort: 'pro',
    description: 'Administrative discussions',
    memberCount: 5,
    isPremium: true
  }
};

interface CohortSystemProps {
  currentCohort: string;
  onCohortChange: (cohort: string) => void;
  userEmail?: string;
}

const CohortSystem: React.FC<CohortSystemProps> = ({ 
  currentCohort, 
  onCohortChange, 
  userEmail 
}) => {
  const [showCohortSelector, setShowCohortSelector] = useState(false);

  // Get current user's cohort data
  const userCohort = cohortData[currentCohort as keyof typeof cohortData] || cohortData['free@example.com'];
  const userPrivileges = userCohort.privileges;
  const CohortIcon = userCohort.icon;

  // Filter channels based on user's cohort privileges
  const availableChannels = Object.entries(channelData).filter(([key, channel]) => {
    if (channel.cohort === 'all') return true;
    if (channel.cohort === 'premium' && userPrivileges.includes('unlimited_channels')) return true;
    if (channel.cohort === 'pro' && userPrivileges.includes('admin_features')) return true;
    return false;
  });

  return (
    <div className="relative">
      {/* Debug Info */}
      <div className="mb-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded text-xs">
        Cohort System Active - Current: {currentCohort}
      </div>
      
      {/* Cohort Selector Button */}
      <button
        onClick={() => setShowCohortSelector(!showCohortSelector)}
        className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md"
      >
        <CohortIcon size={16} />
        <span className="text-sm font-medium">{userCohort.badge}</span>
        <ChevronDown size={14} />
      </button>

      {/* Cohort Selector Dropdown */}
      {showCohortSelector && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select Cohort</h3>
          </div>
          {Object.entries(cohortData).map(([email, cohort]) => {
            const CohortIcon = cohort.icon;
            return (
              <button
                key={email}
                onClick={() => {
                  onCohortChange(email);
                  setShowCohortSelector(false);
                }}
                className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3 ${currentCohort === email ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <div className={`w-8 h-8 ${cohort.badgeColor} rounded-lg flex items-center justify-center`}>
                  <CohortIcon size={16} className="text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{cohort.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{cohort.badge} Plan</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Available Channels List */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Available Channels</h4>
        <div className="space-y-1">
          {availableChannels.map(([key, channel]) => (
            <div
              key={key}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">#</span>
                <span className="font-medium text-gray-900 dark:text-white">{channel.name}</span>
                {channel.isPremium && (
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Premium
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">{channel.memberCount}</span>
                {channel.isPremium && <Crown size={12} className="text-yellow-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Privileges */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Your Privileges</h4>
        <div className="space-y-1">
          {userPrivileges.map((privilege) => (
            <div key={privilege} className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {privilege.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CohortSystem;
