import React from 'react';
import type { VideoContent as VideoContentType } from '../../data/journeyData';

export default function VideoContent({ content }: { content: VideoContentType }) {
  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
        <img
          src={content.thumbnail}
          alt={content.title}
          className="w-full h-52 object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/30 flex items-center justify-center">
            <div className="ml-1 w-0 h-0 border-t-[10px] border-b-[10px] border-l-[16px] border-t-transparent border-b-transparent border-l-white" />
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-white mb-1">{content.title}</p>
        <p className="text-xs text-gray-500 mb-2">Duration: {content.duration}</p>
        <p className="text-sm text-gray-300">{content.description}</p>
      </div>
    </div>
  );
}


