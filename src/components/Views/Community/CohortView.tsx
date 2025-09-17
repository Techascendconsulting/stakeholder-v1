import React from 'react';

const CohortView: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Cohort</h1>
      <div className="rounded-2xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 p-6">
        <p className="text-gray-700 dark:text-gray-300">Slack cohort channel embed will appear here.</p>
      </div>
    </div>
  );
};

export default CohortView;


