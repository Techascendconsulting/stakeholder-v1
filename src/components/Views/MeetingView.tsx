import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, Volume2, VolumeX, HelpCircle, Save, BarChart3, ChevronDown, ChevronUp, Users, Mic, MicOff } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useVoice } from '../../contexts/VoiceContext'
import { Message } from '../../types'
import { stakeholderAI, AIResponse } from '../../lib/stakeholderAI'
import { audioOrchestrator } from '../../lib/audioOrchestrator'

const MeetingView: React.FC = () => {
  const { selectedProject, selectedStakeholders, user, setCurrentView } = useApp()
  const { globalAudioEnabled, setGlobalAudioEnabled, getStakeholderVoice } = useVoice()
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showQuestionHelper, setShowQuestionHelper] = useState(false)
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<'as-is' | 'to-be'>('as-is')
  const [firstInteractionStatus, setFirstInteractionStatus] = useState<Record<string, boolean>>({})
  const [isInitialized, setIsInitialized] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [audioPlaybackState, setAudioPlaybackState] = useState({
    isPlaying: false,
    isPaused: false,
    currentMessageId: null as string | null
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  console.log('🎧 Audio enabled:', globalAudioEnabled)
  console.log('🎯 Selected stakeholders:', selectedStakeholders.map(s => s.name))

  // Enhanced question bank with more BA-specific questions
  const mockQuestions = {
    'as-is': [
      'Can you walk me through the current process from start to finish?',
      'What are the main pain points in the existing system?',
      'How much time does the current process typically take?',
      'What manual steps are involved in the current workflow?',
      'Where do you see the biggest bottlenecks occurring?',
      'Who are the key stakeholders involved in this process?',
      'What systems or tools do you currently use?',
      'How do you measure success in the current process?',
      'What compliance or regulatory requirements must be considered?',
      'What happens when exceptions occur in the current process?'
    ],
    'to-be': [
      'What would an ideal solution look like for your team?',
      'What specific improvements would you like to see?',
      'How would you measure success for this project?',
      'What features are most important to you?',
      'How should the new process differ from the current one?',
      'What integration requirements do you have?',
      'What training or change management support would you need?',
      'How would this solution impact your daily work?',
      'What are your must-have vs nice-to-have requirements?',
      'How would you handle edge cases in the new system?'
    ]
  }

  // Initialize meeting when stakeholders and project are selected
  useEffect(() => {
    if (selectedProject && selectedStakeholders.length > 0 && !isInitialized) {
      console.log('🚀 Initializing meeting...')
      initializeMeeting()
    }
  }, [selectedProject, selectedStakeholders, isInitialized])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(prev => prev + transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      console.log('🎤 Speech recognition initialized')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Set up audio orchestrator state monitoring
  useEffect(() => {
    const handleStateChange = (state: any) => {
      console.log('🎵 Audio state changed:', state)
      setAudioPlaybackState({
        isPlaying: state.isPlaying,
        isPaused: state.isPaused,
        currentMessageId: state.currentMessageId
      })
    }

    audioOrchestrator.onStateChange(handleStateChange)
    return () => {
      audioOrchestrator.offStateChange(handleStateChange)
    }
  }, [])

  const playAudioForMessage = async (message: Message, autoPlay: boolean = true) => {
    console.log('🔊 Attempting to play audio for:', message.stakeholderName, 'Audio enabled:', globalAudioEnabled)
    
    if (!globalAudioEnabled) {
      console.log('🔇 Audio disabled globally')
      return
    }

    const stakeholder = selectedStakeholders.find(s => s.id === message.speaker)
    if (!stakeholder) {
      console.log('❌ No stakeholder found for message speaker:', message.speaker)
      return
    }

    try {
      console.log('🎯 Queuing audio for stakeholder:', stakeholder.name)
      await audioOrchestrator.queueMessage(
        {
          id: message.id,
          content: message.content,
          speakerId: message.speaker,
          stakeholderName: message.stakeholderName || stakeholder.name
        },
        stakeholder,
        autoPlay
      )
      console.log('✅ Audio queued successfully')
    } catch (error) {
      console.error('❌ Failed to queue audio:', error)
    }
  }

  const initializeMeeting = async () => {
    if (!selectedProject || selectedStakeholders.length === 0) return

    console.log('🎬 Starting meeting initialization...')
    setIsLoading(true)
    
    try {
      // Add welcome system message
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        speaker: 'system',
        content: `Welcome to your meeting for "${selectedProject.name}". Present stakeholders: ${selectedStakeholders.map(s => `${s.name} (${s.role})`).join(', ')}.`,
        timestamp: new Date().toISOString()
      }

      // Generate introductions for all stakeholders
      console.log('👥 Generating introductions for', selectedStakeholders.length, 'stakeholders')
      const introductions = await stakeholderAI.generateIntroduction(selectedStakeholders, selectedProject)
      
      // Convert AI responses to messages
      const introductionMessages: Message[] = introductions.map(intro => ({
        id: intro.id,
        speaker: intro.speaker,
        content: intro.content,
        timestamp: intro.timestamp,
        stakeholderName: intro.stakeholderName,
        stakeholderRole: intro.stakeholderRole
      }))

      // Mark all stakeholders as having had their first interaction
      const newFirstInteractionStatus = { ...firstInteractionStatus }
      selectedStakeholders.forEach(stakeholder => {
        newFirstInteractionStatus[stakeholder.id] = true
      })
      setFirstInteractionStatus(newFirstInteractionStatus)

      const allMessages = [welcomeMessage, ...introductionMessages]
      setMessages(allMessages)

      // Play audio for introductions if enabled - with proper sequencing
      if (globalAudioEnabled) {
        console.log('🎵 Setting up audio for introductions...')
        for (let i = 0; i < introductionMessages.length; i++) {
          const message = introductionMessages[i]
          // Delay each audio to allow previous to finish
          setTimeout(() => {
            console.log('🔊 Playing introduction', i + 1, 'of', introductionMessages.length)
            playAudioForMessage(message, true)
          }, i * 4000) // 4 second delay between introductions
        }
      }

      setIsInitialized(true)
      console.log('✅ Meeting initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize meeting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !selectedProject) return

    console.log('📨 Sending message:', inputMessage)
    setIsLoading(true)

    try {
      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        speaker: 'user',
        content: inputMessage,
        timestamp: new Date().toISOString()
      }

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)

      console.log('🤖 Generating AI response...')
      
      // Generate AI response
      const aiResponse = await stakeholderAI.generateResponse(
        selectedProject,
        selectedStakeholders,
        updatedMessages,
        inputMessage,
        firstInteractionStatus
      )

      console.log('✅ AI Response received from:', aiResponse.stakeholderName)

      // Convert AI response to message
      const responseMessage: Message = {
        id: aiResponse.id,
        speaker: aiResponse.speaker,
        content: aiResponse.content,
        timestamp: aiResponse.timestamp,
        stakeholderName: aiResponse.stakeholderName,
        stakeholderRole: aiResponse.stakeholderRole
      }

      setMessages(prev => [...prev, responseMessage])

      // Play audio response immediately if enabled
      if (globalAudioEnabled) {
        console.log('🔊 Scheduling audio playback...')
        // Small delay to ensure message is rendered
        setTimeout(() => {
          playAudioForMessage(responseMessage, true)
        }, 500)
      }

      // Update first interaction status if needed
      if (!firstInteractionStatus[aiResponse.speaker]) {
        setFirstInteractionStatus(prev => ({
          ...prev,
          [aiResponse.speaker]: true
        }))
      }

    } catch (error) {
      console.error('❌ Failed to generate response:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        speaker: 'system',
        content: 'Sorry, I encountered an issue generating a response. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setInputMessage('')
    }
  }

  const handleQuestionClick = (question: string) => {
    setInputMessage(question)
    setShowQuestionHelper(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleSaveNotes = () => {
    const meetingNotes = {
      project: selectedProject,
      stakeholders: selectedStakeholders,
      messages: messages.filter(m => m.speaker !== 'system'),
      timestamp: new Date().toISOString()
    }
    
    // Save to local storage (in a real app, this would be saved to a database)
    const existingNotes = JSON.parse(localStorage.getItem('meetingNotes') || '[]')
    existingNotes.push(meetingNotes)
    localStorage.setItem('meetingNotes', JSON.stringify(existingNotes))
    
    alert('Meeting notes saved successfully!')
  }

  const handleAnalyzeAnswers = () => {
    if (messages.length <= 2) {
      alert('Please conduct more of the interview before analyzing answers.')
      return
    }

    const analysisData = {
      project: selectedProject,
      stakeholders: selectedStakeholders,
      messages: messages,
      meetingId: `meeting-${Date.now()}`
    }

    sessionStorage.setItem('meetingAnalysis', JSON.stringify(analysisData))
    setCurrentView('analysis')
  }

  const getStakeholderById = (stakeholderId: string) => {
    return selectedStakeholders.find(s => s.id === stakeholderId)
  }

  const pauseAllAudio = () => {
    console.log('⏸️ Pausing all audio')
    audioOrchestrator.pause()
  }

  const resumeAllAudio = () => {
    console.log('▶️ Resuming all audio')
    audioOrchestrator.resume()
  }

  const stopAllAudio = () => {
    console.log('⏹️ Stopping all audio')
    audioOrchestrator.stop()
  }

  if (!selectedProject || selectedStakeholders.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      {/* Meeting Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              Meeting: {selectedProject.name}
            </h2>
            <div className="flex items-center space-x-4 mt-2">
              <p className="text-sm text-gray-600">
                Participants: {selectedStakeholders.map(s => `${s.name} (${s.role})`).join(', ')}
              </p>
              {audioPlaybackState.isPlaying && (
                <div className="flex items-center space-x-2 text-green-600 text-sm font-medium">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>🔊 Audio Playing</span>
                </div>
              )}
              {audioPlaybackState.isPaused && (
                <div className="flex items-center space-x-2 text-yellow-600 text-sm font-medium">
                  <Pause className="w-4 h-4" />
                  <span>⏸️ Audio Paused</span>
                </div>
              )}
              {globalAudioEnabled && !audioPlaybackState.isPlaying && !audioPlaybackState.isPaused && (
                <div className="flex items-center space-x-2 text-blue-600 text-sm">
                  <Volume2 className="w-4 h-4" />
                  <span>🎧 Audio Ready</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Enhanced Audio Controls */}
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border">
              <button
                onClick={() => {
                  console.log('🔄 Toggling global audio:', !globalAudioEnabled)
                  setGlobalAudioEnabled(!globalAudioEnabled)
                }}
                className={`p-2 rounded-lg transition-colors ${
                  globalAudioEnabled 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                }`}
                title={globalAudioEnabled ? 'Audio Enabled - Click to Disable' : 'Audio Disabled - Click to Enable'}
              >
                {globalAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              
              {audioPlaybackState.isPlaying && (
                <button
                  onClick={pauseAllAudio}
                  className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-300"
                  title="Pause Audio"
                >
                  <Pause className="w-5 h-5" />
                </button>
              )}
              
              {audioPlaybackState.isPaused && (
                <button
                  onClick={resumeAllAudio}
                  className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors border border-green-300"
                  title="Resume Audio"
                >
                  <Play className="w-5 h-5" />
                </button>
              )}

              {(audioPlaybackState.isPlaying || audioPlaybackState.isPaused) && (
                <button
                  onClick={stopAllAudio}
                  className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors border border-red-300"
                  title="Stop Audio"
                >
                  <Square className="w-5 h-5" />
                </button>
              )}
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
        </div>
        
        {/* Question Helper Panel */}
        {showQuestionHelper && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-blue-900">
                Business Analyst Question Bank
              </h3>
              <div className="flex bg-white rounded-lg p-1 border border-blue-200">
                <button
                  onClick={() => setSelectedQuestionCategory('as-is')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedQuestionCategory === 'as-is'
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Current State ({mockQuestions['as-is'].length})
                </button>
                <button
                  onClick={() => setSelectedQuestionCategory('to-be')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedQuestionCategory === 'to-be'
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Future State ({mockQuestions['to-be'].length})
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {mockQuestions[selectedQuestionCategory].map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className="text-left p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                >
                  <p className="text-sm text-gray-900 group-hover:text-blue-900 font-medium">
                    {question}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const stakeholder = getStakeholderById(message.speaker)
          return (
            <div
              key={message.id}
              className={`flex ${
                message.speaker === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="max-w-4xl">
                {/* Stakeholder info for non-user messages */}
                {message.speaker !== 'user' && message.speaker !== 'system' && stakeholder && (
                  <div className="flex items-center space-x-2 mb-2">
                    <img
                      src={stakeholder.photo}
                      alt={stakeholder.name}
                      className="w-8 h-8 rounded-full border-2 border-gray-200"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      {stakeholder.name} - {stakeholder.role}
                    </span>
                    {audioPlaybackState.currentMessageId === message.id && (
                      <div className="flex items-center space-x-1 text-green-600 font-medium">
                        <Volume2 className="w-4 h-4 animate-pulse" />
                        <span className="text-xs">🔊 Speaking</span>
                      </div>
                    )}
                    {globalAudioEnabled && message.speaker !== 'system' && (
                      <button
                        onClick={() => playAudioForMessage(message, true)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        title="Replay this message"
                      >
                        <Play className="w-3 h-3 text-gray-500" />
                      </button>
                    )}
                  </div>
                )}
                
                <div
                  className={`px-4 py-3 rounded-lg ${
                    message.speaker === 'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : message.speaker === 'system'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-gray-100 text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  <div className="text-xs mt-2 opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">🤖 Stakeholder is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message to the stakeholders..."
              className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={isLoading}
            />
            
            {/* Voice Input Button */}
            {recognitionRef.current && (
              <button
                onClick={toggleVoiceInput}
                disabled={isLoading}
                className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isListening ? 'Stop Voice Input' : 'Start Voice Input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </div>
        
        {/* Action Buttons */}
        {messages.length > 2 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Press Enter to send • Shift+Enter for new line • Click mic for voice input
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