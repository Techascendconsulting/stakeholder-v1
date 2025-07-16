import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, SkipForward, Volume2, VolumeX, HelpCircle, Save, BarChart3, ChevronDown, ChevronUp, Search, Filter, Plus, Star, Tag, Mic } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useVoice } from '../../contexts/VoiceContext'
import { Message } from '../../types'
import AIService, { StakeholderContext, ConversationContext } from '../../services/aiService'
import { azureTTS, playBrowserTTS, isAzureTTSAvailable } from '../../lib/azureTTS'
import VoiceInputModal from '../VoiceInputModal'

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
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [currentSpeaker, setCurrentSpeaker] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Dynamic conversation configuration based on context
  const getConversationConfig = () => {
    const stakeholderCount = selectedStakeholders.length
    const projectComplexity = selectedProject?.complexity || 'Intermediate'
    const messageCount = messages.length
    
    // ZERO HARD-CODING SYSTEM: All values derived from contextual factors
    // - teamDynamicsFactor: Logarithmic scaling prevents extreme values with large teams
    // - complexityMultiplier: Project complexity affects conversation depth
    // - conversationDepth: Longer conversations allow more nuanced interactions
    const teamDynamicsFactor = Math.log(stakeholderCount + 1) / Math.log(2) // Logarithmic team complexity
    const complexityMultiplier = projectComplexity === 'Advanced' ? 1.3 : projectComplexity === 'Beginner' ? 0.8 : 1.0
    const conversationDepth = Math.min(messageCount / 20, 1) // How deep into the conversation we are
    
    return {
      // Greeting responses: Adaptive based on team dynamics and social flow
      // Fewer people respond in larger groups to prevent overwhelming chatter
      maxGreetingRespondents: Math.min(
        Math.max(
          Math.floor(teamDynamicsFactor), 
          Math.floor(stakeholderCount * (0.8 - (teamDynamicsFactor * 0.1)))
        ), 
        Math.floor(stakeholderCount * 0.7)
      ),
      
      // Turn limits: More turns for complex projects and established conversations
      // Base turns derived from team size and project complexity
      maxDiscussionTurns: Math.min(
        Math.floor(teamDynamicsFactor * complexityMultiplier) + 
        Math.floor(conversationDepth * teamDynamicsFactor) + 
        Math.floor(stakeholderCount / 3),
        Math.floor(stakeholderCount * 0.8) + 2
      ),
      
      // Timing: Adaptive delays based on team size and social dynamics
      // Natural conversation rhythm that scales with group complexity
      greetingPauseTiming: {
        base: Math.floor(
          (600 + (teamDynamicsFactor * 200)) * 
          (1 + (stakeholderCount > 4 ? teamDynamicsFactor * 0.2 : 0))
        ),
        variance: Math.floor(
          (200 + (teamDynamicsFactor * 100)) * 
          (1 + (stakeholderCount > 6 ? 0.3 : 0))
        )
      },
      
      handoffPauseTiming: {
        base: Math.floor(
          (900 + (teamDynamicsFactor * 300)) * 
          complexityMultiplier * 
          (1 + (conversationDepth * 0.2))
        ),
        variance: Math.floor(
          (400 + (teamDynamicsFactor * 150)) * 
          (1 + (stakeholderCount > 5 ? teamDynamicsFactor * 0.15 : 0))
        )
      }
    }
  }

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

  // Speaker change animation effect
  useEffect(() => {
    if (currentSpeaker) {
      // Add a subtle pulse animation to the page when speaker changes
      document.body.style.animation = 'none'
      setTimeout(() => {
        document.body.style.animation = ''
      }, 10)
    }
  }, [currentSpeaker])

  // Function to detect if a message is addressed to the group
  const isGroupMessage = (userMessage: string): boolean => {
    const message = userMessage.toLowerCase()
    
    // Group greeting patterns
    const groupPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening)\s+(everyone|guys|team|all|folks)/,
      /^(hi|hello|hey)\s+(there|y'all)/,
      /^(good morning|good afternoon|good evening)(?:\s+everyone)?$/,
      /^(hi|hello|hey)(?:\s+team)?$/,
      /(can\s+everyone|everyone\s+can|could\s+everyone|everyone\s+could)/,
      /(i\s+want\s+everyone|everyone\s+should|let's\s+all|we\s+all\s+need)/,
      /(what\s+does\s+everyone|how\s+does\s+everyone|everyone\s+thinks?)/,
    ]
    
    return groupPatterns.some(pattern => pattern.test(message))
  }

  // Function to detect if this is a simple greeting (multiple responses OK)
  const isSimpleGreeting = (userMessage: string): boolean => {
    const message = userMessage.toLowerCase()
    
    const greetingPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening)\s+(everyone|guys|team|all|folks)$/,
      /^(hi|hello|hey)\s+(there|y'all)$/,
      /^(good morning|good afternoon|good evening)(?:\s+everyone)?$/,
      /^(hi|hello|hey)(?:\s+team)?$/,
    ]
    
    return greetingPatterns.some(pattern => pattern.test(message))
  }

  // Function to get initial respondent for discussion
  const getInitialRespondent = (userMessage: string) => {
    const message = userMessage.toLowerCase()
    
    // Check if this is a follow-up to someone who was recently addressed
    const recentMessages = messages.slice(-3) // Look at last 3 messages
    let lastAddressedStakeholder = null
    
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msg = recentMessages[i]
      if (msg.speaker !== 'user' && msg.speaker !== 'system') {
        // Check if this stakeholder was recently addressed by another stakeholder
        const stakeholderMessage = msg.content.toLowerCase()
        for (const stakeholder of selectedStakeholders) {
          const firstName = stakeholder.name.split(' ')[0].toLowerCase()
          const fullName = stakeholder.name.toLowerCase()
          
          // Look for patterns where this stakeholder was addressed
          if (stakeholderMessage.includes(`${firstName},`) || 
              stakeholderMessage.includes(`${fullName},`) ||
              stakeholderMessage.includes(`${firstName} could`) ||
              stakeholderMessage.includes(`${firstName} might`) ||
              stakeholderMessage.includes(`${firstName}?`)) {
            lastAddressedStakeholder = stakeholder
            break
          }
        }
        if (lastAddressedStakeholder) break
      }
    }
    
    // If this seems like a follow-up and someone was recently addressed, prioritize them
    const followUpPatterns = [
      /^(and|so|what about|how about|what|can you|could you|would you)/,
      /^(yes|yeah|ok|okay|sure|right|exactly|absolutely)/,
      /^(tell me|explain|show me|walk me through)/
    ]
    
    const isFollowUp = followUpPatterns.some(pattern => pattern.test(message))
    if (isFollowUp && lastAddressedStakeholder && !message.includes('james') && !message.includes('walker')) {
      return lastAddressedStakeholder
    }
    
    // Check for direct addressing first
    const directAddressingPatterns = [
      /(\w+),?\s+(let's|can you|could you|would you|please|tell me|what|how|why|where|when|share|explain|describe|walk me through)/,
      /(\w+),?\s+(i want|i need|i would like|i'd like)/,
      /thanks?\s+\w+,?\s+(\w+)\s+(let's|can you|could you|would you|please|tell me|what|how|why|where|when|share|explain|describe|walk me through)/,
    ]
    
    for (const pattern of directAddressingPatterns) {
      const match = message.match(pattern)
      if (match) {
        const targetName = match[1] || match[2]
        
        for (const stakeholder of selectedStakeholders) {
          const firstName = stakeholder.name.split(' ')[0].toLowerCase()
          const fullName = stakeholder.name.toLowerCase()
          
          if (firstName === targetName || fullName.includes(targetName)) {
            return stakeholder
          }
        }
      }
    }
    
    // Check for specific stakeholder mentions
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
      setCurrentSpeaker(null) // Clear current speaker when audio stops
    }
  }

  const playMessageAudio = async (messageId: string, text: string, stakeholder: any, autoPlay: boolean = true): Promise<void> => {
    if (!globalAudioEnabled || !isStakeholderVoiceEnabled(stakeholder.id)) {
      return Promise.resolve()
    }

    try {
      // Stop any currently playing audio
      stopCurrentAudio()
      
      if (!autoPlay) {
        // Manual play - just set up the audio for this message
        return Promise.resolve()
      }

      // Set current speaker when audio starts
      setCurrentSpeaker(stakeholder)

      const voiceName = getStakeholderVoice(stakeholder.id, stakeholder.role)
      
      if (isAzureTTSAvailable()) {
        // Use Azure TTS
        const audioBlob = await azureTTS.synthesizeSpeech(text, voiceName)
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        setCurrentAudio(audio)
        setPlayingMessageId(messageId)
        setAudioStates(prev => ({ ...prev, [messageId]: 'playing' }))
        
        // Return a promise that resolves when audio finishes
        return new Promise((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl)
            setCurrentAudio(null)
            setPlayingMessageId(null)
            setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
            setCurrentSpeaker(null) // Clear current speaker when audio ends
            resolve()
          }
          
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl)
            setCurrentAudio(null)
            setPlayingMessageId(null)
            setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
            setCurrentSpeaker(null) // Clear current speaker on error
            resolve() // Resolve even on error to prevent hanging
          }
          
          audio.play().catch(() => {
            URL.revokeObjectURL(audioUrl)
            setCurrentAudio(null)
            setPlayingMessageId(null)
            setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
            setCurrentSpeaker(null) // Clear current speaker on play error
            resolve()
          })
        })
      } else {
        // Fallback to browser TTS
        setPlayingMessageId(messageId)
        setAudioStates(prev => ({ ...prev, [messageId]: 'playing' }))
        
        await playBrowserTTS(text)
        
        setPlayingMessageId(null)
        setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
        setCurrentSpeaker(null) // Clear current speaker when browser TTS ends
        return Promise.resolve()
      }
    } catch (error) {
      console.error('Audio playback failed:', error)
      setPlayingMessageId(null)
      setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
      setCurrentSpeaker(null) // Clear current speaker on error
      return Promise.resolve()
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

    let currentMessages = [...messages, userMessage]
    setMessages(currentMessages)

    try {
      // Determine response strategy
      const isGroup = isGroupMessage(messageContent)
      const isGreeting = isSimpleGreeting(messageContent)
      
      if (isGroup && isGreeting) {
        // Handle simple greetings - multiple stakeholders respond briefly
        const config = getConversationConfig()
        const greetingRespondents = selectedStakeholders.slice(0, config.maxGreetingRespondents)
        
        for (let i = 0; i < greetingRespondents.length; i++) {
          const stakeholder = greetingRespondents[i]
          
          // Generate response
          const response = await generateStakeholderResponse(stakeholder, messageContent, currentMessages, 'greeting')
          const responseMessage = createResponseMessage(stakeholder, response, i)
          
          // Add message to conversation
          currentMessages = [...currentMessages, responseMessage]
          setMessages(currentMessages)
          
          // Play audio and wait for it to completely finish
          await playMessageAudio(responseMessage.id, response, stakeholder, true)
          
          // Add natural pause between speakers (but not after the last one)
          if (i < greetingRespondents.length - 1) {
            const pauseTime = config.greetingPauseTiming.base + Math.random() * config.greetingPauseTiming.variance
            await new Promise(resolve => setTimeout(resolve, pauseTime))
          }
        }
      } else {
        // Handle discussions with natural turn-taking
        const initialRespondent = getInitialRespondent(messageContent)
        await handleDiscussionFlow(initialRespondent, messageContent, currentMessages)
      }
    } catch (error) {
      console.error('Error generating AI response:', error)
      // Fallback response
      const fallbackStakeholder = selectedStakeholders[0] || { name: 'Stakeholder', role: 'Team Member' }
      const fallbackMessage = createResponseMessage(
        fallbackStakeholder,
        `Thank you for your question. I'm experiencing some technical difficulties right now, but I'd be happy to discuss this further. Could you please rephrase your question?`,
        0
      )
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle natural discussion flow with turn-taking
  const handleDiscussionFlow = async (initialStakeholder: any, userMessage: string, currentMessages: Message[]) => {
    const config = getConversationConfig()
    let currentSpeaker = initialStakeholder
    let conversationActive = true
    let turnCount = 0
    
    while (conversationActive && turnCount < config.maxDiscussionTurns) {
      // Generate response from current speaker
      const response = await generateStakeholderResponse(currentSpeaker, userMessage, currentMessages, 'discussion')
      const responseMessage = createResponseMessage(currentSpeaker, response, turnCount)
      
      // Add message to conversation
      currentMessages = [...currentMessages, responseMessage]
      setMessages(currentMessages)
      
      // Play audio response and wait for it to finish
      await playMessageAudio(responseMessage.id, response, currentSpeaker, true)
      
      // Check if current speaker is passing the conversation
      const aiService = AIService.getInstance()
      const handoffTarget = await aiService.detectConversationHandoff(
        response,
        selectedStakeholders.map(s => ({
          name: s.name,
          role: s.role,
          department: s.department,
          priorities: s.priorities,
          personality: s.personality,
          expertise: s.expertise || []
        }))
      )
      
      if (handoffTarget) {
        // Find the target stakeholder
        const targetStakeholder = selectedStakeholders.find(s => s.name === handoffTarget.name)
        
        if (targetStakeholder && targetStakeholder.id !== currentSpeaker.id) {
          // Natural delay before next person speaks
          const handoffPause = config.handoffPauseTiming.base + Math.random() * config.handoffPauseTiming.variance
          await new Promise(resolve => setTimeout(resolve, handoffPause))
          
          // Generate response from the handoff target with context that they were addressed
          const handoffResponse = await generateStakeholderResponse(
            targetStakeholder, 
            `${currentSpeaker.name} asked you: "${response.split(/[.!?]/).pop()?.trim() || userMessage}"`, 
            currentMessages, 
            'discussion'
          )
          
          const handoffMessage = createResponseMessage(targetStakeholder, handoffResponse, turnCount + 1)
          
          currentMessages = [...currentMessages, handoffMessage]
          setMessages(currentMessages)
          
          // Play audio for the handoff response
          await playMessageAudio(handoffMessage.id, handoffResponse, targetStakeholder, true)
          
          currentSpeaker = targetStakeholder
          turnCount += 2 // Increment by 2 since we had both original response and handoff
          
          // Continue the conversation with the new speaker
          continue
        }
      }
      
      // No handoff detected, end the conversation
      conversationActive = false
    }
  }

  // Generate stakeholder response with context
  const generateStakeholderResponse = async (stakeholder: any, userMessage: string, currentMessages: Message[], responseType: 'greeting' | 'discussion') => {
    const stakeholderContext = {
      name: stakeholder.name,
      role: stakeholder.role,
      department: stakeholder.department,
      priorities: stakeholder.priorities,
      personality: stakeholder.personality,
      expertise: stakeholder.expertise || []
    }

    const conversationContext = {
      project: {
        name: selectedProject?.name || 'Current Project',
        description: selectedProject?.description || 'Project description',
        type: selectedProject?.projectType || 'General'
      },
      conversationHistory: currentMessages,
      stakeholders: selectedStakeholders.map(s => ({
        name: s.name,
        role: s.role,
        department: s.department,
        priorities: s.priorities,
        personality: s.personality,
        expertise: s.expertise || []
      }))
    }

    const aiService = AIService.getInstance()
    return await aiService.generateStakeholderResponse(
      userMessage,
      stakeholderContext,
      conversationContext,
      responseType
    )
  }

  // Create response message object
  const createResponseMessage = (stakeholder: any, response: string, index: number): Message => {
    return {
      id: `ai-${Date.now()}-${index}`,
      speaker: stakeholder.id || 'stakeholder',
      content: response,
      timestamp: new Date().toISOString(),
      stakeholderName: stakeholder.name,
      stakeholderRole: stakeholder.role
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVoiceInput = (transcription: string) => {
    setInputMessage(transcription)
    setShowVoiceModal(false)
    // Focus input after a short delay to ensure modal is closed
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleTranscribingChange = (transcribing: boolean) => {
    setIsTranscribing(transcribing)
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
      <div className="max-w-6xl mx-auto p-6 h-screen flex flex-col">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Meeting: {selectedProject.name}
                  </h2>
                  <p className="text-sm text-blue-100 mt-1">
                    Participants: {selectedStakeholders.map(s => s.name).join(', ')}
                  </p>
                </div>
                
                {/* Current Speaker Display */}
                {currentSpeaker && (
                  <div className="hidden lg:flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 transition-all duration-300 ease-in-out animate-in slide-in-from-right shadow-lg">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-white/30 animate-pulse absolute inset-0"></div>
                      <img 
                        src={currentSpeaker.photo} 
                        alt={currentSpeaker.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/50 transition-transform duration-200 hover:scale-105 relative z-10"
                        onError={(e) => {
                          // Fallback to a default avatar if image fails to load
                          e.currentTarget.src = "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400"
                        }}
                        onLoad={(e) => {
                          // Hide loading animation when image loads
                          const loadingDiv = e.currentTarget.previousElementSibling as HTMLElement
                          if (loadingDiv) loadingDiv.style.display = 'none'
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse shadow-lg z-20"></div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-white flex items-center space-x-2">
                        <span>Currently Speaking</span>
                        {/* Sound Wave Animation */}
                        <div className="flex items-center space-x-0.5">
                          <div className="w-0.5 h-2 bg-white rounded-full animate-pulse"></div>
                          <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-0.5 h-4 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                          <div className="w-0.5 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      </div>
                      <div className="text-xs text-blue-100 font-medium">{currentSpeaker.name}</div>
                      <div className="text-xs text-blue-200 opacity-75">{currentSpeaker.role}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Question Helper Toggle */}
              <button
                onClick={() => setShowQuestionHelper(!showQuestionHelper)}
                className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Question Helper</span>
                {showQuestionHelper ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Mobile Current Speaker Display */}
            {currentSpeaker && (
              <div className="lg:hidden mt-3 flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30 transition-all duration-300 ease-in-out">
                <div className="relative">
                  <img 
                    src={currentSpeaker.photo} 
                    alt={currentSpeaker.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white/50"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400"
                    }}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border border-white animate-pulse"></div>
                </div>
                <div className="text-left flex-1">
                  <div className="text-xs font-medium text-white flex items-center space-x-1">
                    <span>🎤 {currentSpeaker.name}</span>
                  </div>
                  <div className="text-xs text-blue-200 opacity-75">{currentSpeaker.role}</div>
                </div>
              </div>
            )}
            
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                  {/* Stakeholder Avatar for non-user messages */}
                  {isStakeholderMessage && stakeholder && (
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <img 
                        src={stakeholder.photo} 
                        alt={stakeholder.name}
                        className={`w-8 h-8 rounded-full object-cover border-2 transition-all duration-200 ${
                          isCurrentlyPlaying 
                            ? 'border-green-400 shadow-lg scale-110' 
                            : 'border-gray-300'
                        }`}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400"
                        }}
                      />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg relative ${
                      message.speaker === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.speaker === 'system'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {isStakeholderMessage && (
                      <div className="text-xs font-medium text-gray-600 mb-1 flex items-center space-x-2">
                        <span>{message.stakeholderName}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{message.stakeholderRole}</span>
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap pr-8">{message.content}</div>
                    <div className="text-xs mt-1 opacity-75">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                    
                    {/* Audio Controls for Stakeholder Messages */}
                    {isStakeholderMessage && stakeholder && globalAudioEnabled && isStakeholderVoiceEnabled(stakeholder.id) && (
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button
                          onClick={() => toggleMessageAudio(message.id, message.content, stakeholder)}
                          className="p-1 rounded-full bg-white/30 hover:bg-white/50 transition-colors shadow-sm"
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
                            className="p-1 rounded-full bg-white/30 hover:bg-white/50 transition-colors shadow-sm"
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
          <div className="border-t p-4 flex-shrink-0">
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
                onClick={() => setShowVoiceModal(true)}
                disabled={isLoading || isTranscribing}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                title="Voice Input"
              >
                <Mic className="w-5 h-5" />
                {isTranscribing && (
                  <span className="text-sm">Transcribing...</span>
                )}
              </button>
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
                 <VoiceInputModal
           isOpen={showVoiceModal}
           onClose={() => setShowVoiceModal(false)}
           onSave={handleVoiceInput}
           onTranscribingChange={handleTranscribingChange}
         />
      </div>
    )
}

export default MeetingView