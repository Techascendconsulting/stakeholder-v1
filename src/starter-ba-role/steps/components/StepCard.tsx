import React from 'react';

export const StepCard: React.FC<{ title?: string; children?: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="max-w-3xl mx-auto">
      {title && <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6 md:p-8">
        {children}
      </div>
    </div>
  );
};


