import React from 'react';
import { Lock, AlertCircle } from 'lucide-react';

interface LockedScreenProps {
  message?: string;
  onBack?: () => void;
}

/**
 * LockedScreen Component
 * 
 * Overlay shown when a module or lesson is locked
 */
const LockedScreen: React.FC<LockedScreenProps> = ({ 
  message = "🔒 You need to complete the previous topic to unlock this one.",
  onBack
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        {/* Lock Icon */}
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-gray-500 dark:text-gray-400" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Content Locked
        </h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900 dark:text-blue-100 text-left">
              Complete lessons in sequence to build a strong foundation. Each topic builds on the previous one!
            </p>
          </div>
        </div>

        {/* Action Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
};

export default LockedScreen;

