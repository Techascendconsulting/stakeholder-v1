import React from 'react';
import { AlertCircle, Shield, Mail } from 'lucide-react';

interface DeviceLockAlertProps {
  message: string;
  isLocked: boolean;
  onClose?: () => void;
}

const DeviceLockAlert: React.FC<DeviceLockAlertProps> = ({ 
  message, 
  isLocked, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          {isLocked ? (
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          ) : (
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isLocked ? 'Account Locked' : 'Device Verification'}
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>

        {isLocked && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  Need Help?
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Contact support at{' '}
                  <a 
                    href="mailto:support@techascendconsulting.com" 
                    className="underline hover:no-underline"
                  >
                    support@techascendconsulting.com
                  </a>{' '}
                  to unlock your account.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceLockAlert;

