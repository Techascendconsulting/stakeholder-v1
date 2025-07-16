import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, SkipForward, Volume2, VolumeX, HelpCircle, Save, BarChart3, ChevronDown, ChevronUp, Search, Filter, Plus, Star, Tag } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useVoice } from '../../contexts/VoiceContext'
import { Message } from '../../types'
import AIService, { StakeholderContext, ConversationContext } from '../../services/aiService'
import { azureTTS, playBrowserTTS, isAzureTTSAvailable } from '../../lib/azureTTS'

const MeetingView: React.FC = () => {
  const { selectedProject, selectedStakeholders, user, setCurrentView } = useApp()
  const { globalAudioEnabled, getStakeholderVoice, isStakeholderVoiceEnabled } = useVoice()
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showQuestionHelper, setShowQuestionHelper] = useState(false)
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<'as-is' | 'to-be'>('as-is')
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null)
  const [audioStates, setAudioStates] = useState<{[key: string]: 'playing' | 'paused' | 'stopped'}>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock questions for demonstration
  const mockQuestions = {
    'as-is': [
      'Can you walk me through the current process from start to finish?',
      'What are the main pain points in the existing system?',
      'How much time does the current process typically take?',
      'What manual steps are involved in the current workflow?',
      'Where do you see the biggest bottlenecks occurring?'
    ],
    'to-be': [
      'What would an ideal solution look like for your team?',
      'What specific improvements would you like to see?',
      'How would you measure success for this project?',
      'What features are most important to you?',
      'How should the new process differ from the current one?'
    ]
  }

  useEffect(() => {
    if (selectedProject && selectedStakeholders.length > 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        speaker: 'system',
        content: `Welcome to your meeting for ${selectedProject.name}. The following stakeholders are present: ${selectedStakeholders.map(s => s.name).join(', ')}.`,
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMessage])
    }
  }, [selectedProject, selectedStakeholders])

  // Focus input when component mounts or after sending message
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus()
    }
  }, [isLoading])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Function to determine which stakeholder should respond
  const getTargetStakeholder = (userMessage: string) => {
    const message = userMessage.toLowerCase()
    
    // Check if user mentioned a specific stakeholder by name
    for (const stakeholder of selectedStakeholders) {
      const firstName = stakeholder.name.split(' ')[0].toLowerCase()
      const fullName = stakeholder.name.toLowerCase()
      
      if (message.includes(firstName) || message.includes(fullName)) {
        return stakeholder
      }
    }
    
    // Check for role-based targeting
    const roleKeywords = {
      'operations': ['operations', 'process', 'workflow', 'operational'],
      'customer service': ['customer', 'service', 'support', 'client'],
      'it': ['technical', 'system', 'technology', 'integration', 'it'],
      'hr': ['hr', 'human', 'people', 'team', 'staff', 'training'],
      'compliance': ['compliance', 'risk', 'regulatory', 'policy']
    }
    
    for (const [roleType, keywords] of Object.entries(roleKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        const targetStakeholder = selectedStakeholders.find(s => 
          s.role.toLowerCase().includes(roleType)
        )
        if (targetStakeholder) return targetStakeholder
      }
    }
    
    // Default: rotate through stakeholders
    const stakeholderIndex = messages.filter(m => m.speaker !== 'user' && m.speaker !== 'system').length % selectedStakeholders.length
    return selectedStakeholders[stakeholderIndex] || selectedStakeholders[0]
  }

  // Enhanced audio management system
  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
      setPlayingMessageId(null)
    }
  }

  const playMessageAudio = async (messageId: string, text: string, stakeholder: any, autoPlay: boolean = true) => {
    if (!globalAudioEnabled || !isStakeholderVoiceEnabled(stakeholder.id)) {
      return
    }

    try {
      // Stop any currently playing audio
      stopCurrentAudio()
      
      if (!autoPlay) {
        // Manual play - just set up the audio for this message
        return
      }

      const voiceName = getStakeholderVoice(stakeholder.id, stakeholder.role)
      
      if (isAzureTTSAvailable()) {
        // Use Azure TTS
        const audioBlob = await azureTTS.synthesizeSpeech(text, voiceName)
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        setCurrentAudio(audio)
        setPlayingMessageId(messageId)
        setAudioStates(prev => ({ ...prev, [messageId]: 'playing' }))
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          setCurrentAudio(null)
          setPlayingMessageId(null)
          setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
        }
        
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl)
          setCurrentAudio(null)
          setPlayingMessageId(null)
          setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
        }
        
        await audio.play()
      } else {
        // Fallback to browser TTS
        setPlayingMessageId(messageId)
        setAudioStates(prev => ({ ...prev, [messageId]: 'playing' }))
        
        await playBrowserTTS(text)
        
        setPlayingMessageId(null)
        setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
      }
    } catch (error) {
      console.error('Audio playback failed:', error)
      setPlayingMessageId(null)
      setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
    }
  }

  const toggleMessageAudio = async (messageId: string, text: string, stakeholder: any) => {
    if (playingMessageId === messageId) {
      // Currently playing this message - pause it
      if (currentAudio) {
        currentAudio.pause()
        setAudioStates(prev => ({ ...prev, [messageId]: 'paused' }))
      }
    } else if (audioStates[messageId] === 'paused') {
      // Resume paused audio
      if (currentAudio) {
        currentAudio.play()
        setAudioStates(prev => ({ ...prev, [messageId]: 'playing' }))
      }
    } else {
      // Start playing this message
      await playMessageAudio(messageId, text, stakeholder, true)
    }
  }

  const stopMessageAudio = (messageId: string) => {
    if (playingMessageId === messageId) {
      stopCurrentAudio()
    }
    setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    setIsLoading(true)
    
    // Store the message content before clearing
    const messageContent = inputMessage.trim()
    
    // Clear input immediately for better UX
    setInputMessage('')

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    try {
      // Select the appropriate stakeholder based on user message
      const stakeholder = getTargetStakeholder(messageContent)
      
      // Create stakeholder context for AI
      const stakeholderContext: StakeholderContext = {
        name: stakeholder.name,
        role: stakeholder.role,
        department: stakeholder.department,
        priorities: stakeholder.priorities,
        personality: stakeholder.personality,
        expertise: stakeholder.expertise || []
      }

      // Create conversation context
      const conversationContext: ConversationContext = {
        project: {
          name: selectedProject?.name || 'Current Project',
          description: selectedProject?.description || 'Project description',
          type: selectedProject?.projectType || 'General'
        },
        conversationHistory: updatedMessages,
        stakeholders: selectedStakeholders.map(s => ({
          name: s.name,
          role: s.role,
          department: s.department,
          priorities: s.priorities,
          personality: s.personality,
          expertise: s.expertise || []
        }))
      }

      // Generate AI response
      const aiService = AIService.getInstance()
      const aiResponse = await aiService.generateStakeholderResponse(
        messageContent,
        stakeholderContext,
        conversationContext
      )

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        speaker: stakeholder.id || 'stakeholder',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        stakeholderName: stakeholder.name,
        stakeholderRole: stakeholder.role
      }

      setMessages(prev => [...prev, aiMessage])
      
      // Play audio response with new system
      await playMessageAudio(aiMessage.id, aiResponse, stakeholder, true)
      
      // Check if the stakeholder redirected to another stakeholder (now async)
      const redirectedStakeholder = await aiService.detectStakeholderRedirect(
        aiResponse, 
        conversationContext.stakeholders || []
      )
      
      if (redirectedStakeholder) {
        // Find the actual stakeholder object from selectedStakeholders
        const targetStakeholder = selectedStakeholders.find(s => s.name === redirectedStakeholder.name)
        
        if (targetStakeholder) {
          // Automatically trigger the redirected stakeholder to respond
          setTimeout(async () => {
            try {
              const redirectContext: ConversationContext = {
                ...conversationContext,
                conversationHistory: [...updatedMessages, aiMessage]
              }
              
              // Generate response from the redirected stakeholder
              const redirectResponse = await aiService.generateStakeholderResponse(
                `${stakeholder.name} asked you to address this question: "${messageContent}"`,
                redirectedStakeholder,
                redirectContext
              )
              
              const redirectMessage: Message = {
                id: `redirect-${Date.now()}`,
                speaker: targetStakeholder.id || 'stakeholder',
                content: redirectResponse,
                timestamp: new Date().toISOString(),
                stakeholderName: targetStakeholder.name,
                stakeholderRole: targetStakeholder.role
              }
              
              setMessages(prev => [...prev, redirectMessage])
              
              // Play audio for the redirected response
              await playMessageAudio(redirectMessage.id, redirectResponse, targetStakeholder, true)
              
            } catch (error) {
              console.error('Error generating redirect response:', error)
            }
          }, 1000) // Small delay to make it feel natural
        }
      }
    } catch (error) {
      console.error('Error generating AI response:', error)
      // Fallback response
      const stakeholder = selectedStakeholders[0] || { name: 'Stakeholder', role: 'Team Member' }
      const fallbackMessage: Message = {
        id: `fallback-${Date.now()}`,
        speaker: stakeholder.id || 'stakeholder',
        content: `Thank you for your question. I'm experiencing some technical difficulties right now, but I'd be happy to discuss this further. Could you please rephrase your question?`,
        timestamp: new Date().toISOString(),
        stakeholderName: stakeholder.name,
        stakeholderRole: stakeholder.role
      }
      setMessages(prev => [...prev, fallbackMessage])
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

  if (!selectedProject || selectedStakeholders.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Meeting Active</h3>
          <p className="text-gray-600 mb-4">Select a project and stakeholders to start a meeting.</p>
          <button
            onClick={() => setCurrentView('projects')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Select Project
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Meeting: {selectedProject.name}
              </h2>
              <p className="text-sm text-blue-100 mt-1">
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
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-blue-900">
                  Question Bank for {selectedStakeholders[0]?.role || 'Stakeholder'}
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
                    As-Is Process ({mockQuestions['as-is'].length})
                  </button>
                  <button
                    onClick={() => setSelectedQuestionCategory('to-be')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedQuestionCategory === 'to-be'
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    To-Be Vision ({mockQuestions['to-be'].length})
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockQuestions[selectedQuestionCategory].map((question, index) => (
                                     <div
                     key={index}
                     className="bg-white border border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition-colors cursor-pointer"
                     onClick={() => {
                       setInputMessage(question)
                       setShowQuestionHelper(false)
                       setTimeout(() => inputRef.current?.focus(), 100)
                     }}
                   >
                    <p className="text-sm text-blue-900 font-medium">{question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => {
            const stakeholder = selectedStakeholders.find(s => s.id === message.speaker)
            const isStakeholderMessage = message.speaker !== 'user' && message.speaker !== 'system'
            const audioState = audioStates[message.id] || 'stopped'
            const isCurrentlyPlaying = playingMessageId === message.id
            
            return (
              <div
                key={message.id}
                className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg relative group ${
                    message.speaker === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.speaker === 'system'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {isStakeholderMessage && (
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      {message.stakeholderName} ({message.stakeholderRole})
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap pr-8">{message.content}</div>
                  <div className="text-xs mt-1 opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                  
                  {/* Audio Controls for Stakeholder Messages */}
                  {isStakeholderMessage && stakeholder && globalAudioEnabled && isStakeholderVoiceEnabled(stakeholder.id) && (
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleMessageAudio(message.id, message.content, stakeholder)}
                        className="p-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                        title={isCurrentlyPlaying ? 'Pause' : audioState === 'paused' ? 'Resume' : 'Play'}
                      >
                        {isCurrentlyPlaying ? (
                          <Pause className="w-3 h-3 text-gray-700" />
                        ) : (
                          <Play className="w-3 h-3 text-gray-700" />
                        )}
                      </button>
                      {audioState !== 'stopped' && (
                        <button
                          onClick={() => stopMessageAudio(message.id)}
                          className="p-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                          title="Stop"
                        >
                          <Square className="w-3 h-3 text-gray-700" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                <div className="text-sm">Thinking...</div>
              </div>
            </div>
          )}
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex space-x-4">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetingView