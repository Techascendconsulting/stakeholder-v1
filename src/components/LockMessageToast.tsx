import React from 'react';
import { Lock, GraduationCap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface LockMessageToastProps {
  message: string;
  onClose: () => void;
}

const LockMessageToast: React.FC<LockMessageToastProps> = ({ message, onClose }) => {
  const { setCurrentView } = useApp();
  
  const handleGoToLearningJourney = () => {
    onClose(); // Clear the lock message
    setCurrentView('learning-flow'); // Navigate to Learning Journey
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-orange-200 dark:border-orange-800">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Content Locked</h1>
            <p className="text-orange-100">This section is not yet available</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center leading-relaxed whitespace-pre-line">
              {message}
            </p>

            <button
              onClick={handleGoToLearningJourney}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center space-x-2"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Go to Learning Journey</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockMessageToast;

