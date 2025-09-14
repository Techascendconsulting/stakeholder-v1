import React from 'react';
import AdminDeviceUnlock from '../../AdminDeviceUnlock';

const AdminDeviceUnlockView: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Device Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage device locks and unlock user accounts
          </p>
        </div>
        
        <AdminDeviceUnlock />
      </div>
    </div>
  );
};

export default AdminDeviceUnlockView;
