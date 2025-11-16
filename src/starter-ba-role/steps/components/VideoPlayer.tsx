import React from 'react';

export const VideoPlayer: React.FC = () => {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center">▶</div>
    </div>
  );
};


