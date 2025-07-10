import React, { useState, useRef, useEffect } from 'react'
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Save, 
  X, 
  Loader2,
  Volume2,
  AlertCircle
} from 'lucide-react'
import { transcribeAudio, isAudioRecordingSupported, isWhisperAvailable } from '../lib/whisper'

interface VoiceInputModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transcription: string) => void
  initialText?: string
}

const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialText = ''
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcription, setTranscription] = useState(initialText)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTranscription(initialText)
      setRecordingTime(0)
      setError(null)
      setIsRecording(false)
      setIsPaused(false)
      setIsTranscribing(false)
    } else {
      // Clean up when modal closes
      stopRecording()
      cleanupStream()
    }
  }, [isOpen, initialText])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStream()
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [])

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const startRecording = async () => {
    if (!isAudioRecordingSupported()) {
      setError('Audio recording is not supported in your browser')
      return
    }

    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          await handleAudioTranscription(audioBlob)
        }
        cleanupStream()
      }

      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Could not access microphone. Please check permissions.')
      cleanupStream()
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const handleAudioTranscription = async (audioBlob: Blob) => {
    if (!isWhisperAvailable()) {
      setError('Whisper transcription not available. Please type your message manually.')
      return
    }

    setIsTranscribing(true)
    try {
      const newTranscription = await transcribeAudio(audioBlob)
      
      // Append to existing transcription with proper spacing
      setTranscription(prev => {
        const trimmedPrev = prev.trim()
        const trimmedNew = newTranscription.trim()
        
        if (!trimmedPrev) return trimmedNew
        if (!trimmedNew) return trimmedPrev
        
        // Add appropriate spacing between segments
        return `${trimmedPrev} ${trimmedNew}`
      })
    } catch (error) {
      console.error('Transcription error:', error)
      setError(error instanceof Error ? error.message : 'Transcription failed')
    } finally {
      setIsTranscribing(false)
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSave = () => {
    if (transcription.trim()) {
      onSave(transcription.trim())
      onClose()
    }
  }

  const handleCancel = () => {
    stopRecording()
    onClose()
  }

  const handleClearTranscription = () => {
    setTranscription('')
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Voice Input</h2>
              <p className="text-blue-100 mt-1">Record your question or message</p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Recording Controls */}
          <div className="text-center space-y-4">
            {/* Main Recording Button */}
            <div className="flex justify-center">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isTranscribing}
                  className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mic className="w-10 h-10" />
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  {/* Pause/Resume Button */}
                  <button
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                  </button>

                  {/* Stop Button */}
                  <button
                    onClick={stopRecording}
                    className="w-24 h-24 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <MicOff className="w-10 h-10" />
                  </button>
                </div>
              )}
            </div>

            {/* Recording Status */}
            <div className="space-y-2">
              {isRecording && (
                <div className="flex items-center justify-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
                  <span className="font-medium text-gray-700">
                    {isPaused ? 'Paused' : 'Recording'}: {formatRecordingTime(recordingTime)}
                  </span>
                </div>
              )}

              {isTranscribing && (
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Transcribing audio...</span>
                </div>
              )}

              {!isRecording && !isTranscribing && (
                <p className="text-gray-600">
                  {transcription ? 'Click the microphone to add more, or save your transcription' : 'Click the microphone to start recording'}
                </p>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Recording Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Transcription Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Transcription</h3>
              {transcription && (
                <button
                  onClick={handleClearTranscription}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="min-h-[120px] max-h-[200px] overflow-y-auto">
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="Your transcribed text will appear here. You can also edit it manually."
                className="w-full h-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Volume2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 font-medium text-sm">Recording Tips</p>
                <ul className="text-blue-800 text-sm mt-1 space-y-1">
                  <li>• Speak clearly and at a normal pace</li>
                  <li>• Use pause/resume for longer messages</li>
                  <li>• You can edit the transcription before saving</li>
                  <li>• Multiple recordings will be combined</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {transcription.length > 0 && `${transcription.length} characters`}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!transcription.trim()}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Use</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceInputModal