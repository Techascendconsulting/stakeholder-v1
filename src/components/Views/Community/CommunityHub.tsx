import React, { useState } from 'react';
import { Users, Calendar, UserCheck, Settings } from 'lucide-react';
import { useAdmin } from '../../../contexts/AdminContext';
import BuddyTab from './BuddyTab';
import GroupsTab from './GroupsTab';
import LiveSessionsTab from './LiveSessionsTab';
import AdminCommunityHub from './AdminCommunityHub';

const CommunityHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buddy' | 'groups' | 'sessions'>('buddy');
  const [showAdmin, setShowAdmin] = useState(false);
  const { isAdmin } = useAdmin();

  if (showAdmin) {
    return <AdminCommunityHub onBack={() => setShowAdmin(false)} />;
  }

  const tabs = [
    { id: 'buddy' as const, label: 'My Buddy', icon: UserCheck },
    { id: 'groups' as const, label: 'My Groups', icon: Users },
    { id: 'sessions' as const, label: 'Live Sessions', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Community Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Connect with your study buddy, groups, and live sessions
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAdmin(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'buddy' && <BuddyTab />}
        {activeTab === 'groups' && <GroupsTab />}
        {activeTab === 'sessions' && <LiveSessionsTab />}
      </div>
    </div>
  );
};

export default CommunityHub;
