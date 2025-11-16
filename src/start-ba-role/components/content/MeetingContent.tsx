import React from 'react';
import type { MeetingContent as MeetingContentType } from '../../data/journeyData';

export default function MeetingContent({ content }: { content: MeetingContentType }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-black/40 border border-gray-800 p-4">
        <p className="text-xs text-gray-500 mb-1">Meeting</p>
        <p className="text-sm font-semibold text-white mb-2">{content.title}</p>
        <p className="text-xs text-gray-500 mb-1">Attendees</p>
        <p className="text-sm text-gray-300 mb-2">{content.attendees.join(', ')}</p>
      </div>

      <div className="rounded-xl bg-black/40 border border-gray-800 p-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">Agenda</p>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          {content.agenda.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {content.notes && content.notes.length > 0 && (
        <div className="rounded-xl bg-black/40 border border-blue-900/50 p-4">
          <p className="text-xs font-semibold text-blue-400 mb-2">Notes</p>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            {content.notes.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


