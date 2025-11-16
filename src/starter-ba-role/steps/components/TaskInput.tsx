import React, { useState } from 'react';

export const TaskInput: React.FC = () => {
  const [text, setText] = useState('');
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-32 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-gray-100"
        placeholder="Type your reply here... (placeholder only)"
      />
      <div className="text-xs text-gray-500 mt-2">Auto-save placeholder. Tasks engine integration later.</div>
    </div>
  );
};


