import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Square, Volume2, Loader2, AlertCircle } from 'lucide-react'
import { useVoice } from '../contexts/VoiceContext'
import { azureTTS, isAzureTTSAvailable, playBrowserTTS } from '../lib/azureTTS'

interface StakeholderMessageAudioProps {
  message: {
    id: string
    content: string
    speaker: string
    stakeholderName?: string
    stakeholderRole?: string
  }
  autoPlay?: boolean
  onPlayingChange?: (isPlaying: boolean) => void
}

const StakeholderMessageAudio: React.FC<StakeholderMessageAudioProps> = ({
  message,
  autoPlay = false,
  onPlayingChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const { 
    getStakeholderVoice, 
    isStakeholderVoiceEnabled, 
    globalAudioEnabled 
  } = useVoice()

  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        const current = audioRef.current.currentTime
        const total = audioRef.current.duration
        
        if (total > 0) {
          setAudioProgress((current / total) * 100)
        }
      }
    }, 100)
  }

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  const handlePlay = async () => {
    console.log('handlePlay called for message:', message.id, 'speaker:', message.speaker)
    if (!globalAudioEnabled || !isStakeholderVoiceEnabled(message.speaker)) {
      console.log('Audio disabled for this stakeholder:', message.speaker)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // If already playing, just resume
      if (audioRef.current && audioRef.current.paused && audioUrlRef.current) {
        audioRef.current.play()
        setIsPlaying(true)
        startProgressTracking()
        return
      }

      // Generate new audio
      const voiceName = getStakeholderVoice(message.speaker, message.stakeholderRole)
      console.log('Using voice:', voiceName, 'for stakeholder:', message.speaker)

      if (isAzureTTSAvailable()) {
        console.log('Using Azure TTS')
        // Use Azure TTS
        const audioBlob = await azureTTS.synthesizeSpeech(message.content, voiceName)
        
        // Clean up previous audio
        cleanup()

        // Create new audio element
        const audioUrl = URL.createObjectURL(audioBlob)
        audioUrlRef.current = audioUrl
        
        const audio = new Audio(audioUrl)
        audioRef.current = audio

        // Set up event listeners
        audio.addEventListener('loadedmetadata', () => {
          setAudioDuration(audio.duration)
        })

        audio.addEventListener('ended', () => {
          setIsPlaying(false)
          setAudioProgress(0)
          stopProgressTracking()
        })

        audio.addEventListener('error', () => {
          setError('Audio playback failed')
          setIsPlaying(false)
          setIsLoading(false)
          stopProgressTracking()
        })

        // Start playback
        await audio.play()
        setIsPlaying(true)
        startProgressTracking()
      } else {
        console.log('Using browser TTS fallback')
        // Use browser TTS - simulate progress for consistency
        setIsPlaying(true)
        setAudioDuration(message.content.length * 0.1) // Rough estimate
        startProgressTracking()
        
        await playBrowserTTS(message.content)
        
        setIsPlaying(false)
        setAudioProgress(0)
        stopProgressTracking()
      }

    } catch (error) {
      console.error('Audio playback error:', error)
      setError(error instanceof Error ? error.message : 'Audio playback failed')
      setIsPlaying(false)
      
      // Try browser TTS as fallback
      try {
        console.log('Trying browser TTS fallback')
        await playBrowserTTS(message.content)
      } catch (fallbackError) {
        console.error('Browser TTS fallback failed:', fallbackError)
        setError('All audio methods failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-play when component mounts if enabled
  useEffect(() => {
    // Temporarily disable autoPlay to avoid initialization issues
    // if (autoPlay && globalAudioEnabled && isStakeholderVoiceEnabled(message.speaker)) {
    //   handlePlay()
    // }
    
    // Cleanup on unmount
    return () => {
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, globalAudioEnabled, message.speaker, isStakeholderVoiceEnabled])

  // Notify parent component when playing state changes
  useEffect(() => {
    onPlayingChange?.(isPlaying)
  }, [isPlaying, onPlayingChange])

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      stopProgressTracking()
    }
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setAudioProgress(0)
      stopProgressTracking()
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Always render the controls, just disable functionality if audio is disabled
  console.log('Audio component rendering for message:', message.id, 'speaker:', message.speaker)
  console.log('Global audio enabled:', globalAudioEnabled)
  console.log('Stakeholder voice enabled:', isStakeholderVoiceEnabled(message.speaker))
  
  const audioDisabled = !globalAudioEnabled || !isStakeholderVoiceEnabled(message.speaker)

  return (
    <div className="flex items-center space-x-2 mt-2 bg-gray-50 rounded-lg p-2">
      {/* Play/Pause Button */}
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        disabled={isLoading || audioDisabled}
        className={`flex items-center justify-center w-8 h-8 text-white rounded-full transition-colors ${
          audioDisabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={audioDisabled ? 'Audio disabled' : isPlaying ? 'Pause' : 'Play'}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>

      {/* Stop Button */}
      <button
        onClick={handleStop}
        disabled={!isPlaying && !audioRef.current}
        className="flex items-center justify-center w-8 h-8 bg-gray-600 text-white rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Stop"
      >
        <Square className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      <div className="flex-1 flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-100"
            style={{ width: `${audioProgress}%` }}
          />
        </div>
        
        {/* Time Display */}
        {audioDuration > 0 && (
          <div className="text-xs text-gray-500 min-w-0">
            {formatTime((audioProgress / 100) * audioDuration)} / {formatTime(audioDuration)}
          </div>
        )}
      </div>

      {/* Volume Icon */}
      <div className="text-gray-400">
        <Volume2 className="w-4 h-4" />
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-1 text-red-600" title={error}>
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">Error</span>
        </div>
      )}
    </div>
  )
}

export default StakeholderMessageAudio