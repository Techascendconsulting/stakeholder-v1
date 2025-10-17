import React from 'react';

interface AdvancedExplainerProps {
  onAccept: () => void;
  onDismiss: () => void;
  triggersFound?: string[];
}

export default function AdvancedExplainer({ onAccept, onDismiss, triggersFound = [] }: AdvancedExplainerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          👀 Looks like this is an advanced user story
        </h2>
        
        {triggersFound.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              We detected these advanced concepts:
            </p>
            <div className="flex flex-wrap gap-1 justify-center">
              {triggersFound.slice(0, 3).map((trigger, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                  {trigger}
                </span>
              ))}
              {triggersFound.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                  +{triggersFound.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-5">
          We noticed this story involves actions like submitting a form, receiving confirmation, or syncing data.
          Want help thinking through integrations, data mapping, and validations?
        </p>
        
        <div className="flex gap-3 justify-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={onAccept}
          >
            Yes, Show Advanced Coaching
          </button>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            onClick={onDismiss}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}











