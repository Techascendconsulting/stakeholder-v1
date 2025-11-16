import React, { useState } from 'react';

export const Checklist: React.FC<{ items?: string[] }> = ({ items = ['Item one', 'Item two', 'Item three'] }) => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return (
    <ul className="space-y-2">
      {items.map((label, idx) => (
        <li key={idx} className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={!!checked[idx]}
            onChange={() => setChecked(prev => ({ ...prev, [idx]: !prev[idx] }))}
            className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-gray-800 dark:text-gray-200">{label}</span>
        </li>
      ))}
    </ul>
  );
};


