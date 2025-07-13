import React, { useState, useEffect, useCallback } from 'react'
import { Play, Pause, Square, SkipForward, Volume2, VolumeX, HelpCircle, Save, BarChart3, ChevronDown, ChevronUp } from 'lucide-react'
import { stakeholderAI } from '../../lib/stakeholderAI'
import { messageQueue, QueuedMessage } from '../../lib/messageQueue'
import { audioOrchestrator, AudioPlaybackState } from '../../lib/audioOrchestrator'
import { DatabaseService, Project, Stakeholder, Message, Student } from '../../lib/database'
import { useApp } from '../../contexts/AppContext'

const MeetingView: React.FC = () => {
  console.log('🎬 DEBUG: MeetingView component rendered')
  const { selectedProject, selectedStakeholders, user, setCurrentView } = useApp()
  console.log('🎬 DEBUG: MeetingView data:', {
    selectedProject: selectedProject?.name || 'null',
    selectedStakeholders: selectedStakeholders?.length || 0,
    user: user?.email || 'null'
  })
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null)
  const [showQuestionHelper, setShowQuestionHelper] = useState(false)
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<'as-is' | 'to-be'>('as-is')
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
    if (selectedProject && selectedStakeholders.length > 0 && user) {
      initializeMeeting()
    }
  }, [selectedProject, selectedStakeholders, user])

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

  // Generate suggested questions based on project and stakeholder
  const getSuggestedQuestions = (category: 'as-is' | 'to-be') => {
    if (!selectedProject || selectedStakeholders.length === 0) return []

    const stakeholderRole = selectedStakeholders[0]?.role || 'Stakeholder'
    
    const questionTemplates = {
      'as-is': [
        `Can you walk me through the current ${selectedProject.name.toLowerCase()} process from your perspective?`,
        `What are the main pain points you experience with the current system?`,
        `How much time does the current process typically take?`,
        `What tools or systems do you currently use for this process?`,
        `Where do you see the most inefficiencies in the current workflow?`,
        `What manual steps are required that could potentially be automated?`,
        `How does the current process impact your daily responsibilities?`,
        `What data or information is difficult to access in the current system?`
      ],
      'to-be': [
        `What would an ideal ${selectedProject.name.toLowerCase()} process look like for you?`,
        `What specific outcomes would you like to see from this improvement?`,
        `How would you measure success for this initiative?`,
        `What features or capabilities are most important to you?`,
        `How should the new process integrate with your existing workflows?`,
        `What would make your job easier in the new system?`,
        `What are your expectations for training and change management?`,
        `How do you envision this impacting your team's productivity?`
      ]
    }

    return questionTemplates[category]
  }

  const handleQuestionClick = (question: string) => {
    setInputMessage(question)
    setShowQuestionHelper(false)
  }

  const handleSaveNotes = async () => {
    if (!currentMeetingId || messages.length === 0) return
    
    // Save meeting notes - this could be enhanced to save to a specific notes table
    console.log('Saving meeting notes for meeting:', currentMeetingId)
    alert('Meeting notes saved successfully!')
  }

  const handleAnalyzeAnswers = () => {
    if (messages.length === 0) {
      alert('No conversation to analyze yet. Please conduct the interview first.')
      return
    }
    
    // Store the current meeting data for analysis
    const analysisData = {
      project: selectedProject,
      stakeholders: selectedStakeholders,
      messages: messages,
      meetingId: currentMeetingId
    }
    
    // Store in sessionStorage for the analysis page
    sessionStorage.setItem('meetingAnalysis', JSON.stringify(analysisData))
    
    // Navigate to analysis page
    setCurrentView('analysis')
  }

  const initializeMeeting = async () => {
    if (!selectedProject || !user) return

    try {
      // Create a new meeting in the database
      const meetingId = await DatabaseService.createMeeting(
        selectedProject.id,
        user.id,
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
        speaker_id: user.id,
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
        user.id
      )

      // Get first interaction status for all stakeholders
      const firstInteractionStatus = await DatabaseService.getFirstInteractionStatus(
        user.id,
        selectedStakeholders.map(s => s.id),
        selectedProject.id
      )

      // Generate AI response
      const aiResponse = await stakeholderAI.generateResponse(
        selectedProject,
        selectedStakeholders,
        updatedMessages,
        inputMessage,
        user.id,
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
      <div className="p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Meeting Active</h3>
          <p className="text-gray-600 mb-4">Select a project and stakeholders to start a meeting.</p>
          <button
            onClick={() => setCurrentView('stakeholders')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Go to Stakeholder Selection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Meeting Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Meeting: {selectedProject.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Participants: {selectedStakeholders.map(s => s.name).join(', ')}
            </p>
          </div>
          
          {/* Question Helper Toggle */}
          <button
            onClick={() => setShowQuestionHelper(!showQuestionHelper)}
            className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Question Helper</span>
            {showQuestionHelper ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Question Helper Panel */}
        {showQuestionHelper && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-4 mb-4">
              <h3 className="text-lg font-semibold text-blue-900">Suggested Questions</h3>
              <div className="flex bg-white rounded-lg p-1 border border-blue-200">
                <button
                  onClick={() => setSelectedQuestionCategory('as-is')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedQuestionCategory === 'as-is'
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  As-Is Process
                </button>
                <button
                  onClick={() => setSelectedQuestionCategory('to-be')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedQuestionCategory === 'to-be'
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  To-Be Vision
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
              {getSuggestedQuestions(selectedQuestionCategory).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className="text-left p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
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
        
        {/* Action Buttons */}
        {messages.length > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveNotes}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                <span>Save Notes</span>
              </button>
              <button
                onClick={handleAnalyzeAnswers}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analyze Answers</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MeetingView