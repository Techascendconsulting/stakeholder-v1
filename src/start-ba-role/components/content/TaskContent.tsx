import React from 'react';
import type { TaskContent as TaskContentType } from '../../data/journeyData';

export default function TaskContent({ content }: { content: TaskContentType }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-black/40 border border-gray-800 p-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">Instructions</p>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          {content.instructions.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-black/40 border border-gray-800 p-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">Deliverables</p>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          {content.deliverables.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {content.resources && content.resources.length > 0 && (
        <div className="rounded-xl bg-black/40 border border-blue-900/50 p-4">
          <p className="text-xs font-semibold text-blue-400 mb-2">Suggested resources</p>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            {content.resources.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


