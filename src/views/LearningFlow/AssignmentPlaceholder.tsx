import React from 'react';
import { FileText, CheckCircle, Lock } from 'lucide-react';

interface AssignmentPlaceholderProps {
  title: string;
  description: string;
  isCompleted: boolean;
  canAccess: boolean;
  onComplete: () => void;
}

const AssignmentPlaceholder: React.FC<AssignmentPlaceholderProps> = ({
  title,
  description,
  isCompleted,
  canAccess,
  onComplete
}) => {
  if (!canAccess) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border-2 border-gray-200 dark:border-gray-700">
        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Assignment Locked
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Complete all lessons in this module to unlock the assignment.
        </p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-12 text-center border-2 border-green-200 dark:border-green-800">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Assignment Completed! 🎉
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You've successfully finished this module. The next module is now unlocked!
        </p>
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/40 rounded-lg text-green-700 dark:text-green-300 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>Module Complete</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
          {description}
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📝 Assignment submission will appear here soon
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            In Phase 2, you'll be able to submit your work and receive AI-powered feedback. 
            For now, click "Mark Complete" when you're ready to move on.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={onComplete}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Mark Assignment Complete
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            This will unlock the next module
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPlaceholder;

