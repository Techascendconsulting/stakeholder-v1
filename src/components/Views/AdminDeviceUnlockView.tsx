import React, { useState } from 'react';
import AdminDeviceUnlock from '../AdminDeviceUnlock';
import AdminAssignmentReview from '../AdminAssignmentReview';

const AdminDeviceUnlockView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'devices' | 'assignments'>('assignments');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage device locks, assignments, and user progress
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'assignments'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Assignment Review
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'devices'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Device Management
          </button>
        </div>

        {/* Content */}
        {activeTab === 'assignments' && <AdminAssignmentReview />}
        {activeTab === 'devices' && <AdminDeviceUnlock />}
      </div>
    </div>
  );
};

export default AdminDeviceUnlockView;


