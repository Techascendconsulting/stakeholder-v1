import React, { useState, useEffect, useCallback } from 'react'
import { Play, Pause, Square, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { stakeholderAI } from '../../lib/stakeholderAI'
import { messageQueue, QueuedMessage } from '../../lib/messageQueue'
import { audioOrchestrator, AudioPlaybackState } from '../../lib/audioOrchestrator'
import { DatabaseService, Project, Stakeholder, Message, Student } from '../../lib/database'

interface MeetingViewProps {
  selectedProject: Project | null
  selectedStakeholders: Stakeholder[]
  currentUser: Student // Changed type to Student
}

const MeetingView: React.FC<MeetingViewProps> = ({
  selectedProject,
  selectedStakeholders,
  currentUser
}) => {
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null)
  const [audioState, setAudioState] = useState<AudioPlaybackState>({
    isPlaying: false,
    isPaused: false,
    currentMessageId: null,
    queueLength: 0,
    currentPosition: 0,
    duration: 0
  })
  const [processedMessages, setProcessedMessages] = useState<QueuedMessage[]>([])

  // Initialize meeting when project and stakeholders are selected
  useEffect(() => {
    if (selectedProject && selectedStakeholders.length > 0 && currentUser) {
      initializeMeeting()
    }
  }, [selectedProject, selectedStakeholders, currentUser])

  // Subscribe to audio state changes
  useEffect(() => {
    const handleStateChange = (state: AudioPlaybackState) => {
      setAudioState(state)
    }

    audioOrchestrator.onStateChange(handleStateChange)
    return () => audioOrchestrator.offStateChange(handleStateChange)
  }, [])

  // Subscribe to message queue processing
  useEffect(() => {
    const handleMessageProcessed = (message: QueuedMessage) => {
      setProcessedMessages(prev => [...prev, message])
    }

    messageQueue.onMessageProcessed(handleMessageProcessed)
    return () => messageQueue.offMessageProcessed(handleMessageProcessed)
  }, [])

  const initializeMeeting = async () => {
    if (!selectedProject || !currentUser) return

    try {
      // Create a new meeting in the database
      const meetingId = await DatabaseService.createMeeting(
        selectedProject.id,
        currentUser.id,
        selectedStakeholders.map(s => s.id),
        selectedStakeholders.length > 1 ? 'group' : 'individual'
      )

      if (meetingId) {
        setCurrentMeetingId(meetingId)
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: `welcome-${Date.now()}`,
          meeting_id: meetingId,
          speaker_type: 'system',
          content: `Welcome to your meeting for ${selectedProject.name}. The following stakeholders are present: ${selectedStakeholders.map(s => s.name).join(', ')}. `,
          sequence_number: 1,
          created_at: new Date().toISOString()
        }

        setMessages([welcomeMessage])
        await DatabaseService.saveMessage(
          meetingId,
          'system',
          welcomeMessage.content
        )
      }
    } catch (error) {
      console.error('Error initializing meeting:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedProject || !currentMeetingId || isLoading) return

    setIsLoading(true)

    try {
      // Add user message to the conversation
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        meeting_id: currentMeetingId,
        speaker_type: 'ba',
        speaker_id: currentUser.id,
        content: inputMessage,
        sequence_number: messages.length + 1,
        created_at: new Date().toISOString()
      }

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)

      // Save user message to database
      await DatabaseService.saveMessage(
        currentMeetingId,
        'ba',
        inputMessage,
        currentUser.id
      )

      // Get first interaction status for all stakeholders
      const firstInteractionStatus = await DatabaseService.getFirstInteractionStatus(
        currentUser.id,
        selectedStakeholders.map(s => s.id),
        selectedProject.id
      )

      // Generate AI response
      const aiResponse = await stakeholderAI.generateResponse(
        selectedProject,
        selectedStakeholders,
        updatedMessages,
        inputMessage,
        currentUser.id,
        firstInteractionStatus
      )

      // Parse and queue the AI response for audio playback
      const queuedMessages = await messageQueue.parseAndQueueResponse(
        aiResponse,
        selectedStakeholders,
        true // Auto-play audio
      )

      // Add AI response to messages
      const aiMessage: Message = {
        id: aiResponse.id,
        meeting_id: currentMeetingId,
        speaker_type: 'stakeholder',
        speaker_id: aiResponse.speaker,
        content: aiResponse.content,
        sequence_number: updatedMessages.length + 1,
        created_at: aiResponse.timestamp
      }

      setMessages(prev => [...prev, aiMessage])

      // Save AI response to database
      await DatabaseService.saveMessage(
        currentMeetingId,
        'stakeholder',
        aiResponse.content,
        aiResponse.speaker
      )

      setInputMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAudioControl = (action: 'play' | 'pause' | 'stop' | 'skip') => {
    switch (action) {
      case 'play':
        if (audioState.isPaused) {
          audioOrchestrator.resume()
        } else {
          messageQueue.resumeProcessing(selectedStakeholders)
        }
        break
      case 'pause':
        audioOrchestrator.pause()
        messageQueue.pauseProcessing()
        break
      case 'stop':
        audioOrchestrator.stop()
        messageQueue.stopProcessing()
        break
      case 'skip':
        audioOrchestrator.skipToNext()
        break
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!selectedProject || selectedStakeholders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Select a project and stakeholders to start a meeting.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Meeting Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Meeting: {selectedProject.name}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Participants: {selectedStakeholders.map(s => s.name).join(', ')}
        </p>
      </div>

      {/* Audio Controls */}
      {(audioState.isPlaying || audioState.isPaused || audioState.queueLength > 0) && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {audioState.isPlaying ? (
                  <button
                    onClick={() => handleAudioControl('pause')}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Pause size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleAudioControl('play')}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Play size={16} />
                  </button>
                )}
                
                <button
                  onClick={() => handleAudioControl('stop')}
                  className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                >
                  <Square size={16} />
                </button>
                
                <button
                  onClick={() => handleAudioControl('skip')}
                  className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                >
                  <SkipForward size={16} />
                </button>
              </div>

              <div className="text-sm text-gray-600">
                {audioState.isPlaying && (
                  <span>
                    {formatTime(audioState.currentPosition)} / {formatTime(audioState.duration)}
                  </span>
                )}
                {audioState.queueLength > 0 && (
                  <span className="ml-4">
                    Queue: {audioState.queueLength} message{audioState.queueLength !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {audioState.isPlaying ? (
                <Volume2 size={16} className="text-green-600" />
              ) : (
                <VolumeX size={16} className="text-gray-400" />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {audioState.duration > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(audioState.currentPosition / audioState.duration) * 100}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.speaker_type === 'ba' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.speaker_type === 'ba'
                  ? 'bg-blue-600 text-white'
                  : message.speaker_type === 'system'
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.speaker_type === 'stakeholder' && (
                <div className="text-xs font-semibold mb-1 opacity-75">
                  {selectedStakeholders.find(s => s.id === message.speaker_id)?.name || 'Stakeholder'}
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs mt-1 opacity-75">
                {new Date(message.created_at).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Show currently processing messages */}
        {processedMessages.map((message) => (
          <div key={`processed-${message.id}`} className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-yellow-100 text-gray-900 border-l-4 border-yellow-500">
              <div className="text-xs font-semibold mb-1 text-yellow-700">
                🔊 {message.stakeholderName} (Speaking...)
              </div>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">Stakeholders are thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-4">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to the stakeholders..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}

export default MeetingView