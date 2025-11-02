import React from 'react';

export const InfoBanner = () => (
  <div className="bg-blue-50 dark:bg-blue-900 p-3 text-sm border-b border-blue-100 dark:border-blue-800">
    <div className="max-w-4xl mx-auto">
      <p className="text-blue-800 dark:text-blue-200">
        <span className="font-semibold">💡 Tip:</span> For specific answers, address stakeholders directly by name 
        (e.g., "David, what's your team's name?" or "James, what's your current process?")
      </p>
    </div>
  </div>
);
