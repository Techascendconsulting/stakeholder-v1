import React from 'react';
import type { DocumentContent as DocumentContentType } from '../../data/journeyData';

export default function DocumentContent({ content }: { content: DocumentContentType }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-black/40 border border-gray-800 p-4">
        <p className="text-xs text-gray-500 mb-1">Document</p>
        <p className="text-sm font-semibold text-white mb-2">{content.title}</p>
        <div className="space-y-3 text-sm text-gray-300">
          {content.sections.map((section, index) => (
            <div key={index}>
              <p className="font-semibold text-gray-100 mb-1">{section.heading}</p>
              <p>{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


