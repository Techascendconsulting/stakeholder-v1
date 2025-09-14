import React from 'react'
import { useGlobalAudio } from '../../hooks/useGlobalAudio'
import { useApp } from '../../contexts/AppContext'
import { Pause, Play, Square, Music } from 'lucide-react'

const SidebarAudioPlayer: React.FC = () => {
  const { activeTrack, isPlaying, currentTitle, playTrack, pauseTrack, stopTrack } = useGlobalAudio()
  const { currentView } = useApp()

  // Meeting views where audio should auto-pause
  const meetingViews = ['stakeholders', 'training-practice', 'voice-practice', 'individual-agents']

  // Auto-pause when entering meetings
  React.useEffect(() => {
    if (isPlaying && meetingViews.includes(currentView)) {
      pauseTrack()
    }
  }, [currentView, isPlaying, pauseTrack])

  const handleStop = () => {
    stopTrack()
  }

  if (!activeTrack) return null

  return (
    <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
      <div className="flex items-center space-x-3">
        {/* Music Icon */}
        <div className="flex-shrink-0">
          <Music className="w-5 h-5 text-purple-200" />
        </div>
        
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white truncate">
            {currentTitle}
          </p>
          <p className="text-xs text-purple-200">
            {isPlaying ? 'Playing' : 'Paused'}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={isPlaying ? pauseTrack : () => playTrack(activeTrack, currentTitle)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-200"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3 ml-0.5" />
            )}
          </button>
          
          <button
            onClick={handleStop}
            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 transition-all duration-200"
            title="Stop"
          >
            <Square className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Visual Beat Indicator */}
      {isPlaying && (
        <div className="mt-2 flex justify-center space-x-1">
          <div className="w-1 h-2 bg-purple-300 rounded-full animate-pulse"></div>
          <div className="w-1 h-3 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
          <div className="w-1 h-2 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-1 h-4 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
          <div className="w-1 h-2 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
      )}
    </div>
  )
}

export default SidebarAudioPlayer

