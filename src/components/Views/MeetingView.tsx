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
  const [meetingEndedSuccess, setMeetingEndedSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

    try {
      // Stop any current audio
      stopCurrentAudio();

      // Calculate meeting duration
      const meetingStartTime = new Date(messages[0]?.timestamp || new Date().toISOString());
      const meetingEndTime = new Date();
      const duration = Math.round((meetingEndTime.getTime() - meetingStartTime.getTime()) / 1000 / 60); // in minutes

      // Generate enhanced meeting data with analytics
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
        messages: messages.filter(m => m.speaker !== 'system'), // Exclude system messages
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
      const baseInterviewNotes = await aiService.generateInterviewNotes(meetingData);
      
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

      // Create a formatted notes object with analytics
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

      // Save to localStorage (in a real app, this would go to a database)
      const existingNotes = JSON.parse(localStorage.getItem('meetingNotes') || '[]');
      existingNotes.push(notesObject);
      localStorage.setItem('meetingNotes', JSON.stringify(existingNotes));

      // Show success notification
      setMeetingEndedSuccess(true);
      
      // Navigate to notes view after a short delay to show success message
      setTimeout(() => {
        setCurrentView('notes');
      }, 2000);

    } catch (error) {
      console.error('Error ending meeting:', error);
      alert('Error generating meeting notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

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
      setCurrentSpeaker(null) // Clear current speaker when audio stops
    }
  }

  const playMessageAudio = async (messageId: string, text: string, stakeholder: any, autoPlay: boolean = true): Promise<void> => {
    // DEBUG: Log audio attempt
    console.log('Audio playback attempt:', { messageId, stakeholder: stakeholder.name, globalAudioEnabled, autoPlay })
    
    if (!globalAudioEnabled || !isStakeholderVoiceEnabled(stakeholder.id)) {
      console.log('Audio disabled for stakeholder:', stakeholder.name)
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
      console.log('Using voice:', voiceName, 'for stakeholder:', stakeholder.name)
      
      if (isAzureTTSAvailable()) {
        console.log('Using Azure TTS for audio synthesis')
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
          
          audio.onerror = (error) => {
            console.error('Audio element error:', error)
            URL.revokeObjectURL(audioUrl)
            setCurrentAudio(null)
            setPlayingMessageId(null)
            setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
            setCurrentSpeaker(null) // Clear current speaker on error
            resolve() // Resolve even on error to prevent hanging
          }
          
          audio.play().catch((playError) => {
            console.error('Audio play error:', playError)
            URL.revokeObjectURL(audioUrl)
            setCurrentAudio(null)
            setPlayingMessageId(null)
            setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
            setCurrentSpeaker(null) // Clear current speaker on play error
            resolve()
          })
        })
      } else {
        console.log('Using browser TTS for audio synthesis')
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
      // Use AI service's intelligent conversation handling
      const isGroup = isGroupMessage(messageContent)
      const isGreeting = isSimpleGreeting(messageContent)
      
      if (isGroup && isGreeting) {
        // Handle greetings with intelligent stakeholder selection
        const config = getConversationConfig()
        const greetingRespondents = selectedStakeholders.slice(0, config.maxGreetingRespondents)
        
        for (let i = 0; i < greetingRespondents.length; i++) {
          const stakeholder = greetingRespondents[i]
          
          // Use AI service's intelligent greeting handling
          const response = await generateStakeholderResponse(stakeholder, messageContent, currentMessages, 'greeting')
          const responseMessage = createResponseMessage(stakeholder, response, i)
          
          // Add message to conversation
          currentMessages = [...currentMessages, responseMessage]
          setMessages(currentMessages)
          
          // Play audio with error handling
          try {
            await playMessageAudio(responseMessage.id, response, stakeholder, true)
          } catch (audioError) {
            console.warn('Audio playback failed, continuing without audio:', audioError)
          }
          
          // Add natural pause between speakers
          if (i < greetingRespondents.length - 1) {
            const pauseTime = config.greetingPauseTiming.base + Math.random() * config.greetingPauseTiming.variance
            await new Promise(resolve => setTimeout(resolve, pauseTime))
          }
        }
      } else {
        // Handle discussions with AI-driven conversation flow
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
    const stakeholderMessages = messages.filter(m => m.speaker !== 'user' && m.speaker !== 'system')
    const totalMessages = stakeholderMessages.length
    
    if (totalMessages === 0) return

    // Calculate participation balance
    const participationBalance = new Map<string, number>()
    selectedStakeholders.forEach(stakeholder => {
      const messageCount = stakeholderMessages.filter(m => m.speaker === stakeholder.id).length
      participationBalance.set(stakeholder.id, (messageCount / totalMessages) * 100)
    })

    // Identify topics discussed
    const topicsDiscussed = new Set<string>()
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

    // Analyze question types
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

    // Calculate collaboration index
    const handoffCount = calculateHandoffCount(stakeholderMessages)
    const collaborationIndex = Math.min(100, (handoffCount / Math.max(1, totalMessages - 1)) * 100)

    // Calculate meeting effectiveness score
    const balanceScore = calculateParticipationBalance(participationBalance)
    const topicScore = Math.min(100, (topicsDiscussed.size / 10) * 100)
    const engagementScore = calculateEngagementScore(stakeholderMessages)
    const meetingEffectivenessScore = Math.round((balanceScore + topicScore + engagementScore) / 3)

    // Generate key insights
    const keyInsights = generateKeyInsights(participationBalance, topicsDiscussed, questionTypes, collaborationIndex)

    // Calculate stakeholder engagement levels
    const stakeholderEngagementLevels = new Map<string, 'low' | 'medium' | 'high'>()
    selectedStakeholders.forEach(stakeholder => {
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
    })

    // Build conversation flow
    const conversationFlow = stakeholderMessages.map(msg => ({
      speaker: msg.stakeholderName || 'Unknown',
      timestamp: msg.timestamp,
      topic: identifyMessageTopic(msg.content, topicKeywords)
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