import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, SkipForward, Volume2, VolumeX, HelpCircle, Save, BarChart3, ChevronDown, ChevronUp, Search, Filter, Plus, Star, Tag, Mic, X, FileDown, Users, Phone } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useVoice } from '../../contexts/VoiceContext'
import { Message } from '../../types'
import AIService, { StakeholderContext, ConversationContext } from '../../services/aiService'
import { azureTTS, playBrowserTTS, isAzureTTSAvailable } from '../../lib/azureTTS'
import VoiceInputModal from '../VoiceInputModal'
import { PDFExportService } from '../../lib/pdfExport'

const MeetingView: React.FC = () => {
  const { selectedProject, selectedStakeholders, user, setCurrentView, saveMeetingToDatabase } = useApp()
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

  // Dynamic UX state management
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [canUserType, setCanUserType] = useState(true)
  const [isEndingMeeting, setIsEndingMeeting] = useState(false)
  const [userInterruptRequested, setUserInterruptRequested] = useState(false)
  const [audioPausedPosition, setAudioPausedPosition] = useState<number>(0)
  const [currentlyProcessingAudio, setCurrentlyProcessingAudio] = useState<string | null>(null)

  // Meeting analytics state
  const [meetingAnalytics, setMeetingAnalytics] = useState({
    meetingEffectivenessScore: 0,
    collaborationIndex: 0,
    topicsDiscussed: new Set<string>(),
    participationBalance: new Map<string, number>(),
    keyInsights: [] as string[],
    conversationFlow: [] as string[],
    stakeholderEngagementLevels: new Map<string, 'low' | 'medium' | 'high'>()
  })

  // Conversation queue for managing speaker turns
  const [conversationQueue, setConversationQueue] = useState<string[]>([])
  const [noteGenerationProgress, setNoteGenerationProgress] = useState<string>('')

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

  // Enhanced message handling with improved AI service integration
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !shouldAllowUserInput()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsGeneratingResponse(true)

    try {
      const aiService = AIService.getInstance()
      
      // Enhanced context for AI service
      const conversationContext: ConversationContext = {
        project: {
          name: selectedProject?.name || '',
          description: selectedProject?.description || '',
          type: selectedProject?.complexity || 'General'
        },
        conversationHistory: messages,
        stakeholders: selectedStakeholders.map(s => ({
          name: s.name,
          role: s.role,
          department: s.department,
          priorities: s.priorities,
          personality: s.personality,
          expertise: s.expertise
        }))
      }

      // Get AI response with enhanced conversation management
      const responses = await aiService.generateStakeholderResponses(
        userMessage.content,
        conversationContext,
        selectedStakeholders
      )

      // Temporarily bypass message queue and add responses directly
      for (let i = 0; i < responses.length; i++) {
        const response = responses[i]
        
        const responseMessage: Message = {
          id: `response-${Date.now()}-${i}`,
          speaker: response.stakeholderName,
          content: response.content,
          timestamp: new Date().toISOString(),
          stakeholderName: response.stakeholderName,
          stakeholderRole: response.stakeholderRole
        }

        console.log('Adding response directly to messages:', responseMessage)
        setMessages(prev => [...prev, responseMessage])

        // Handle audio playback directly
        if (globalAudioEnabled) {
          const stakeholder = selectedStakeholders.find(s => s.name === response.stakeholderName)
          if (stakeholder && isStakeholderVoiceEnabled(stakeholder.name)) {
            setCurrentSpeaker(stakeholder)
            await playMessageAudio(responseMessage.id, response.content, stakeholder, true)
          }
        }
        
        // Add a delay between responses
        if (i < responses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
        }
      }

      // Clear current speaker after all responses
      setTimeout(() => {
        setCurrentSpeaker(null)
      }, 2000)

    } catch (error) {
      console.error('Error generating response:', error)
      
      // Fallback response
      const fallbackMessage: Message = {
        id: `fallback-${Date.now()}`,
        speaker: 'system',
        content: 'I apologize, but I encountered an issue generating responses. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
      setIsGeneratingResponse(false)
      setUserInterruptRequested(false)
    }
  }

  // Enhanced audio playback with proper state management
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
        const audioUrl = await azureTTS(text, voiceName)
        if (audioUrl) {
          const audio = new Audio(audioUrl)
          
          setCurrentAudio(audio)
          setPlayingMessageId(messageId)
          setAudioStates(prev => ({ ...prev, [messageId]: 'playing' }))
          
          return new Promise((resolve) => {
            audio.onended = () => {
              setCurrentAudio(null)
              setPlayingMessageId(null)
              setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
              setCurrentSpeaker(null)
              setIsAudioPlaying(false)
              setCurrentlyProcessingAudio(null)
              
              // Auto-focus input field when audio completes
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.focus()
                }
              }, 100)
              
              resolve()
            }
            
            audio.onerror = (error) => {
              console.error('Audio element error:', error)
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
              setCurrentAudio(null)
              setPlayingMessageId(null)
              setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
              setCurrentSpeaker(null)
              setIsAudioPlaying(false)
              setCurrentlyProcessingAudio(null)
              resolve()
            })
          })
        }
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
        
        // Auto-focus input field when browser TTS completes
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }, 100)
        
        return Promise.resolve()
      }
    } catch (error) {
      console.error('Audio playback failed:', error)
      setPlayingMessageId(null)
      setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
      setCurrentSpeaker(null)
      setIsAudioPlaying(false)
      setCurrentlyProcessingAudio(null)
      
      // Auto-focus input field even on audio error
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
      
      return Promise.resolve()
    }
  }

  // Enhanced audio controls
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
  }

  // Enhanced meeting analytics
  const updateMeetingAnalytics = (userMessage: Message, responses: any[]) => {
    setMeetingAnalytics(prev => {
      const newAnalytics = { ...prev }
      
      // Update topics discussed
      const topics = extractTopics(userMessage.content)
      topics.forEach(topic => newAnalytics.topicsDiscussed.add(topic))
      
      // Update participation balance
      responses.forEach(response => {
        const current = newAnalytics.participationBalance.get(response.stakeholderName) || 0
        newAnalytics.participationBalance.set(response.stakeholderName, current + 1)
      })
      
      // Update effectiveness score
      newAnalytics.meetingEffectivenessScore = calculateEffectivenessScore(messages.length, responses.length)
      
      // Update collaboration index
      newAnalytics.collaborationIndex = calculateCollaborationIndex(newAnalytics.participationBalance)
      
      return newAnalytics
    })
  }

  const extractTopics = (content: string): string[] => {
    const topicKeywords = {
      'Process Analysis': ['process', 'workflow', 'procedure', 'steps'],
      'Pain Points': ['problem', 'issue', 'challenge', 'difficulty'],
      'Requirements': ['requirement', 'need', 'must have', 'should have'],
      'Timeline': ['timeline', 'schedule', 'deadline', 'when'],
      'Resources': ['resource', 'budget', 'cost', 'team'],
      'Technology': ['system', 'software', 'technology', 'tool']
    }
    
    const topics: string[] = []
    const lowerContent = content.toLowerCase()
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        topics.push(topic)
      }
    })
    
    return topics
  }

  const calculateEffectivenessScore = (totalMessages: number, responseCount: number): number => {
    // Simple effectiveness calculation based on engagement
    const baseScore = Math.min(100, (totalMessages * 10) + (responseCount * 5))
    return Math.max(0, baseScore)
  }

  const calculateCollaborationIndex = (participationMap: Map<string, number>): number => {
    const values = Array.from(participationMap.values())
    if (values.length === 0) return 0
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length
    
    // Lower variance means better collaboration
    return Math.max(0, 100 - (variance * 10))
  }

  // Handle key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Voice input handling
  const handleVoiceInput = (transcript: string) => {
    setInputMessage(transcript)
    setShowVoiceModal(false)
  }

  const handleTranscribingChange = (isTranscribing: boolean) => {
    setIsTranscribing(isTranscribing)
  }

  // Enhanced end meeting with progressive feedback
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
    setNoteGenerationProgress('Preparing to generate notes...');

    // Optimized timeout for faster note generation
    const messageCount = messages.length
    const participantCount = selectedStakeholders.length
    const baseTimeout = 20000 // Reduced base timeout (20 seconds)
    const complexityFactor = Math.min(1.5, (messageCount / 30) + (participantCount / 8))
    const dynamicTimeout = baseTimeout * complexityFactor

    console.log(`Setting optimized timeout for meeting end: ${dynamicTimeout}ms based on ${messageCount} messages and ${participantCount} participants`)

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
      
      // Progress callback for real-time feedback
      const progressCallback = (progress: string) => {
        setNoteGenerationProgress(progress);
      };
      
      // Create AI generation promise with progress tracking
      const aiGenerationPromise = aiService.generateInterviewNotes(meetingData, progressCallback);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Interview notes generation timed out')), dynamicTimeout)
      );

      // Race between AI generation and timeout
      let baseInterviewNotes;
      try {
        baseInterviewNotes = await Promise.race([aiGenerationPromise, timeoutPromise]);
      } catch (timeoutError) {
        console.warn('AI generation timed out, creating fallback notes:', timeoutError);
        setNoteGenerationProgress('Creating fallback notes...');
        baseInterviewNotes = createFallbackNotes(meetingData);
      }
      
      // Enhanced interview notes with analytics
      setNoteGenerationProgress('Generating meeting analytics...');
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
      setNoteGenerationProgress('Saving interview notes...');
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

      // Save to database and localStorage (for backup)
      setNoteGenerationProgress('Saving to database...');
      const stakeholderIds = selectedStakeholders.map(s => s.id);
      const rawChatTranscript = messages.filter(m => m.speaker !== 'system');
      
      const dbSaveSuccess = await saveMeetingToDatabase(
        selectedProject?.id || 'unknown',
        stakeholderIds,
        [notesObject], // transcript
        rawChatTranscript, // raw chat
        enhancedInterviewNotes, // meeting notes
        duration
      );

      // Also save to localStorage as backup
      const existingNotes = JSON.parse(localStorage.getItem('meetingNotes') || '[]');
      existingNotes.push(notesObject);
      localStorage.setItem('meetingNotes', JSON.stringify(existingNotes));

      // Generate and export PDF
      setNoteGenerationProgress('Generating PDF export...');
      try {
        const pdfData = {
          title: notesObject.title,
          project: {
            name: selectedProject?.name || 'Unknown Project',
            description: selectedProject?.description
          },
          participants: selectedStakeholders.map(s => ({
            name: s.name,
            role: s.role,
            department: s.department
          })),
          date: meetingEndTime.toISOString(),
          duration: `${duration} minutes`,
          meetingNotes: enhancedInterviewNotes,
          rawChat: rawChatTranscript,
          analytics: notesObject.analytics
        };

        await PDFExportService.exportMeetingTranscript(pdfData);
        console.log('PDF export completed successfully');
      } catch (pdfError) {
        console.error('PDF export failed:', pdfError);
        // Don't fail the whole process if PDF export fails
      }

      // Show success notification
      setNoteGenerationProgress('Meeting ended successfully!');
      setMeetingEndedSuccess(true);
      
      if (dbSaveSuccess) {
        console.log('Meeting successfully saved to database');
      } else {
        console.warn('Database save failed, but meeting data preserved in localStorage');
      }
      
      // Navigate to notes view
      setTimeout(() => {
        setCurrentView('notes');
      }, 1500);

    } catch (error) {
      console.error('Error ending meeting:', error);
      setNoteGenerationProgress('Error occurred - saving basic notes...');
      alert('Error generating meeting notes. The meeting has been saved with available data.');
      
      // Still try to save basic notes even if AI generation fails
      const basicNotes = createFallbackNotes({
        project: { name: selectedProject?.name || 'Current Project' },
        participants: selectedStakeholders,
        messages: messages.filter(m => m.speaker !== 'system'),
        duration: duration || 0
      });
      
      const basicNotesObject = {
        id: `meeting-${Date.now()}`,
        title: `Basic Meeting Notes: ${selectedProject?.name} - ${new Date().toLocaleDateString()}`,
        content: basicNotes,
        projectId: selectedProject?.id || 'unknown',
        meetingType: 'stakeholder-interview',
        participants: selectedStakeholders.map(s => s.name).join(', '),
        date: new Date().toISOString(),
        duration: `${duration || 0} minutes`,
        createdBy: user?.email || 'Business Analyst'
      };
      
      // Try to save to database even with basic notes
      try {
        const stakeholderIds = selectedStakeholders.map(s => s.id);
        const rawChatTranscript = messages.filter(m => m.speaker !== 'system');
        
        await saveMeetingToDatabase(
          selectedProject?.id || 'unknown',
          stakeholderIds,
          [basicNotesObject],
          rawChatTranscript,
          basicNotes,
          duration || 0
        );
        
        // Generate basic PDF
        const pdfData = {
          title: basicNotesObject.title,
          project: {
            name: selectedProject?.name || 'Unknown Project',
            description: selectedProject?.description
          },
          participants: selectedStakeholders.map(s => ({
            name: s.name,
            role: s.role,
            department: s.department
          })),
          date: new Date().toISOString(),
          duration: `${duration || 0} minutes`,
          meetingNotes: basicNotes,
          rawChat: rawChatTranscript
        };
        
        await PDFExportService.exportMeetingTranscript(pdfData);
        console.log('Basic PDF export completed');
      } catch (fallbackError) {
        console.error('Fallback database/PDF save also failed:', fallbackError);
      }
      
      // Always save to localStorage as final backup
      const existingNotes = JSON.parse(localStorage.getItem('meetingNotes') || '[]');
      existingNotes.push(basicNotesObject);
      localStorage.setItem('meetingNotes', JSON.stringify(existingNotes));
      
      setCurrentView('notes');
    } finally {
      setIsLoading(false);
      setIsEndingMeeting(false);
      setUserInterruptRequested(false);
      setNoteGenerationProgress('');
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

  // Manual PDF export function
  const handleExportCurrentChat = async () => {
    if (messages.length <= 1) {
      alert('No conversation to export. Start a discussion with the stakeholders first.');
      return;
    }

    try {
      const currentDate = new Date();
      const rawChatTranscript = messages.filter(m => m.speaker !== 'system');
      
      const pdfData = {
        title: `Live Chat Export: ${selectedProject?.name} - ${currentDate.toLocaleDateString()}`,
        project: {
          name: selectedProject?.name || 'Unknown Project',
          description: selectedProject?.description
        },
        participants: selectedStakeholders.map(s => ({
          name: s.name,
          role: s.role,
          department: s.department
        })),
        date: currentDate.toISOString(),
        duration: 'In Progress',
        meetingNotes: `This is a live export of the ongoing conversation as of ${currentDate.toLocaleString()}.\n\nTotal messages exchanged: ${rawChatTranscript.length}\nParticipants: ${selectedStakeholders.map(s => s.name).join(', ')}\n\nFor complete meeting notes with AI analysis, please end the meeting to generate comprehensive notes.`,
        rawChat: rawChatTranscript,
        analytics: {
          effectivenessScore: 0,
          collaborationIndex: 0,
          topicsDiscussed: [],
          participationBalance: {},
          keyInsights: [`Live export generated at ${currentDate.toLocaleString()}`, `${rawChatTranscript.length} messages captured`, 'Meeting still in progress']
        }
      };

      await PDFExportService.exportMeetingTranscript(pdfData);
      
      // Show brief success message
      const originalPlaceholder = inputRef.current?.placeholder;
      if (inputRef.current) {
        inputRef.current.placeholder = '✅ PDF exported successfully!';
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.placeholder = originalPlaceholder || 'Type your message...';
          }
        }, 3000);
      }
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
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

  // Generate meeting analytics summary
  const generateMeetingAnalyticsSummary = (): string => {
    const topicsList = Array.from(meetingAnalytics.topicsDiscussed).join(', ') || 'General discussion'
    const participationEntries = Array.from(meetingAnalytics.participationBalance.entries())
    
    return `## Meeting Analytics Summary

### Discussion Topics
${topicsList}

### Participation Overview
${participationEntries.map(([name, count]) => `- ${name}: ${count} contributions`).join('\n')}

### Effectiveness Metrics
- **Meeting Effectiveness Score**: ${meetingAnalytics.meetingEffectivenessScore}/100
- **Collaboration Index**: ${meetingAnalytics.collaborationIndex.toFixed(1)}/100
- **Total Topics Covered**: ${meetingAnalytics.topicsDiscussed.size}
- **Active Participants**: ${participationEntries.length}

### Key Insights
${meetingAnalytics.keyInsights.map(insight => `- ${insight}`).join('\n') || '- Productive stakeholder engagement observed'}`;
  }

  // Generate meeting recommendations
  const generateMeetingRecommendations = (): string => {
    const recommendations = []
    
    if (meetingAnalytics.meetingEffectivenessScore < 50) {
      recommendations.push('Consider preparing more targeted questions to drive deeper discussions')
    }
    
    if (meetingAnalytics.collaborationIndex < 60) {
      recommendations.push('Encourage more balanced participation from all stakeholders')
    }
    
    if (meetingAnalytics.topicsDiscussed.size < 3) {
      recommendations.push('Explore additional topic areas to ensure comprehensive coverage')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Continue current engagement strategies - meeting showed good effectiveness')
    }
    
    return recommendations.map(rec => `• ${rec}`).join('\n')
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
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Currently Speaking</span>
          </div>
          
          {currentSpeaker ? (
            <div className="flex items-center space-x-3">
              <img 
                src={currentSpeaker.photo} 
                alt={currentSpeaker.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium text-gray-900">{currentSpeaker.name}</div>
                <div className="text-sm text-gray-500">{currentSpeaker.role}</div>
              </div>
              <div className="ml-auto">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-5 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Meeting Active</div>
                <div className="text-sm text-gray-500">Ready for discussion</div>
              </div>
            </div>
          )}
        </div>

        {/* Participants List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Participants ({selectedStakeholders.length})</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedStakeholders.map((stakeholder) => {
                const isCurrentSpeaker = currentSpeaker?.id === stakeholder.id
                const participationCount = meetingAnalytics.participationBalance.get(stakeholder.id) || 0
                
                return (
                  <div key={stakeholder.id} className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                    isCurrentSpeaker ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                  }`}>
                    <div className="relative">
                      <img 
                        src={stakeholder.photo} 
                        alt={stakeholder.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        isCurrentSpeaker ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{stakeholder.name}</div>
                      <div className="text-sm text-gray-500 truncate">{stakeholder.role}</div>
                    </div>
                    {participationCount > 0 && (
                      <div className="text-xs text-gray-400">
                        {participationCount}
                      </div>
                    )}
                    {!isStakeholderVoiceEnabled(stakeholder.name) && (
                      <VolumeX className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Meeting: {selectedProject.name}</h1>
              <p className="text-indigo-100 text-sm mt-1">
                Participants: {selectedStakeholders.map(s => s.name).join(', ')}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Export PDF Button */}
              {messages.length > 1 && (
                <button
                  onClick={handleExportCurrentChat}
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-colors border border-white/30 disabled:opacity-50"
                  title="Export current conversation as PDF"
                >
                  <FileDown className="w-4 h-4" />
                  <span className="hidden lg:inline">Export PDF</span>
                </button>
              )}
              
              {/* Question Helper Toggle */}
              <button
                onClick={() => setShowQuestionHelper(!showQuestionHelper)}
                className="flex items-center space-x-2 bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-colors border border-white/30"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden lg:inline">Question Helper</span>
                {showQuestionHelper ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {/* Status Indicator */}
              {isGeneratingResponse && (
                <div className="flex items-center space-x-2 bg-white/20 text-white px-3 py-2 rounded-lg border border-white/30">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm">Stakeholders are responding...</span>
                </div>
              )}
              
              {/* End Meeting Button */}
              <button
                onClick={handleEndMeeting}
                disabled={messages.length <= 1 || isLoading}
                className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="End meeting and generate interview notes"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">
                      {noteGenerationProgress || 'Ending...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    <span>End Meeting</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Question Helper */}
        {showQuestionHelper && (
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-blue-900">Suggested Questions</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedQuestionCategory('as-is')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedQuestionCategory === 'as-is'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Current State
                  </button>
                  <button
                    onClick={() => setSelectedQuestionCategory('to-be')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedQuestionCategory === 'to-be'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Future State
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {mockQuestions[selectedQuestionCategory].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="text-left p-2 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((message) => {
            const stakeholder = selectedStakeholders.find(s => s.name === message.stakeholderName || s.id === message.speaker)
            
            if (message.speaker === 'user') {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-2xl bg-blue-600 text-white rounded-lg px-4 py-3">
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs text-blue-100 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              )
            }

            if (message.speaker === 'system') {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="max-w-2xl bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm text-center">
                    {message.content}
                  </div>
                </div>
              )
            }

            // Stakeholder message
            return (
              <div key={message.id} className="flex items-start space-x-3">
                {/* Stakeholder Avatar */}
                <div className="flex-shrink-0 relative">
                  <img 
                    src={stakeholder?.photo || "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400"} 
                    alt={stakeholder?.name || 'Stakeholder'}
                    className={`w-10 h-10 rounded-full object-cover border-2 transition-all duration-200 ${
                      playingMessageId === message.id 
                        ? 'border-green-400 shadow-lg scale-110' 
                        : 'border-gray-300'
                    }`}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400"
                    }}
                  />
                  {/* Speaking indicator */}
                  {playingMessageId === message.id && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white animate-pulse"></div>
                  )}
                </div>
                
                <div className="flex-1 max-w-2xl">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{message.stakeholderName}</span>
                    <span className="text-xs text-gray-500">{message.stakeholderRole}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    
                    {/* Audio controls */}
                    {stakeholder && (
                      <div className="flex items-center space-x-1">
                        {playingMessageId === message.id ? (
                          <>
                            {isAudioPlaying ? (
                              <button 
                                onClick={() => pauseCurrentAudio()}
                                className="text-blue-500 hover:text-blue-700"
                                title="Pause audio"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => resumeCurrentAudio()}
                                className="text-green-500 hover:text-green-700"
                                title="Resume audio"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => stopCurrentAudio()}
                              className="text-red-500 hover:text-red-700"
                              title="Stop audio"
                            >
                              <Square className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => playMessageAudio(message.id, message.content, stakeholder, true)}
                            className="text-gray-500 hover:text-blue-700"
                            title="Play audio"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Voice enabled indicator */}
                        {isStakeholderVoiceEnabled(stakeholder.name) ? (
                          <Volume2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <VolumeX className="w-3 h-3 text-gray-400" />
                        )}
                        
                        {/* Playing animation */}
                        {playingMessageId === message.id && isAudioPlaying && (
                          <div className="flex items-center space-x-1 text-green-500">
                            <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="text-sm text-gray-900">{message.content}</div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={shouldAllowUserInput() ? "Type a new message" : isGeneratingResponse ? "Stakeholders are responding..." : isEndingMeeting ? "Ending meeting..." : "Please wait..."}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Voice Input Modal */}
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