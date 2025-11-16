import React from 'react';
import type { EmailContent as EmailContentType } from '../../data/journeyData';

export default function EmailContent({ content }: { content: EmailContentType }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">From</p>
          <p className="text-sm font-medium text-gray-200">{content.from}</p>
        </div>
      </div>

      <div className="rounded-xl bg-black/40 border border-gray-800 p-4">
        <p className="text-sm font-semibold text-white mb-2">{content.subject}</p>
        <div className="space-y-3 text-sm text-gray-300">
          {content.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      {content.actionItems && content.actionItems.length > 0 && (
        <div className="rounded-xl bg-black/40 border border-blue-900/50 p-4">
          <p className="text-xs font-semibold text-blue-400 mb-2">Action items</p>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            {content.actionItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


