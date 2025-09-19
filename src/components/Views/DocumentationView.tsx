import React from 'react';
import TrainingUI from './TrainingUI';

const DocumentationView: React.FC = () => {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Documentation Practice</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Practice user stories and acceptance criteria</p>
            </div>
          </div>
        </div>
      </div>


      {/* TrainingUI Component */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <TrainingUI />
      </div>
    </div>
  );
};

export default DocumentationView;
