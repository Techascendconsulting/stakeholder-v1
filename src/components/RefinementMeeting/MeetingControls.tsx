import React from 'react';
import { Play, Pause, RotateCcw, BookOpen } from 'lucide-react';

interface MeetingControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  hasCoaching: boolean;
  onShowCoaching?: () => void;
}

export const MeetingControls: React.FC<MeetingControlsProps> = ({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onRestart,
  hasCoaching,
  onShowCoaching
}) => {
  return (
    <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Play/Pause button */}
      <button
        onClick={isPlaying && !isPaused ? onPause : onPlay}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${isPlaying && !isPaused 
            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
          }
        `}
        title={isPlaying && !isPaused ? 'Pause to read coaching' : 'Resume meeting'}
      >
        {isPlaying && !isPaused ? (
          <>
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span>{isPaused ? 'Resume' : 'Play'}</span>
          </>
        )}
      </button>

      {/* Restart button */}
      <button
        onClick={onRestart}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200"
        title="Restart meeting from beginning"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Restart</span>
      </button>

      {/* Coaching indicator */}
      {hasCoaching && (
        <div className="flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
          <span>Coaching active</span>
        </div>
      )}
    </div>
  );
};

export default MeetingControls;

