import React from 'react';

export const EmailView: React.FC = () => {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-4">
      <div className="text-xs text-gray-500 mb-2">From: Sarah Manager &lt;sarah@housing.gov&gt;</div>
      <div className="text-xs text-gray-500 mb-4">Subject: Welcome to the team!</div>
      <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
        This is an email placeholder. Real content will be provided later.
      </div>
    </div>
  );
};


