import React, { useEffect } from 'react';
import { Lock, X } from 'lucide-react';

interface LockMessageToastProps {
  message: string;
  onClose: () => void;
}

const LockMessageToast: React.FC<LockMessageToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md mx-4 border-2 border-orange-300 dark:border-orange-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Content Locked
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line">
          {message}
        </p>
        
        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default LockMessageToast;

