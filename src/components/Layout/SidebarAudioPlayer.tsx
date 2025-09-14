import React from 'react';
import { Play, Pause, Square, Music, Headphones } from 'lucide-react';
import { useGlobalAudio } from '../../hooks/useGlobalAudio';

const SidebarAudioPlayer: React.FC = () => {
  const { activeTrack, isPlaying, playTrack, pauseTrack, stopTrack } = useGlobalAudio();

  // Don't show if no track is active
  if (!activeTrack) {
    return null;
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      // Resume the current track
      playTrack(activeTrack.src || '', activeTrack.title || '');
    }
  };

  const handleStop = () => {
    stopTrack();
  };

  // Determine track type for icon
  const isMotivationTrack = activeTrack.title?.toLowerCase().includes('talk') || 
                           activeTrack.title?.toLowerCase().includes('motivation') ||
                           activeTrack.title?.toLowerCase().includes('overwhelm');
  
  const TrackIcon = isMotivationTrack ? Headphones : Music;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center space-x-3">
        {/* Track Icon */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <TrackIcon className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {activeTrack.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isMotivationTrack ? 'Motivation Talk' : 'Background Music'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePlayPause}
            className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 text-gray-700 dark:text-gray-300" />
            ) : (
              <Play className="w-3 h-3 text-gray-700 dark:text-gray-300" />
            )}
          </button>
          
          <button
            onClick={handleStop}
            className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Stop"
          >
            <Square className="w-3 h-3 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Progress indicator (visual only) */}
      {isPlaying && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarAudioPlayer;
