import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, SkipForward, Volume2, VolumeX, HelpCircle, Save, BarChart3, ChevronDown, ChevronUp, Search, Filter, Plus, Star, Tag, Mic, X } from 'lucide-react'
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
  const [meetingEndedSuccess, setMeetingEndedSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Dynamic UX state management - no hard-coding
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [canUserType, setCanUserType] = useState(true)
  const [isEndingMeeting, setIsEndingMeeting] = useState(false)
  const [userInterruptRequested, setUserInterruptRequested] = useState(false)
  const [audioPausedPosition, setAudioPausedPosition] = useState<number>(0)
  const [currentlyProcessingAudio, setCurrentlyProcessingAudio] = useState<string | null>(null)

  // Old hard-coded conversation state removed - replaced by dynamic conversationDynamics

  // Old hard-coded functions removed - replaced by dynamic versions

  // Dynamic input availability logic
  const shouldAllowUserInput = () => {
    // Users can always type unless they explicitly choose to wait
    // This is determined dynamically based on user behavior and preferences
    return canUserType && !isEndingMeeting
  }

  // Simplified conversation configuration - most logic moved to AI service
  const getConversationConfig = () => {
    const stakeholderCount = selectedStakeholders.length
    
    return {
      // Dynamic greeting handling - stakeholders will manage their own greeting state
      maxGreetingRespondents: Math.min(stakeholderCount, 3),
      
      // Discussion flow is now managed by AI service conversation state
      maxDiscussionTurns: Math.min(stakeholderCount * 2, 8),
      
      // Natural timing for conversation flow
      greetingPauseTiming: {
        base: 800,
        variance: 400
      },
      
      handoffPauseTiming: {
        base: 1200,
        variance: 600
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
      // Reset conversation state for new meeting
      const aiService = AIService.getInstance()
      aiService.resetConversationState()
      
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
    
    // Simple group detection - most logic moved to AI service
    const groupPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening)\s+(everyone|guys|team|all|folks)/,
      /^(hi|hello|hey)\s+(there|y'all)/,
      /^(good morning|good afternoon|good evening)(?:\s+everyone)?$/,
      /^(hi|hello|hey)(?:\s+team)?$/,
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

  // Enhanced stakeholder selection logic
  const getContextualStakeholder = (userMessage: string, conversationHistory: Message[]) => {
    const message = userMessage.toLowerCase()
    
    // 1. Check for explicit stakeholder mentions first
    const explicitStakeholder = getExplicitlyMentionedStakeholder(message)
    if (explicitStakeholder) return explicitStakeholder
    
    // 2. Check for topic-based stakeholder relevance
    const topicStakeholder = getTopicRelevantStakeholder(message)
    if (topicStakeholder) return topicStakeholder
    
    // 3. Check conversation context and recent interactions
    const contextualStakeholder = getContextuallyRelevantStakeholder(message, conversationHistory)
    if (contextualStakeholder) return contextualStakeholder
    
    // 4. Check for follow-up patterns
    const followUpStakeholder = getFollowUpStakeholder(message, conversationHistory)
    if (followUpStakeholder) return followUpStakeholder
    
    // 5. Use intelligent rotation based on conversation balance
    return getBalancedStakeholder(conversationHistory)
  }

  const getExplicitlyMentionedStakeholder = (message: string) => {
    for (const stakeholder of selectedStakeholders) {
      const firstName = stakeholder.name.split(' ')[0].toLowerCase()
      const fullName = stakeholder.name.toLowerCase()
      
      // Direct addressing patterns
      const directPatterns = [
        new RegExp(`\\b${firstName}\\b.*\\b(can|could|would|please|tell|explain|help|what|how|why)\\b`),
        new RegExp(`\\b${fullName}\\b.*\\b(can|could|would|please|tell|explain|help|what|how|why)\\b`),
        new RegExp(`\\b(to|for)\\s+${firstName}\\b`),
        new RegExp(`\\b${firstName}\\s*,`),
        new RegExp(`\\b${firstName}\\s*\\?`)
      ]
      
      if (directPatterns.some(pattern => pattern.test(message))) {
        return stakeholder
      }
    }
    return null
  }

  const getTopicRelevantStakeholder = (message: string) => {
    const topicKeywords = {
      'operations': ['process', 'workflow', 'efficiency', 'operations', 'daily', 'routine', 'procedure'],
      'it': ['system', 'technical', 'technology', 'software', 'integration', 'security', 'data'],
      'customer': ['customer', 'client', 'user', 'service', 'support', 'satisfaction', 'experience'],
      'finance': ['cost', 'budget', 'financial', 'money', 'expense', 'roi', 'investment'],
      'hr': ['staff', 'employee', 'people', 'team', 'training', 'change', 'culture'],
      'compliance': ['compliance', 'regulatory', 'policy', 'risk', 'audit', 'legal'],
      'sales': ['sales', 'revenue', 'customer', 'market', 'selling', 'prospects'],
      'marketing': ['marketing', 'brand', 'campaign', 'promotion', 'advertising', 'market']
    }
    
    let bestMatch = null
    let maxScore = 0
    
    for (const stakeholder of selectedStakeholders) {
      const role = stakeholder.role.toLowerCase()
      const department = stakeholder.department.toLowerCase()
      
      let score = 0
      
      // Check topic relevance
      for (const [topic, keywords] of Object.entries(topicKeywords)) {
        if (role.includes(topic) || department.includes(topic)) {
          const keywordMatches = keywords.filter(keyword => message.includes(keyword)).length
          score += keywordMatches * 2
        }
      }
      
      // Check priority alignment
      stakeholder.priorities.forEach(priority => {
        if (message.includes(priority.toLowerCase())) {
          score += 3
        }
      })
      
      if (score > maxScore) {
        maxScore = score
        bestMatch = stakeholder
      }
    }
    
    return maxScore > 2 ? bestMatch : null
  }

  const getContextuallyRelevantStakeholder = (message: string, conversationHistory: Message[]) => {
    const recentMessages = conversationHistory.slice(-5)
    const questionTypes = {
      'follow-up': ['and', 'also', 'what about', 'how about', 'regarding', 'concerning'],
      'clarification': ['can you clarify', 'what do you mean', 'explain', 'clarify'],
      'continuation': ['continue', 'go on', 'tell me more', 'elaborate']
    }
    
    // Check if this is a follow-up question
    const isFollowUp = questionTypes['follow-up'].some(pattern => message.includes(pattern))
    const isClarification = questionTypes['clarification'].some(pattern => message.includes(pattern))
    
    if (isFollowUp || isClarification) {
      // Find the most recent non-user speaker
      for (let i = recentMessages.length - 1; i >= 0; i--) {
        const msg = recentMessages[i]
        if (msg.speaker !== 'user' && msg.speaker !== 'system') {
          const stakeholder = selectedStakeholders.find(s => s.id === msg.speaker)
          if (stakeholder) return stakeholder
        }
      }
    }
    
    return null
  }

  const getFollowUpStakeholder = (message: string, conversationHistory: Message[]) => {
    const recentMessages = conversationHistory.slice(-3)
    
    // Check for conversation threads
    const threads = new Map<string, number>()
    
    recentMessages.forEach(msg => {
      if (msg.speaker !== 'user' && msg.speaker !== 'system') {
        const count = threads.get(msg.speaker) || 0
        threads.set(msg.speaker, count + 1)
      }
    })
    
    // If someone has been actively participating, prioritize them for follow-ups
    const activeParticipant = [...threads.entries()]
      .sort((a, b) => b[1] - a[1])
      .find(([speakerId, count]) => count >= 2)
    
    if (activeParticipant) {
      return selectedStakeholders.find(s => s.id === activeParticipant[0])
    }
    
    return null
  }

  const getBalancedStakeholder = (conversationHistory: Message[]) => {
    // Count messages per stakeholder
    const messageCounts = new Map<string, number>()
    
    selectedStakeholders.forEach(stakeholder => {
      const count = conversationHistory.filter(msg => msg.speaker === stakeholder.id).length
      messageCounts.set(stakeholder.id, count)
    })
    
    // Find stakeholder with least participation
    const leastActiveStakeholder = selectedStakeholders.reduce((least, current) => {
      const leastCount = messageCounts.get(least.id) || 0
      const currentCount = messageCounts.get(current.id) || 0
      return currentCount < leastCount ? current : least
    })
    
    return leastActiveStakeholder
  }

  // Enhanced conversation flow management
  const manageConversationFlow = async (initialStakeholder: any, userMessage: string, currentMessages: Message[]) => {
    const config = getConversationConfig()
    let conversationActive = true
    let turnCount = 0
    let currentSpeaker = initialStakeholder
    
    // Enhanced conversation quality metrics
    const conversationMetrics = {
      stakeholderParticipation: new Map<string, number>(),
      topicsCovered: new Set<string>(),
      questionsAsked: 0,
      collaborativeExchanges: 0
    }
    
    while (conversationActive && turnCount < config.maxDiscussionTurns) {
      try {
        // Generate response from current speaker
        const response = await generateStakeholderResponse(currentSpeaker, userMessage, currentMessages, 'discussion')
        const responseMessage = createResponseMessage(currentSpeaker, response, turnCount)
        
        // Update conversation metrics
        updateConversationMetrics(conversationMetrics, currentSpeaker, response)
        
        // Add message to conversation
        currentMessages = [...currentMessages, responseMessage]
        setMessages(currentMessages)
        
        // Play audio response and wait for it to finish - FIXED: Ensure proper audio playback
        try {
          await playMessageAudio(responseMessage.id, response, currentSpeaker, true)
        } catch (audioError) {
          console.warn('Audio playback failed, continuing without audio:', audioError)
        }
        
        // Enhanced handoff detection with context
        const handoffTarget = await detectIntelligentHandoff(response, currentSpeaker, currentMessages)
        
        if (handoffTarget) {
          // Natural delay before next person speaks
          const handoffPause = config.handoffPauseTiming.base + Math.random() * config.handoffPauseTiming.variance
          await new Promise(resolve => setTimeout(resolve, handoffPause))
          
          // Generate contextual handoff response
          const handoffResponse = await generateHandoffResponse(handoffTarget, currentSpeaker, response, currentMessages)
          
          if (handoffResponse) {
            const handoffMessage = createResponseMessage(handoffTarget, handoffResponse, turnCount + 1)
            
            currentMessages = [...currentMessages, handoffMessage]
            setMessages(currentMessages)
            
            // Update metrics
            conversationMetrics.collaborativeExchanges++
            updateConversationMetrics(conversationMetrics, handoffTarget, handoffResponse)
            
            // Play audio for the handoff response - FIXED: Ensure proper audio playback
            try {
              await playMessageAudio(handoffMessage.id, handoffResponse, handoffTarget, true)
            } catch (audioError) {
              console.warn('Audio playback failed, continuing without audio:', audioError)
            }
            
            currentSpeaker = handoffTarget
            turnCount += 2
            continue
          }
        }
        
        // Check if conversation should naturally end
        const shouldEnd = evaluateConversationCompletion(response, conversationMetrics, turnCount)
        if (shouldEnd) {
          conversationActive = false
          break
        }
        
        turnCount++
        
      } catch (error) {
        console.error('Error in conversation flow:', error)
        conversationActive = false
      }
    }
    
    // Log conversation quality metrics for analytics
    console.log('Conversation Quality Metrics:', conversationMetrics)
  }

  const updateConversationMetrics = (metrics: any, stakeholder: any, response: string) => {
    // Update stakeholder participation
    const currentCount = metrics.stakeholderParticipation.get(stakeholder.id) || 0
    metrics.stakeholderParticipation.set(stakeholder.id, currentCount + 1)
    
    // Detect topics covered
    const topicKeywords = ['process', 'system', 'customer', 'cost', 'quality', 'efficiency', 'timeline']
    topicKeywords.forEach(topic => {
      if (response.toLowerCase().includes(topic)) {
        metrics.topicsCovered.add(topic)
      }
    })
    
    // Count questions asked
    const questionCount = (response.match(/\?/g) || []).length
    metrics.questionsAsked += questionCount
  }

  const detectIntelligentHandoff = async (response: string, currentSpeaker: any, conversationHistory: Message[]) => {
    const aiService = AIService.getInstance()
    
    // Get available stakeholders (excluding current speaker)
    const availableStakeholders = selectedStakeholders
      .filter(s => s.id !== currentSpeaker.id)
      .map(s => ({
        name: s.name,
        role: s.role,
        department: s.department,
        priorities: s.priorities,
        personality: s.personality,
        expertise: s.expertise || []
      }))
    
    // Use AI service for handoff detection
    const handoffTarget = await aiService.detectConversationHandoff(response, availableStakeholders)
    
    if (handoffTarget) {
      return selectedStakeholders.find(s => s.name === handoffTarget.name)
    }
    
    return null
  }

  const generateHandoffResponse = async (targetStakeholder: any, previousSpeaker: any, previousResponse: string, conversationHistory: Message[]) => {
    // Extract the key question or topic from the handoff
    const handoffContext = extractHandoffContext(previousResponse)
    const contextualPrompt = `${previousSpeaker.name} just mentioned: "${handoffContext}" and is asking for your perspective.`
    
    return await generateStakeholderResponse(targetStakeholder, contextualPrompt, conversationHistory, 'discussion')
  }

  const extractHandoffContext = (response: string): string => {
    // Extract the most relevant part of the response for handoff context
    const sentences = response.split(/[.!?]/)
    const lastSentence = sentences[sentences.length - 2]?.trim() || sentences[sentences.length - 1]?.trim()
    
    if (lastSentence && lastSentence.length > 10) {
      return lastSentence
    }
    
    return response.substring(0, 100) + '...'
  }

  const evaluateConversationCompletion = (response: string, metrics: any, turnCount: number): boolean => {
    // Evaluate if conversation has reached natural completion
    const completionSignals = [
      'that covers everything',
      'i think we\'re good',
      'sounds like a plan',
      'let me know if you need',
      'feel free to reach out'
    ]
    
    const hasCompletionSignal = completionSignals.some(signal => 
      response.toLowerCase().includes(signal)
    )
    
    const hasGoodCoverage = metrics.topicsCovered.size >= 3
    const hasBalancedParticipation = metrics.stakeholderParticipation.size >= Math.min(2, selectedStakeholders.length)
    
    return hasCompletionSignal || (hasGoodCoverage && hasBalancedParticipation && turnCount >= 3)
  }

  // Function to get initial respondent for discussion
  const getInitialRespondent = (userMessage: string) => {
    return getContextualStakeholder(userMessage, messages)
  }

  // Handle natural discussion flow with turn-taking
  const handleDiscussionFlow = async (initialStakeholder: any, userMessage: string, currentMessages: Message[]) => {
    await manageConversationFlow(initialStakeholder, userMessage, currentMessages)
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

  // Dynamic timeout and cancellation system
  const createDynamicTimeout = (operation: string, timeoutMs: number) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${operation} timed out after ${timeoutMs}ms`))
      }, timeoutMs)
      
      // Return cleanup function
      return { cleanup: () => clearTimeout(timeout) }
    })
  }

  // Enhanced end meeting with dynamic timeout
  const handleEndMeeting = async () => {
    if (messages.length <= 1) {
      alert('No meaningful conversation to end. Have a discussion with the stakeholders first to generate comprehensive notes.');
      return;
    }

    const isConfirmed = window.confirm(
      'Are you sure you want to end this meeting? This will generate comprehensive interview notes with analytics and end the current session.'
    );

    if (!isConfirmed) return;

    setIsLoading(true);
    setIsEndingMeeting(true);

    // Dynamic timeout based on conversation complexity
    const messageCount = messages.length
    const participantCount = selectedStakeholders.length
    const baseTimeout = 30000 // 30 seconds base
    const complexityFactor = Math.min(2.0, (messageCount / 20) + (participantCount / 5))
    const dynamicTimeout = baseTimeout * complexityFactor

    console.log(`Setting dynamic timeout for meeting end: ${dynamicTimeout}ms based on ${messageCount} messages and ${participantCount} participants`)

    try {
      // Stop any current audio
      stopCurrentAudio();

      const meetingStartTime = new Date(messages[0]?.timestamp || new Date().toISOString());
      const meetingEndTime = new Date();
      const duration = Math.round((meetingEndTime.getTime() - meetingStartTime.getTime()) / 1000 / 60);

      // Enhanced meeting data with analytics
      const meetingData = {
        project: {
          name: selectedProject?.name || 'Current Project',
          description: selectedProject?.description || '',
          type: selectedProject?.projectType || 'General'
        },
        participants: selectedStakeholders.map(s => ({
          name: s.name,
          role: s.role,
          department: s.department,
          engagementLevel: meetingAnalytics.stakeholderEngagementLevels.get(s.id) || 'medium',
          participationPercentage: Math.round(meetingAnalytics.participationBalance.get(s.id) || 0)
        })),
        messages: messages.filter(m => m.speaker !== 'system'),
        startTime: meetingStartTime,
        endTime: meetingEndTime,
        duration,
        user: user?.email || 'Business Analyst',
        analytics: {
          effectivenessScore: meetingAnalytics.meetingEffectivenessScore,
          collaborationIndex: meetingAnalytics.collaborationIndex,
          topicsDiscussed: Array.from(meetingAnalytics.topicsDiscussed),
          keyInsights: meetingAnalytics.keyInsights,
          conversationFlow: meetingAnalytics.conversationFlow
        }
      };

      const aiService = AIService.getInstance();
      
      // Create AI generation promise with timeout
      const aiGenerationPromise = aiService.generateInterviewNotes(meetingData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Interview notes generation timed out')), dynamicTimeout)
      );

      // Race between AI generation and timeout
      let baseInterviewNotes;
      try {
        baseInterviewNotes = await Promise.race([aiGenerationPromise, timeoutPromise]);
      } catch (timeoutError) {
        console.warn('AI generation timed out, creating fallback notes:', timeoutError);
        baseInterviewNotes = createFallbackNotes(meetingData);
      }
      
      // Enhanced interview notes with analytics
      const analyticsSection = generateMeetingAnalyticsSummary();
      const enhancedInterviewNotes = `${baseInterviewNotes}

---

${analyticsSection}

---

## Meeting Quality Assessment

**Overall Meeting Effectiveness**: ${meetingAnalytics.meetingEffectivenessScore}/100

### Strengths
${meetingAnalytics.keyInsights.filter(insight => 
  insight.includes('Excellent') || insight.includes('Great') || insight.includes('Active')
).map(insight => `• ${insight}`).join('\n') || '• Good stakeholder engagement and participation'}

### Areas for Improvement
${meetingAnalytics.keyInsights.filter(insight => 
  insight.includes('Consider') || insight.includes('Limited') || insight.includes('suggest')
).map(insight => `• ${insight}`).join('\n') || '• Continue to maintain current engagement levels'}

### Recommendations for Future Meetings
${generateMeetingRecommendations()}

---

*This enhanced interview summary includes AI-powered analytics to help improve future stakeholder meetings and requirements gathering sessions.*`;

      // Create notes object with analytics
      const notesObject = {
        id: `meeting-${Date.now()}`,
        title: `Enhanced Interview Notes: ${selectedProject?.name} - ${meetingEndTime.toLocaleDateString()}`,
        content: enhancedInterviewNotes,
        projectId: selectedProject?.id || 'unknown',
        meetingType: 'stakeholder-interview',
        participants: selectedStakeholders.map(s => s.name).join(', '),
        date: meetingEndTime.toISOString(),
        duration: `${duration} minutes`,
        createdBy: user?.email || 'Business Analyst',
        analytics: {
          effectivenessScore: meetingAnalytics.meetingEffectivenessScore,
          collaborationIndex: meetingAnalytics.collaborationIndex,
          topicsDiscussed: Array.from(meetingAnalytics.topicsDiscussed),
          participationBalance: Object.fromEntries(meetingAnalytics.participationBalance),
          keyInsights: meetingAnalytics.keyInsights
        }
      };

      // Save to localStorage
      const existingNotes = JSON.parse(localStorage.getItem('meetingNotes') || '[]');
      existingNotes.push(notesObject);
      localStorage.setItem('meetingNotes', JSON.stringify(existingNotes));

      // Show success notification
      setMeetingEndedSuccess(true);
      
      // Navigate to notes view
      setTimeout(() => {
        setCurrentView('notes');
      }, 2000);

    } catch (error) {
      console.error('Error ending meeting:', error);
      alert('Error generating meeting notes. The meeting has been saved with available data.');
      // Still try to save basic notes even if AI generation fails
      const basicNotes = createFallbackNotes({
        project: { name: selectedProject?.name || 'Current Project' },
        participants: selectedStakeholders,
        messages: messages.filter(m => m.speaker !== 'system'),
        duration: 0
      });
      
      const basicNotesObject = {
        id: `meeting-${Date.now()}`,
        title: `Basic Meeting Notes: ${selectedProject?.name} - ${new Date().toLocaleDateString()}`,
        content: basicNotes,
        projectId: selectedProject?.id || 'unknown',
        meetingType: 'stakeholder-interview',
        participants: selectedStakeholders.map(s => s.name).join(', '),
        date: new Date().toISOString(),
        duration: '0 minutes',
        createdBy: user?.email || 'Business Analyst'
      };
      
      const existingNotes = JSON.parse(localStorage.getItem('meetingNotes') || '[]');
      existingNotes.push(basicNotesObject);
      localStorage.setItem('meetingNotes', JSON.stringify(existingNotes));
      
      setCurrentView('notes');
    } finally {
      setIsLoading(false);
      setIsEndingMeeting(false);
    }
  }

  // Dynamic fallback notes creation
  const createFallbackNotes = (meetingData: any): string => {
    const participantList = meetingData.participants.map((p: any) => `- ${p.name} (${p.role})`).join('\n');
    const messageCount = meetingData.messages?.length || 0;
    const projectName = meetingData.project?.name || 'Unknown Project';
    
    return `# Meeting Notes: ${projectName}

## Meeting Overview
- **Date**: ${new Date().toLocaleDateString()}
- **Duration**: ${meetingData.duration || 'Unknown'} minutes
- **Participants**: ${meetingData.participants?.length || 0} stakeholders
- **Messages Exchanged**: ${messageCount}

## Participants
${participantList}

## Conversation Summary
This meeting included ${messageCount} exchanges between the business analyst and stakeholders. 

${messageCount > 0 ? 'Key discussion points and stakeholder perspectives were captured during the session.' : 'No detailed conversation was recorded.'}

## Technical Note
These notes were generated using a fallback system due to extended AI processing time. For more detailed analysis, consider reviewing the conversation transcript manually.

---
*Generated automatically on ${new Date().toLocaleString()}*`;
  }

  // User interruption controls
  const handleUserInterruption = () => {
    setUserInterruptRequested(true)
    stopCurrentAudio()
    setCanUserType(true)
  }

     // Add escape key listener for interruption
   useEffect(() => {
     const handleEscapeKey = (event: KeyboardEvent) => {
       if (event.key === 'Escape') {
         handleUserInterruption()
       }
     }

     document.addEventListener('keydown', handleEscapeKey)
     return () => document.removeEventListener('keydown', handleEscapeKey)
   }, [])

   const generateMeetingRecommendations = (): string => {
     const recommendations: string[] = [];
     
     // Based on participation balance
     const participationValues = Array.from(meetingAnalytics.participationBalance.values());
     const maxParticipation = Math.max(...participationValues);
     const minParticipation = Math.min(...participationValues);
     
     if (maxParticipation - minParticipation > 40) {
       recommendations.push('• Use facilitation techniques to encourage quieter stakeholders to share their perspectives');
       recommendations.push('• Consider using round-robin or structured discussion formats for more balanced participation');
     }
     
     // Based on collaboration index
     if (meetingAnalytics.collaborationIndex < 40) {
       recommendations.push('• Encourage more cross-stakeholder dialogue by asking stakeholders to build on each other\'s ideas');
       recommendations.push('• Use collaborative exercises or group problem-solving activities');
     }
     
     // Based on topic coverage
     if (meetingAnalytics.topicsDiscussed.size < 4) {
       recommendations.push('• Use a structured agenda to ensure comprehensive topic coverage');
       recommendations.push('• Prepare topic-specific questions to guide the conversation more effectively');
     }
     
     // Based on engagement levels
     const lowEngagementCount = Array.from(meetingAnalytics.stakeholderEngagementLevels.values())
       .filter(level => level === 'low').length;
     
     if (lowEngagementCount > 1) {
       recommendations.push('• Send pre-meeting materials to help stakeholders prepare for more meaningful participation');
       recommendations.push('• Consider shorter, more focused meetings to maintain engagement');
     }
     
     // Default recommendations if no specific issues
     if (recommendations.length === 0) {
       recommendations.push('• Continue with current meeting approach - good stakeholder engagement observed');
       recommendations.push('• Consider documenting best practices from this meeting for future sessions');
     }
     
         return recommendations.join('\n');
  }

  // Enhanced audio management system
  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
      setPlayingMessageId(null)
      setCurrentSpeaker(null)
      setIsAudioPlaying(false)
      setCurrentlyProcessingAudio(null)
      setAudioPausedPosition(0)
    }
  }

  const pauseCurrentAudio = () => {
    if (currentAudio && isAudioPlaying) {
      setAudioPausedPosition(currentAudio.currentTime)
      currentAudio.pause()
      setIsAudioPlaying(false)
      setAudioStates(prev => ({ ...prev, [currentlyProcessingAudio || '']: 'paused' }))
    }
  }

         const resumeCurrentAudio = () => {
      if (currentAudio && !isAudioPlaying) {
        currentAudio.currentTime = audioPausedPosition
        currentAudio.play()
        setIsAudioPlaying(true)
        setAudioStates(prev => ({ ...prev, [currentlyProcessingAudio || '']: 'playing' }))
      }
    }

    // Dynamic, non-blocking audio playback
    const playMessageAudio = async (messageId: string, text: string, stakeholder: any, autoPlay: boolean = true): Promise<void> => {
      console.log('Audio playback attempt:', { messageId, stakeholder: stakeholder.name, globalAudioEnabled, autoPlay })
      
      if (!globalAudioEnabled || !isStakeholderVoiceEnabled(stakeholder.id)) {
        console.log('Audio disabled for stakeholder:', stakeholder.name)
        return Promise.resolve()
      }

      try {
        if (userInterruptRequested) {
          console.log('User interrupted audio, skipping playback')
          setUserInterruptRequested(false)
          return Promise.resolve()
        }

        stopCurrentAudio()
        
        if (!autoPlay) {
          return Promise.resolve()
        }

        setCurrentSpeaker(stakeholder)
        setCurrentlyProcessingAudio(messageId)
        setIsAudioPlaying(true)

        const voiceName = getStakeholderVoice(stakeholder.id, stakeholder.role)
        console.log('Using voice:', voiceName, 'for stakeholder:', stakeholder.name)
        
        if (isAzureTTSAvailable()) {
          console.log('Using Azure TTS for audio synthesis')
          const audioBlob = await azureTTS.synthesizeSpeech(text, voiceName)
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)
          
          setCurrentAudio(audio)
          setPlayingMessageId(messageId)
          setAudioStates(prev => ({ ...prev, [messageId]: 'playing' }))
          
          return new Promise((resolve) => {
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl)
              setCurrentAudio(null)
              setPlayingMessageId(null)
              setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
              setCurrentSpeaker(null)
              setIsAudioPlaying(false)
              setCurrentlyProcessingAudio(null)
              resolve()
            }
            
            audio.onerror = (error) => {
              console.error('Audio element error:', error)
              URL.revokeObjectURL(audioUrl)
              setCurrentAudio(null)
              setPlayingMessageId(null)
              setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
              setCurrentSpeaker(null)
              setIsAudioPlaying(false)
              setCurrentlyProcessingAudio(null)
              resolve()
            }
            
            audio.play().then(() => {
              // Audio started successfully
            }).catch((playError) => {
              console.error('Audio play error:', playError)
              URL.revokeObjectURL(audioUrl)
              setCurrentAudio(null)
              setPlayingMessageId(null)
              setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
              setCurrentSpeaker(null)
              setIsAudioPlaying(false)
              setCurrentlyProcessingAudio(null)
              resolve()
            })
          })
        } else {
          console.log('Using browser TTS for audio synthesis')
          setPlayingMessageId(messageId)
          setAudioStates(prev => ({ ...prev, [messageId]: 'playing' }))
          
          await playBrowserTTS(text)
          
          setPlayingMessageId(null)
          setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
          setCurrentSpeaker(null)
          setIsAudioPlaying(false)
          setCurrentlyProcessingAudio(null)
          return Promise.resolve()
        }
      } catch (error) {
        console.error('Audio playback failed:', error)
        setPlayingMessageId(null)
        setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
        setCurrentSpeaker(null)
        setIsAudioPlaying(false)
        setCurrentlyProcessingAudio(null)
        return Promise.resolve()
      }
    }

    // Enhanced toggle audio with proper pause/resume
   const toggleMessageAudio = async (messageId: string, text: string, stakeholder: any) => {
     if (playingMessageId === messageId && isAudioPlaying) {
       pauseCurrentAudio()
     } else if (playingMessageId === messageId && !isAudioPlaying) {
       resumeCurrentAudio()
     } else {
       await playMessageAudio(messageId, text, stakeholder, true)
     }
   }

       const stopMessageAudio = (messageId: string) => {
      if (playingMessageId === messageId) {
        stopCurrentAudio()
      }
      setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
      setCanUserType(true)
    }

  // Old hard-coded greeting flow removed - replaced by dynamic handleAdaptiveGreeting

  // Dynamic stakeholder response processing - NO HARD-CODING
  const processDynamicStakeholderResponse = async (stakeholder: any, messageContent: string, currentMessages: Message[], responseContext: string) => {
    try {
      // Dynamic thinking state management
      addStakeholderToThinking(stakeholder.id)
      
      // Generate dynamic thinking message based on actual user question context
      const thinkingContext = {
        stakeholder,
        messageContent,
        conversationHistory: currentMessages,
        responseContext
      }
      const thinkingMessage = generateThinkingMessage(stakeholder, thinkingContext)
      setDynamicFeedback(thinkingMessage)
      
      // Generate contextual response using AI service
      const response = await generateStakeholderResponse(stakeholder, messageContent, currentMessages, responseContext)
      
      // Clean up thinking state
      removeStakeholderFromThinking(stakeholder.id)
      setDynamicFeedback(null)
      
      // Create and add message with dynamic indexing
      const responseMessage = createResponseMessage(stakeholder, response, currentMessages.length)
      const updatedMessages = [...currentMessages, responseMessage]
      setMessages(updatedMessages)
      
      // Dynamic audio handling based on user preferences and context
      if (globalAudioEnabled && isStakeholderVoiceEnabled(stakeholder.id)) {
        playMessageAudio(responseMessage.id, response, stakeholder, true).catch(console.warn)
      }
      
      return updatedMessages
    } catch (error) {
      console.error('Error processing stakeholder response:', error)
      removeStakeholderFromThinking(stakeholder.id)
      setDynamicFeedback(null)
      throw error
    }
  }

  // Dynamic discussion flow management - NO HARD-CODING
  const handleAdaptiveDiscussion = async (messageContent: string, currentMessages: Message[]) => {
    // Dynamic context analysis for response strategy
    const context = {
      messageContent,
      conversationHistory: currentMessages,
      stakeholders: selectedStakeholders,
      currentPhase: conversationDynamics.phase
    }
    
    // Dynamic primary respondent selection
    const primaryRespondent = selectContextualRespondent(messageContent, currentMessages)
    
    if (primaryRespondent) {
      await processDynamicStakeholderResponse(primaryRespondent, messageContent, currentMessages, 'discussion_primary')
      
      // Dynamic assessment of follow-up need
      const followUpAssessment = await assessFollowUpNeed(messageContent, currentMessages, primaryRespondent)
      
      if (followUpAssessment.shouldFollowUp) {
        // Dynamic delay calculation for follow-up
        const followUpDelay = calculateDynamicPause({ 
          ...context, 
          stakeholder: primaryRespondent,
          followUpContext: followUpAssessment 
        })
        
        setTimeout(async () => {
          const followUpStakeholder = selectDynamicFollowUp(messageContent, currentMessages, primaryRespondent, followUpAssessment)
          if (followUpStakeholder) {
            await processDynamicStakeholderResponse(followUpStakeholder, messageContent, currentMessages, 'discussion_followup')
          }
        }, followUpDelay)
      }
    }
  }

  // Old hard-coded selection functions removed - replaced by dynamic versions

     // Dynamic conversation handler - NO HARD-CODING
   const handleSendMessage = async () => {
     if (!inputMessage.trim() || isEndingMeeting) return

     setIsGeneratingResponse(true)
     setCanUserType(false)
     
     const messageContent = inputMessage.trim()
     setInputMessage('')

     const userMessage: Message = {
       id: `user-${Date.now()}`,
       speaker: 'user',
       content: messageContent,
       timestamp: new Date().toISOString()
     }

     let currentMessages = [...messages, userMessage]
     setMessages(currentMessages)

     try {
       // Dynamic conversation type detection
       const isGroup = isGroupMessage(messageContent)
       const isGreeting = isSimpleGreeting(messageContent)
       
       if (isGroup && isGreeting) {
         await handleAdaptiveGreeting(messageContent, currentMessages)
       } else {
         await handleAdaptiveDiscussion(messageContent, currentMessages)
       }
     } catch (error) {
       console.error('Error generating AI response:', error)
       await handleFallbackResponse(currentMessages)
     } finally {
       setIsGeneratingResponse(false)
       setCanUserType(true)
     }
   }

     // Dynamic per-stakeholder audio management - NO HARD-CODING
   const stopStakeholderAudio = (stakeholderId: string) => {
     // Stop audio for this specific stakeholder dynamically
     const messageElements = document.querySelectorAll(`[data-stakeholder-id="${stakeholderId}"]`)
     messageElements.forEach(element => {
       const messageId = element.getAttribute('data-message-id')
       if (messageId && playingMessageId === messageId) {
         stopCurrentAudio()
       }
     })
     
     // Remove from dynamic thinking state if they were thinking
     removeStakeholderFromThinking(stakeholderId)
   }

 // Enhanced fallback response
 const handleFallbackResponse = async (currentMessages: Message[]) => {
   const fallbackStakeholder = selectedStakeholders[0] || { name: 'Stakeholder', role: 'Team Member' }
   const fallbackResponse = `I apologize, but I'm having some technical difficulties. Could you please rephrase your question?`
   
   const fallbackMessage = createResponseMessage(fallbackStakeholder, fallbackResponse, 0)
   setMessages(prev => [...prev, fallbackMessage])
 }

 // Enhanced meeting analytics
  const [meetingAnalytics, setMeetingAnalytics] = useState({
    participationBalance: new Map<string, number>(),
    topicsDiscussed: new Set<string>(),
    questionTypes: new Map<string, number>(),
    collaborationIndex: 0,
    meetingEffectivenessScore: 0,
    keyInsights: [] as string[],
    stakeholderEngagementLevels: new Map<string, 'low' | 'medium' | 'high'>(),
    conversationFlow: [] as { speaker: string, timestamp: string, topic: string }[]
  })

  // Update analytics when messages change
  useEffect(() => {
    if (messages.length > 1) {
      updateMeetingAnalytics()
    }
  }, [messages])

  const updateMeetingAnalytics = () => {
    const aiService = AIService.getInstance()
    
    // Get AI service analytics
    const aiAnalytics = aiService.getConversationAnalytics()
    
    // Traditional analytics
    const stakeholderMessages = messages.filter(m => m.speaker !== 'user' && m.speaker !== 'system')
    const totalMessages = stakeholderMessages.length
    
    if (totalMessages === 0) return

    // Use AI service data where available, fallback to traditional calculation
    const participationBalance = new Map<string, number>()
    selectedStakeholders.forEach(stakeholder => {
      const messageCount = stakeholderMessages.filter(m => m.speaker === stakeholder.id).length
      participationBalance.set(stakeholder.id, (messageCount / totalMessages) * 100)
    })

    // Use AI service topics if available
    const topicsDiscussed = aiAnalytics.topicsDiscussed.length > 0 
      ? new Set(aiAnalytics.topicsDiscussed)
      : new Set<string>()

    // If AI service has no topics, use traditional detection
    if (topicsDiscussed.size === 0) {
      const topicKeywords = {
        'Process': ['process', 'workflow', 'procedure', 'steps'],
        'Technology': ['system', 'software', 'technical', 'integration'],
        'Cost': ['cost', 'budget', 'expense', 'financial'],
        'Quality': ['quality', 'standards', 'performance', 'excellence'],
        'Timeline': ['timeline', 'schedule', 'deadline', 'timing'],
        'Resources': ['resources', 'staff', 'team', 'personnel'],
        'Customers': ['customer', 'user', 'client', 'service'],
        'Compliance': ['compliance', 'regulatory', 'policy', 'audit'],
        'Training': ['training', 'education', 'learning', 'skills'],
        'Communication': ['communication', 'feedback', 'information', 'reporting']
      }

      stakeholderMessages.forEach(msg => {
        const content = msg.content.toLowerCase()
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
          if (keywords.some(keyword => content.includes(keyword))) {
            topicsDiscussed.add(topic)
          }
        })
      })
    }

    // Rest of analytics calculation remains the same...
    const questionTypes = new Map<string, number>()
    const questionPatterns = {
      'Clarification': ['what do you mean', 'can you explain', 'clarify', 'could you elaborate'],
      'Information': ['what', 'how', 'when', 'where', 'who', 'which'],
      'Opinion': ['what do you think', 'your opinion', 'your perspective', 'your view'],
      'Confirmation': ['is that correct', 'right', 'confirm', 'verify'],
      'Action': ['what should we do', 'how do we', 'what\'s the next step', 'how can we']
    }

    messages.filter(m => m.speaker === 'user').forEach(msg => {
      const content = msg.content.toLowerCase()
      Object.entries(questionPatterns).forEach(([type, patterns]) => {
        if (patterns.some(pattern => content.includes(pattern))) {
          questionTypes.set(type, (questionTypes.get(type) || 0) + 1)
        }
      })
    })

    const handoffCount = calculateHandoffCount(stakeholderMessages)
    const collaborationIndex = Math.min(100, (handoffCount / Math.max(1, totalMessages - 1)) * 100)

    const balanceScore = calculateParticipationBalance(participationBalance)
    const topicScore = Math.min(100, (topicsDiscussed.size / 10) * 100)
    const engagementScore = calculateEngagementScore(stakeholderMessages)
    const meetingEffectivenessScore = Math.round((balanceScore + topicScore + engagementScore) / 3)

    const keyInsights = generateKeyInsights(participationBalance, topicsDiscussed, questionTypes, collaborationIndex)

    // Use AI service stakeholder states for engagement levels
    const stakeholderEngagementLevels = new Map<string, 'low' | 'medium' | 'high'>()
    selectedStakeholders.forEach(stakeholder => {
      const aiStakeholderState = aiAnalytics.stakeholderStates[stakeholder.name]
      
      if (aiStakeholderState) {
        // Use AI service emotional state to determine engagement
        const engagement = aiStakeholderState.emotionalState === 'excited' ? 'high' :
                          aiStakeholderState.emotionalState === 'engaged' ? 'medium' : 'low'
        stakeholderEngagementLevels.set(stakeholder.id, engagement)
      } else {
        // Fallback to traditional calculation
        const participation = participationBalance.get(stakeholder.id) || 0
        const messageCount = stakeholderMessages.filter(m => m.speaker === stakeholder.id).length
        const avgWordsPerMessage = calculateAvgWordsPerMessage(stakeholder.id, stakeholderMessages)
        
        let level: 'low' | 'medium' | 'high' = 'low'
        if (participation > 25 && messageCount > 2 && avgWordsPerMessage > 30) {
          level = 'high'
        } else if (participation > 15 && messageCount > 1 && avgWordsPerMessage > 20) {
          level = 'medium'
        }
        
        stakeholderEngagementLevels.set(stakeholder.id, level)
      }
    })

    // Build conversation flow using AI service data if available
    const conversationFlow = stakeholderMessages.map(msg => ({
      speaker: msg.stakeholderName || 'Unknown',
      timestamp: msg.timestamp,
      topic: identifyMessageTopic(msg.content, {
        'Process': ['process', 'workflow', 'procedure', 'steps'],
        'Technology': ['system', 'software', 'technical', 'integration'],
        'Cost': ['cost', 'budget', 'expense', 'financial'],
        'Quality': ['quality', 'standards', 'performance', 'excellence'],
        'Timeline': ['timeline', 'schedule', 'deadline', 'timing'],
        'Resources': ['resources', 'staff', 'team', 'personnel'],
        'Customers': ['customer', 'user', 'client', 'service'],
        'Compliance': ['compliance', 'regulatory', 'policy', 'audit'],
        'Training': ['training', 'education', 'learning', 'skills'],
        'Communication': ['communication', 'feedback', 'information', 'reporting']
      })
    }))

    setMeetingAnalytics({
      participationBalance,
      topicsDiscussed,
      questionTypes,
      collaborationIndex,
      meetingEffectivenessScore,
      keyInsights,
      stakeholderEngagementLevels,
      conversationFlow
    })
  }

  const calculateHandoffCount = (stakeholderMessages: Message[]): number => {
    let handoffCount = 0
    for (let i = 0; i < stakeholderMessages.length - 1; i++) {
      if (stakeholderMessages[i].speaker !== stakeholderMessages[i + 1].speaker) {
        handoffCount++
      }
    }
    return handoffCount
  }

  const calculateParticipationBalance = (participationMap: Map<string, number>): number => {
    const participationValues = Array.from(participationMap.values())
    const idealParticipation = 100 / selectedStakeholders.length
    
    const deviations = participationValues.map(p => Math.abs(p - idealParticipation))
    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length
    
    return Math.max(0, 100 - (avgDeviation * 2))
  }

  const calculateEngagementScore = (stakeholderMessages: Message[]): number => {
    const totalWords = stakeholderMessages.reduce((sum, msg) => sum + msg.content.split(' ').length, 0)
    const avgWordsPerMessage = totalWords / Math.max(1, stakeholderMessages.length)
    
    // Score based on message length and frequency
    const lengthScore = Math.min(100, (avgWordsPerMessage / 50) * 100)
    const frequencyScore = Math.min(100, (stakeholderMessages.length / 10) * 100)
    
    return Math.round((lengthScore + frequencyScore) / 2)
  }

  const calculateAvgWordsPerMessage = (stakeholderId: string, stakeholderMessages: Message[]): number => {
    const messages = stakeholderMessages.filter(m => m.speaker === stakeholderId)
    if (messages.length === 0) return 0
    
    const totalWords = messages.reduce((sum, msg) => sum + msg.content.split(' ').length, 0)
    return totalWords / messages.length
  }

  const identifyMessageTopic = (content: string, topicKeywords: any): string => {
    const contentLower = content.toLowerCase()
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if ((keywords as string[]).some(keyword => contentLower.includes(keyword))) {
        return topic
      }
    }
    
    return 'General'
  }

  const generateKeyInsights = (
    participationBalance: Map<string, number>,
    topicsDiscussed: Set<string>,
    questionTypes: Map<string, number>,
    collaborationIndex: number
  ): string[] => {
    const insights: string[] = []
    
    // Participation insights
    const participationValues = Array.from(participationBalance.values())
    const maxParticipation = Math.max(...participationValues)
    const minParticipation = Math.min(...participationValues)
    
    if (maxParticipation - minParticipation > 40) {
      insights.push('Consider encouraging more balanced participation - some stakeholders are dominating the conversation')
    }
    
    if (collaborationIndex > 70) {
      insights.push('Excellent collaboration - stakeholders are effectively building on each other\'s ideas')
    } else if (collaborationIndex < 30) {
      insights.push('Limited cross-stakeholder interaction - consider facilitating more collaborative dialogue')
    }
    
    // Topic coverage insights
    if (topicsDiscussed.size > 6) {
      insights.push('Great topic coverage - multiple important areas have been discussed')
    } else if (topicsDiscussed.size < 3) {
      insights.push('Consider exploring more diverse topics to ensure comprehensive requirements gathering')
    }
    
    // Question type insights
    const totalQuestions = Array.from(questionTypes.values()).reduce((sum, count) => sum + count, 0)
    if (totalQuestions > 5) {
      insights.push('Active questioning approach - good for thorough requirements gathering')
    }
    
    const clarificationQuestions = questionTypes.get('Clarification') || 0
    if (clarificationQuestions > 2) {
      insights.push('Multiple clarification requests suggest need for clearer communication')
    }
    
    return insights.slice(0, 3) // Limit to top 3 insights
  }

  // Enhanced meeting summary with analytics
  const generateMeetingAnalyticsSummary = (): string => {
    const analytics = meetingAnalytics
    const duration = Math.round((Date.now() - new Date(messages[0]?.timestamp || new Date()).getTime()) / 1000 / 60)
    
    return `
## Meeting Analytics Summary

**Duration**: ${duration} minutes
**Effectiveness Score**: ${analytics.meetingEffectivenessScore}/100
**Collaboration Index**: ${Math.round(analytics.collaborationIndex)}%

### Participation Balance
${Array.from(analytics.participationBalance.entries())
  .map(([stakeholderId, percentage]) => {
    const stakeholder = selectedStakeholders.find(s => s.id === stakeholderId)
    return `- ${stakeholder?.name}: ${Math.round(percentage)}%`
  })
  .join('\n')}

### Topics Covered (${analytics.topicsDiscussed.size})
${Array.from(analytics.topicsDiscussed).join(', ')}

### Key Insights
${analytics.keyInsights.map(insight => `• ${insight}`).join('\n')}

### Stakeholder Engagement Levels
${Array.from(analytics.stakeholderEngagementLevels.entries())
  .map(([stakeholderId, level]) => {
    const stakeholder = selectedStakeholders.find(s => s.id === stakeholderId)
    return `- ${stakeholder?.name}: ${level.toUpperCase()}`
  })
  .join('\n')}
`
  }

  // Dynamic conversation state management - NO HARD-CODING
  const [conversationDynamics, setConversationDynamics] = useState({
    phase: 'adaptive', // Dynamically determined based on conversation flow
    leadSpeaker: null as any, // Dynamically selected based on seniority/context
    responseOrder: [] as any[], // Dynamic order based on expertise and participation
    greetingIterations: 0,
    introducedMembers: new Set<string>(),
    contextualResponses: new Map<string, boolean>()
  })

  // Dynamic thinking indicators - context-aware messaging
  const [activeThinking, setActiveThinking] = useState<Set<string>>(new Set())
  const [dynamicFeedback, setDynamicFeedback] = useState<string | null>(null)

  // Dynamic stakeholder thinking management
  const addStakeholderToThinking = (stakeholderId: string) => {
    setActiveThinking(prev => new Set(prev).add(stakeholderId))
  }

  const removeStakeholderFromThinking = (stakeholderId: string) => {
    setActiveThinking(prev => {
      const updated = new Set(prev)
      updated.delete(stakeholderId)
      return updated
    })
  }

  // Dynamic contextually-aligned thinking message generator
  const generateThinkingMessage = (stakeholder: any, context: any) => {
    const aiService = AIService.getInstance()
    const analytics = aiService.getConversationAnalytics()
    
    // Extract user question content and context
    const userQuestion = context.messageContent || ''
    const conversationHistory = context.conversationHistory || []
    const responseContext = context.responseContext || ''
    
    // Analyze question content for key topics and themes
    const questionAnalysis = analyzeQuestionContent(userQuestion)
    const stakeholderExpertise = mapStakeholderExpertise(stakeholder)
    
    // Generate contextually aligned thinking message
    const contextualMessage = generateContextualThinkingMessage(
      questionAnalysis,
      stakeholderExpertise,
      stakeholder,
      analytics.conversationPace
    )
    
    return contextualMessage
  }

  // Analyze user question to extract key topics and intent
  const analyzeQuestionContent = (question: string) => {
    const questionLower = question.toLowerCase()
    
    // Extract key topics dynamically
    const topicKeywords = {
      budget: ['budget', 'cost', 'price', 'expense', 'financial', 'money', 'funding', 'investment'],
      timeline: ['timeline', 'schedule', 'deadline', 'when', 'time', 'duration', 'delivery', 'launch'],
      technical: ['technical', 'technology', 'system', 'architecture', 'implementation', 'development', 'code'],
      process: ['process', 'workflow', 'procedure', 'steps', 'method', 'approach', 'how'],
      requirements: ['requirements', 'features', 'functionality', 'specifications', 'needs', 'what'],
      users: ['user', 'customer', 'client', 'experience', 'interface', 'usability', 'feedback'],
      team: ['team', 'resources', 'people', 'staff', 'roles', 'responsibilities', 'collaboration'],
      risks: ['risk', 'challenge', 'problem', 'issue', 'concern', 'difficulty', 'obstacle'],
      goals: ['goal', 'objective', 'target', 'outcome', 'result', 'success', 'achievement'],
      integration: ['integration', 'connect', 'interface', 'api', 'compatibility', 'sync'],
      performance: ['performance', 'speed', 'efficiency', 'optimization', 'scalability', 'capacity'],
      security: ['security', 'privacy', 'protection', 'access', 'authentication', 'authorization'],
      data: ['data', 'database', 'storage', 'information', 'analytics', 'reporting'],
      quality: ['quality', 'testing', 'validation', 'standards', 'compliance', 'review']
    }
    
    // Find matching topics
    const matchedTopics = []
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => questionLower.includes(keyword))) {
        matchedTopics.push(topic)
      }
    }
    
    // Determine question type
    const questionType = questionLower.includes('how') ? 'process' :
                        questionLower.includes('what') ? 'definition' :
                        questionLower.includes('why') ? 'reasoning' :
                        questionLower.includes('when') ? 'timeline' :
                        questionLower.includes('who') ? 'responsibility' :
                        questionLower.includes('where') ? 'location' :
                        'general'
    
    return {
      topics: matchedTopics,
      questionType,
      complexity: question.length > 100 ? 'high' : question.length > 50 ? 'medium' : 'low',
      isSpecific: matchedTopics.length > 0
    }
  }

  // Map stakeholder expertise to response domains
  const mapStakeholderExpertise = (stakeholder: any) => {
    const role = stakeholder.role?.toLowerCase() || ''
    const department = stakeholder.department?.toLowerCase() || ''
    
    const expertiseMap = {
      'technical': ['engineer', 'developer', 'architect', 'technical', 'engineering', 'development'],
      'business': ['manager', 'director', 'executive', 'business', 'operations', 'strategy'],
      'product': ['product', 'design', 'ux', 'ui', 'user', 'customer'],
      'financial': ['financial', 'budget', 'accounting', 'finance', 'cost'],
      'marketing': ['marketing', 'sales', 'communication', 'promotion', 'brand'],
      'operations': ['operations', 'process', 'workflow', 'efficiency', 'logistics'],
      'security': ['security', 'compliance', 'risk', 'audit', 'governance'],
      'data': ['data', 'analytics', 'reporting', 'insights', 'intelligence']
    }
    
    const stakeholderExpertise = []
    for (const [domain, keywords] of Object.entries(expertiseMap)) {
      if (keywords.some(keyword => role.includes(keyword) || department.includes(keyword))) {
        stakeholderExpertise.push(domain)
      }
    }
    
    return stakeholderExpertise.length > 0 ? stakeholderExpertise : ['general']
  }

     // Generate contextually aligned thinking message
   const generateContextualThinkingMessage = (questionAnalysis: any, stakeholderExpertise: any, stakeholder: any, conversationPace: string) => {
     const { topics, questionType, complexity, isSpecific } = questionAnalysis
     const personality = stakeholder.personality || 'collaborative'
     
     // Base thinking patterns by personality and question type
     const thinkingPatterns = {
       analytical: {
         process: ['Analyzing', 'Breaking down', 'Examining', 'Dissecting'],
         definition: ['Defining', 'Clarifying', 'Explaining', 'Detailing'],
         reasoning: ['Evaluating', 'Assessing', 'Reasoning through', 'Analyzing'],
         general: ['Analyzing', 'Examining', 'Evaluating', 'Reviewing', 'Assessing']
       },
       collaborative: {
         process: ['Considering', 'Thinking through', 'Exploring', 'Discussing'],
         definition: ['Thinking about', 'Considering', 'Reflecting on', 'Exploring'],
         reasoning: ['Reflecting on', 'Considering', 'Thinking about', 'Exploring'],
         general: ['Considering', 'Thinking about', 'Reflecting on', 'Discussing', 'Exploring']
       },
       direct: {
         process: ['Addressing', 'Tackling', 'Focusing on', 'Handling'],
         definition: ['Clarifying', 'Explaining', 'Defining', 'Outlining'],
         reasoning: ['Addressing', 'Tackling', 'Focusing on', 'Handling'],
         general: ['Addressing', 'Tackling', 'Focusing on', 'Handling', 'Dealing with']
       },
       strategic: {
         process: ['Strategizing about', 'Planning for', 'Evaluating', 'Considering'],
         definition: ['Defining', 'Outlining', 'Strategizing about', 'Planning'],
         reasoning: ['Evaluating', 'Strategizing about', 'Analyzing', 'Considering'],
         general: ['Evaluating', 'Strategizing about', 'Planning for', 'Considering', 'Analyzing']
       }
     }
     
     // Get appropriate thinking pattern based on personality and question type
     const personalityPatterns = thinkingPatterns[personality] || thinkingPatterns.collaborative
     const patterns = personalityPatterns[questionType] || personalityPatterns.general
     const thinkingPattern = patterns[Math.floor(Math.random() * patterns.length)]
    
    // Generate contextual subject based on question topics and stakeholder expertise
    let subject = ''
    
    if (topics.length > 0) {
      // Find the most relevant topic based on stakeholder expertise
      const relevantTopic = topics.find(topic => 
        stakeholderExpertise.some(expertise => topic.includes(expertise) || expertise.includes(topic))
      ) || topics[0]
      
      // Create contextual subject
      const subjectMap = {
        budget: ['the budget requirements', 'financial implications', 'cost considerations', 'funding needs'],
        timeline: ['the project timeline', 'scheduling requirements', 'delivery expectations', 'timing constraints'],
        technical: ['the technical approach', 'implementation details', 'system architecture', 'technical feasibility'],
        process: ['the workflow process', 'procedural requirements', 'implementation steps', 'process optimization'],
        requirements: ['the requirements', 'feature specifications', 'functional needs', 'project scope'],
        users: ['user experience', 'customer needs', 'user requirements', 'interface design'],
        team: ['team structure', 'resource allocation', 'collaboration approach', 'team dynamics'],
        risks: ['potential risks', 'challenges ahead', 'mitigation strategies', 'risk factors'],
        goals: ['project objectives', 'success criteria', 'target outcomes', 'achievement metrics'],
        integration: ['integration requirements', 'connectivity options', 'system interfaces', 'compatibility needs'],
        performance: ['performance requirements', 'optimization strategies', 'scalability needs', 'efficiency goals'],
        security: ['security considerations', 'protection measures', 'access controls', 'compliance requirements'],
        data: ['data requirements', 'information needs', 'storage solutions', 'data flow'],
        quality: ['quality standards', 'testing approach', 'validation methods', 'quality assurance']
      }
      
      const subjectOptions = subjectMap[relevantTopic] || [`the ${relevantTopic} aspects`, `${relevantTopic} considerations`]
      subject = subjectOptions[Math.floor(Math.random() * subjectOptions.length)]
    } else {
      // Fallback to expertise-based subject
      const expertiseSubjects = {
        technical: ['the technical aspects', 'implementation details', 'system considerations'],
        business: ['the business implications', 'strategic considerations', 'operational aspects'],
        product: ['the product requirements', 'user experience', 'feature considerations'],
        financial: ['the financial aspects', 'budget considerations', 'cost implications'],
        marketing: ['the market implications', 'customer impact', 'positioning aspects'],
        operations: ['the operational requirements', 'process considerations', 'workflow aspects'],
        security: ['the security implications', 'compliance requirements', 'risk factors'],
        data: ['the data requirements', 'information needs', 'analytics aspects'],
        general: ['your question', 'this topic', 'the requirements']
      }
      
      const primaryExpertise = stakeholderExpertise[0] || 'general'
      const subjectOptions = expertiseSubjects[primaryExpertise] || expertiseSubjects.general
      subject = subjectOptions[Math.floor(Math.random() * subjectOptions.length)]
    }
    
         // Add complexity modifier based on question complexity
     const complexityModifier = complexity === 'high' ? 'carefully ' : 
                               complexity === 'medium' ? 'thoroughly ' : ''
     
     // Add conversation pace modifier
     const paceModifier = conversationPace === 'fast' ? '' : 
                         conversationPace === 'slow' ? 'thoughtfully ' : ''
     
     return `${thinkingPattern} ${paceModifier}${complexityModifier}${subject}...`
  }

  // Dynamic lead stakeholder selection
  const selectDynamicLead = (stakeholders: any[], context: any) => {
    const aiService = AIService.getInstance()
    const analytics = aiService.getConversationAnalytics()

    // Dynamic scoring based on multiple factors
    const scoredStakeholders = stakeholders.map(stakeholder => {
      let score = 0
      
      // Seniority factor (dynamic based on role keywords)
      const seniorityKeywords = ['senior', 'lead', 'manager', 'director', 'head', 'principal']
      const roleScore = seniorityKeywords.some(keyword => 
        stakeholder.role.toLowerCase().includes(keyword)) ? 30 : 0
      
      // Participation balance (prefer less active members for variety)
      const participationScore = analytics.participationCounts?.[stakeholder.id] 
        ? Math.max(0, 20 - (analytics.participationCounts[stakeholder.id] * 5)) : 20
      
      // Expertise relevance (dynamic based on last user message)
      const lastUserMessage = context.lastUserMessage || ''
      const expertiseScore = calculateExpertiseRelevance(stakeholder, lastUserMessage)
      
      // Personality fit for leadership
      const personalityScore = stakeholder.personality === 'collaborative' ? 15 : 
                              stakeholder.personality === 'strategic' ? 12 : 
                              stakeholder.personality === 'direct' ? 10 : 8

      score = roleScore + participationScore + expertiseScore + personalityScore
      
      return { stakeholder, score }
    })

    // Return highest scoring stakeholder
    return scoredStakeholders.sort((a, b) => b.score - a.score)[0]?.stakeholder || stakeholders[0]
  }

  // Dynamic expertise relevance calculator
  const calculateExpertiseRelevance = (stakeholder: any, message: string) => {
    const messageLower = message.toLowerCase()
    const roleLower = stakeholder.role.toLowerCase()
    const deptLower = stakeholder.department?.toLowerCase() || ''

    // Dynamic keyword matching
    const relevanceKeywords = {
      technical: ['technical', 'development', 'code', 'system', 'architecture', 'implementation'],
      business: ['business', 'strategy', 'market', 'revenue', 'growth', 'customer'],
      product: ['product', 'feature', 'user', 'experience', 'design', 'requirements'],
      operations: ['operations', 'process', 'workflow', 'efficiency', 'deployment']
    }

    let relevanceScore = 0
    
    // Check role relevance
    Object.entries(relevanceKeywords).forEach(([category, keywords]) => {
      const messageMatches = keywords.filter(keyword => messageLower.includes(keyword)).length
      const roleMatches = keywords.filter(keyword => roleLower.includes(keyword)).length
      const deptMatches = keywords.filter(keyword => deptLower.includes(keyword)).length
      
      relevanceScore += (messageMatches * roleMatches * 3) + (messageMatches * deptMatches * 2)
    })

    return Math.min(relevanceScore, 25) // Cap at 25 points
  }

  // Dynamic pause calculation
  const calculateDynamicPause = (context: any) => {
    const aiService = AIService.getInstance()
    const analytics = aiService.getConversationAnalytics()

    // Base pause influenced by conversation pace
    const basePause = analytics.conversationPace === 'fast' ? 1000 : 
                     analytics.conversationPace === 'slow' ? 4000 : 2500

    // Adjust based on message complexity
    const messageComplexity = context.lastUserMessage?.length > 150 ? 1.3 : 
                             context.lastUserMessage?.length < 50 ? 0.8 : 1.0

    // Adjust based on stakeholder personality
    const personalityFactor = context.stakeholder?.personality === 'analytical' ? 1.2 :
                             context.stakeholder?.personality === 'direct' ? 0.9 : 1.0

    // Random variance for naturalness
    const variance = 0.3 + (Math.random() * 0.4) // 0.3 to 0.7 multiplier

    return Math.round(basePause * messageComplexity * personalityFactor * variance)
  }

  // Dynamic greeting flow management
  const handleAdaptiveGreeting = async (messageContent: string, currentMessages: Message[]) => {
    const aiService = AIService.getInstance()
    const analytics = aiService.getConversationAnalytics()
    const greetingIteration = conversationDynamics.greetingIterations + 1
    
    // Dynamic context for decision making
    const context = {
      greetingIteration,
      lastUserMessage: messageContent,
      totalParticipants: selectedStakeholders.length,
      conversationHistory: currentMessages,
      userEngagement: analytics.userEngagementLevel || 'medium'
    }

    // Dynamic response strategy based on context
    const responseStrategy = determineResponseStrategy(context)
    
    if (responseStrategy.type === 'initial_introduction') {
      const leadStakeholder = selectDynamicLead(selectedStakeholders, context)
      await processDynamicStakeholderResponse(leadStakeholder, messageContent, currentMessages, 'introduction_lead')
      
      setConversationDynamics(prev => ({
        ...prev,
        phase: 'introduction_active',
        leadSpeaker: leadStakeholder,
        greetingIterations: greetingIteration,
        introducedMembers: new Set([leadStakeholder.id])
      }))
      
    } else if (responseStrategy.type === 'team_introduction') {
      const leadStakeholder = conversationDynamics.leadSpeaker || selectDynamicLead(selectedStakeholders, context)
      await processDynamicStakeholderResponse(leadStakeholder, messageContent, currentMessages, 'facilitate_introductions')
      
      // Dynamic delay for next stakeholder
      const nextStakeholder = selectNextIntroducer(selectedStakeholders, conversationDynamics.introducedMembers)
      if (nextStakeholder) {
        const pauseDelay = calculateDynamicPause({ ...context, stakeholder: nextStakeholder })
        
        setTimeout(async () => {
          await processDynamicStakeholderResponse(nextStakeholder, messageContent, currentMessages, 'self_introduction')
          setConversationDynamics(prev => ({
            ...prev,
            introducedMembers: new Set([...prev.introducedMembers, nextStakeholder.id])
          }))
        }, pauseDelay)
      }
      
      setConversationDynamics(prev => ({ ...prev, greetingIterations: greetingIteration }))
      
    } else if (responseStrategy.type === 'transition_to_discussion') {
      const facilitator = selectDynamicLead(selectedStakeholders, context)
      await processDynamicStakeholderResponse(facilitator, messageContent, currentMessages, 'discussion_transition')
      
      setConversationDynamics(prev => ({
        ...prev,
        phase: 'discussion_active',
        greetingIterations: greetingIteration
      }))
    }
  }

  // Dynamic response strategy determination
  const determineResponseStrategy = (context: any) => {
    const { greetingIteration, totalParticipants, userEngagement, conversationHistory } = context
    
    // Analyze conversation patterns
    const recentGreetings = conversationHistory.filter(msg => 
      msg.speaker === 'user' && isSimpleGreeting(msg.content)
    ).length

    // Dynamic decision making
    if (greetingIteration === 1 || conversationDynamics.introducedMembers.size === 0) {
      return { type: 'initial_introduction', confidence: 0.9 }
    }
    
    if (greetingIteration === 2 && totalParticipants > 1 && conversationDynamics.introducedMembers.size < totalParticipants) {
      return { type: 'team_introduction', confidence: 0.8 }
    }
    
    if (recentGreetings > 2 || userEngagement === 'low' || conversationDynamics.introducedMembers.size >= totalParticipants) {
      return { type: 'transition_to_discussion', confidence: 0.7 }
    }
    
    // Fallback to context-appropriate response
    return { type: 'contextual_response', confidence: 0.6 }
  }

  // Dynamic next introducer selection
  const selectNextIntroducer = (stakeholders: any[], introduced: Set<string>) => {
    const unintroduced = stakeholders.filter(s => !introduced.has(s.id))
    
    if (unintroduced.length === 0) return null
    
    // Prefer stakeholders with specific characteristics for introductions
    const prioritized = unintroduced.sort((a, b) => {
      const aScore = (a.personality === 'collaborative' ? 10 : 0) + 
                    (a.role.toLowerCase().includes('senior') ? 8 : 0) +
                    (Math.random() * 5) // Add some randomness
      const bScore = (b.personality === 'collaborative' ? 10 : 0) + 
                    (b.role.toLowerCase().includes('senior') ? 8 : 0) +
                    (Math.random() * 5)
      return bScore - aScore
    })
    
       return prioritized[0]
 }

 // Dynamic contextual respondent selection - NO HARD-CODING
 const selectContextualRespondent = (messageContent: string, currentMessages: Message[]) => {
   const aiService = AIService.getInstance()
   const analytics = aiService.getConversationAnalytics()
   
   // Dynamic context analysis
   const recentSpeakers = currentMessages.slice(-3).map(msg => msg.speaker).filter(speaker => speaker !== 'user')
   const availableStakeholders = selectedStakeholders.filter(s => !recentSpeakers.includes(s.id))
   
   // If all have spoken recently, allow all but prefer least recent
   const candidateStakeholders = availableStakeholders.length > 0 ? availableStakeholders : selectedStakeholders
   
   // Dynamic scoring based on multiple contextual factors
   const scoredCandidates = candidateStakeholders.map(stakeholder => {
     let score = 0
     
     // Expertise relevance to current message
     score += calculateExpertiseRelevance(stakeholder, messageContent)
     
     // Participation balance (prefer those who have spoken less)
     const participationCount = analytics.participationCounts?.[stakeholder.id] || 0
     score += Math.max(0, 20 - (participationCount * 3))
     
     // Personality match for discussion type
     const isQuestionAsking = messageContent.includes('?')
     const isDetailOriented = messageContent.length > 100
     const personalityBonus = isDetailOriented && stakeholder.personality === 'analytical' ? 10 :
                             isQuestionAsking && stakeholder.personality === 'collaborative' ? 8 :
                             stakeholder.personality === 'direct' ? 5 : 3
     score += personalityBonus
     
     // Recency penalty (avoid back-to-back responses)
     const lastMessage = currentMessages[currentMessages.length - 1]
     if (lastMessage && lastMessage.speaker === stakeholder.id) {
       score -= 15
     }
     
     // Add randomness for natural variation
     score += Math.random() * 8
     
     return { stakeholder, score }
   })
   
   // Return highest scoring candidate
   return scoredCandidates.sort((a, b) => b.score - a.score)[0]?.stakeholder
 }

 // Dynamic follow-up assessment - NO HARD-CODING
 const assessFollowUpNeed = async (messageContent: string, currentMessages: Message[], primaryRespondent: any) => {
   const aiService = AIService.getInstance()
   const analytics = aiService.getConversationAnalytics()
   
   // Dynamic complexity analysis
   const messageComplexity = {
     length: messageContent.length,
     questionCount: (messageContent.match(/\?/g) || []).length,
     topicalBreadth: calculateTopicalBreadth(messageContent),
     technicalDepth: calculateTechnicalDepth(messageContent)
   }
   
   // Dynamic conversation context
   const conversationContext = {
     participantCount: selectedStakeholders.length,
     recentFollowUps: currentMessages.slice(-5).filter(msg => 
       msg.speaker !== 'user' && msg.speaker !== primaryRespondent.id
     ).length,
     engagementLevel: analytics.userEngagementLevel || 'medium',
     conversationPace: analytics.conversationPace || 'medium'
   }
   
   // Dynamic scoring for follow-up likelihood
   let followUpScore = 0
   
   // Complexity factors
   if (messageComplexity.length > 150) followUpScore += 15
   if (messageComplexity.questionCount > 1) followUpScore += 10
   if (messageComplexity.topicalBreadth > 2) followUpScore += 12
   if (messageComplexity.technicalDepth > 1) followUpScore += 8
   
   // Context factors
   if (conversationContext.participantCount > 2) followUpScore += 10
   if (conversationContext.recentFollowUps < 2) followUpScore += 8
   if (conversationContext.engagementLevel === 'high') followUpScore += 5
   
   // Dynamic threshold based on conversation pace
   const threshold = conversationContext.conversationPace === 'fast' ? 25 :
                    conversationContext.conversationPace === 'slow' ? 15 : 20
   
   // Add natural variation
   followUpScore += (Math.random() - 0.5) * 10
   
   return {
     shouldFollowUp: followUpScore > threshold,
     confidence: Math.min(followUpScore / 40, 1.0),
     reason: followUpScore > threshold ? 'topic_complexity' : 'sufficient_coverage',
     urgency: followUpScore > 30 ? 'high' : followUpScore > 20 ? 'medium' : 'low'
   }
 }

 // Dynamic follow-up stakeholder selection - NO HARD-CODING
 const selectDynamicFollowUp = (messageContent: string, currentMessages: Message[], primaryRespondent: any, followUpAssessment: any) => {
   const availableStakeholders = selectedStakeholders.filter(s => s.id !== primaryRespondent.id)
   
   if (availableStakeholders.length === 0) return null
   
   // Dynamic selection based on follow-up context
   const scoredStakeholders = availableStakeholders.map(stakeholder => {
     let score = 0
     
     // Complementary expertise (different department/role)
     if (stakeholder.department !== primaryRespondent.department) score += 15
     if (stakeholder.role !== primaryRespondent.role) score += 10
     
     // Personality complementarity
     const personalityComplement = getPersonalityComplement(primaryRespondent.personality, stakeholder.personality)
     score += personalityComplement
     
     // Relevant expertise for follow-up
     score += calculateExpertiseRelevance(stakeholder, messageContent) * 0.7
     
     // Participation balance
     const aiService = AIService.getInstance()
     const analytics = aiService.getConversationAnalytics()
     const participationCount = analytics.participationCounts?.[stakeholder.id] || 0
     score += Math.max(0, 15 - (participationCount * 2))
     
     // Urgency match
     const urgencyMatch = followUpAssessment.urgency === 'high' && stakeholder.personality === 'direct' ? 8 :
                         followUpAssessment.urgency === 'medium' && stakeholder.personality === 'collaborative' ? 6 :
                         followUpAssessment.urgency === 'low' && stakeholder.personality === 'analytical' ? 4 : 2
     score += urgencyMatch
     
     // Natural variation
     score += Math.random() * 6
     
     return { stakeholder, score }
   })
   
   return scoredStakeholders.sort((a, b) => b.score - a.score)[0]?.stakeholder
 }

 // Helper functions for dynamic analysis
 const calculateTopicalBreadth = (message: string) => {
   const topics = ['technical', 'business', 'user', 'process', 'timeline', 'cost', 'risk', 'quality']
   return topics.filter(topic => message.toLowerCase().includes(topic)).length
 }

 const calculateTechnicalDepth = (message: string) => {
   const technicalTerms = ['system', 'architecture', 'implementation', 'integration', 'performance', 'security']
   return technicalTerms.filter(term => message.toLowerCase().includes(term)).length
 }

 const getPersonalityComplement = (primary: string, secondary: string) => {
   const complementMap = {
     'analytical': { 'collaborative': 12, 'direct': 8, 'strategic': 10 },
     'collaborative': { 'analytical': 10, 'direct': 15, 'strategic': 8 },
     'direct': { 'analytical': 8, 'collaborative': 12, 'strategic': 6 },
     'strategic': { 'analytical': 10, 'collaborative': 8, 'direct': 6 }
   }
   
   return complementMap[primary]?.[secondary] || 5
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
              
              {/* Global Status Indicator */}
              {isGeneratingResponse && (
                <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg border border-blue-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm">Stakeholders are responding...</span>
                </div>
              )}
              
              {/* End Meeting Status */}
              {isEndingMeeting && (
                <button
                  onClick={handleUserInterruption}
                  className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                  title="Press Escape or click to interrupt meeting end"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Stop Ending</span>
                </button>
              )}

              {/* End Meeting Button */}
              <button
                onClick={handleEndMeeting}
                disabled={messages.length <= 1 || isLoading}
                className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
                title="End meeting and generate interview notes"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Ending...</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" />
                    <span className="hidden sm:inline">End Meeting</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Mobile End Meeting Button */}
            {messages.length > 1 && (
              <div className="sm:hidden mt-3 flex justify-center">
                <button
                  onClick={handleEndMeeting}
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg w-full max-w-xs justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Notes...</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4" />
                      <span>End Meeting</span>
                    </>
                  )}
                </button>
              </div>
            )}
            
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
                  data-stakeholder-id={stakeholder?.id}
                  data-message-id={message.id}
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
                        {(audioState !== 'stopped' || isCurrentlyPlaying) && (
                          <button
                            onClick={() => stopStakeholderAudio(stakeholder.id)}
                            className="p-1 rounded-full bg-white/30 hover:bg-white/50 transition-colors shadow-sm"
                            title="Stop this stakeholder's audio"
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
            
                        {/* Dynamic Individual Stakeholder Thinking Indicators */}
            {Array.from(activeThinking).map(stakeholderId => {
              const stakeholder = selectedStakeholders.find(s => s.id === stakeholderId)
              if (!stakeholder) return null
              
              // Generate dynamic thinking message based on actual user question and stakeholder context
              const lastUserMessage = messages.slice().reverse().find(msg => msg.speaker === 'user')?.content || ''
              const thinkingContext = { 
                stakeholder, 
                messageContent: lastUserMessage,
                conversationHistory: messages,
                responseContext: 'display_thinking'
              }
              const currentThinkingMessage = dynamicFeedback || generateThinkingMessage(stakeholder, thinkingContext)
              
              return (
                <div key={`thinking-${stakeholderId}`} className="flex justify-start">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    <img 
                      src={stakeholder.photo} 
                      alt={stakeholder.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-blue-300 animate-pulse"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400"
                      }}
                    />
                  </div>
                  
                  <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 relative">
                    <div className="text-xs font-medium text-blue-600 mb-1 flex items-center space-x-2">
                      <span>{stakeholder.name}</span>
                      <span className="text-blue-400">•</span>
                      <span className="text-blue-500">{stakeholder.role}</span>
                    </div>
                    <div className="text-sm flex items-center space-x-2 pr-6">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span>{currentThinkingMessage}</span>
                    </div>
                    <div className="text-xs mt-1 opacity-75">
                      {new Date().toLocaleTimeString()}
                    </div>
                    
                    {/* Dynamic stop button */}
                    <button
                      onClick={() => stopStakeholderAudio(stakeholder.id)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-white/30 hover:bg-white/50 transition-colors shadow-sm"
                      title={`Stop ${stakeholder.name}'s response`}
                    >
                      <X className="w-3 h-3 text-blue-700" />
                    </button>
                  </div>
                </div>
              )
            })}
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
                placeholder={shouldAllowUserInput() ? "Type your message..." : isGeneratingResponse ? "Stakeholders are responding..." : isEndingMeeting ? "Ending meeting..." : "Please wait..."}
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!shouldAllowUserInput()}
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
                disabled={isLoading || !inputMessage.trim() || !shouldAllowUserInput()}
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
         
         {/* Meeting End Success Notification */}
         {meetingEndedSuccess && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
               <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                 <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                 </svg>
               </div>
               
               <h3 className="text-xl font-bold text-gray-900 mb-2">Meeting Ended Successfully!</h3>
               
               <div className="space-y-2 text-sm text-gray-600 mb-6">
                 <p><strong>Participants:</strong> {selectedStakeholders.length} stakeholders</p>
                 <p><strong>Project:</strong> {selectedProject?.name}</p>
                 <p><strong>Status:</strong> Comprehensive interview notes generated</p>
               </div>
               
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                 <p className="text-blue-800 text-sm">
                   📝 Your interview notes have been automatically generated and saved. 
                   You'll be redirected to view them in a moment.
                 </p>
               </div>
               
               <div className="flex items-center justify-center space-x-2 text-blue-600">
                 <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-sm">Navigating to notes...</span>
               </div>
             </div>
           </div>
         )}
      </div>
    )
}

export default MeetingView