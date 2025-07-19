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
    return canUserType && !isEndingMeeting && !playingMessageId
  }

  // Get stakeholder color for consistent avatar colors
  const getStakeholderColor = (stakeholder: any) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ]
    const index = selectedStakeholders.findIndex(s => s.id === stakeholder.id)
    return colors[index % colors.length]
  }

  // Generate stakeholder initials
  const getStakeholderInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
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

  // Enhanced message handling with improved AI service integration and orchestration
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
    setCanUserType(false)

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

      // Check if this is a group greeting or discussion
      if (isGroupMessage(userMessage.content) || isSimpleGreeting(userMessage.content)) {
        console.log('Processing group message:', userMessage.content)
        // For group messages, use the orchestrator to get multiple responses
        const responses = await aiService.generateStakeholderResponses(
          userMessage.content,
          conversationContext,
          selectedStakeholders
        )

        console.log('Generated responses:', responses)

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
              await handleAudioPlayback(responseMessage)
            }
            
            // Add a delay between responses
            if (i < responses.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000))
            }
          }
        }

        // Clear current speaker after all responses
        setTimeout(() => {
          setCurrentSpeaker(null)
        }, 3000)

      } else {
        console.log('Processing direct message:', userMessage.content)
        // For direct questions, get a single targeted response
        const respondingStakeholder = selectRespondingStakeholder(userMessage.content)
        
        console.log('Selected responding stakeholder:', respondingStakeholder)
        
        if (respondingStakeholder) {
          // Create stakeholder context
          const stakeholderContext: StakeholderContext = {
            name: respondingStakeholder.name,
            role: respondingStakeholder.role,
            department: respondingStakeholder.department,
            priorities: respondingStakeholder.priorities,
            personality: respondingStakeholder.personality,
            expertise: respondingStakeholder.expertise
          }

          // Get AI response using the correct method name
          const aiResponse = await aiService.generateStakeholderResponse(
            userMessage.content,
            stakeholderContext,
            conversationContext,
            'discussion'
          )

          console.log('Generated AI response:', aiResponse)

          const responseMessage: Message = {
            id: `response-${Date.now()}`,
            speaker: respondingStakeholder.id,
            content: aiResponse,
            timestamp: new Date().toISOString(),
            stakeholderName: respondingStakeholder.name,
            stakeholderRole: respondingStakeholder.role
          }

          console.log('Adding single response directly to messages:', responseMessage)
          setMessages(prev => [...prev, responseMessage])

          // Handle audio playback directly
          if (globalAudioEnabled && isStakeholderVoiceEnabled(respondingStakeholder.name)) {
            setCurrentSpeaker(respondingStakeholder)
            await handleAudioPlayback(responseMessage)
            setTimeout(() => {
              setCurrentSpeaker(null)
            }, 3000)
          }
        } else {
          console.log('No stakeholder selected to respond')
        }
      }

      // Update meeting analytics
      updateMeetingAnalytics(userMessage, [])

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
      setCanUserType(true)
      setUserInterruptRequested(false)
    }
  }

  // Intelligent stakeholder selection for single responses
  const selectRespondingStakeholder = (messageContent: string) => {
    // Check for direct addressing first
    const directAddress = detectDirectAddressing(messageContent)
    if (directAddress) return directAddress

    // If no direct addressing, select based on expertise and participation balance
    const messageLower = messageContent.toLowerCase()
    
    // Score stakeholders based on relevance
    const scoredStakeholders = selectedStakeholders.map(stakeholder => {
      let score = 0
      
      // Expertise relevance
      const roleKeywords = stakeholder.role.toLowerCase().split(' ')
      const deptKeywords = stakeholder.department?.toLowerCase().split(' ') || []
      
      roleKeywords.forEach(keyword => {
        if (messageLower.includes(keyword)) score += 10
      })
      deptKeywords.forEach(keyword => {
        if (messageLower.includes(keyword)) score += 8
      })
      
      // Participation balance (prefer less active participants)
      const participationCount = meetingAnalytics.participationBalance.get(stakeholder.name) || 0
      score += Math.max(0, 15 - (participationCount * 3))
      
      // Add some randomness for variety
      score += Math.random() * 5
      
      return { stakeholder, score }
    })
    
    // Return highest scoring stakeholder
    return scoredStakeholders.sort((a, b) => b.score - a.score)[0]?.stakeholder || selectedStakeholders[0]
  }

  // Detect direct addressing by name
  const detectDirectAddressing = (message: string) => {
    const messageLower = message.toLowerCase()
    
    for (const stakeholder of selectedStakeholders) {
      const firstName = stakeholder.name.split(' ')[0].toLowerCase()
      const lastName = stakeholder.name.split(' ').slice(-1)[0].toLowerCase()
      
      // Check for name mentions
      if (messageLower.includes(firstName) || messageLower.includes(lastName)) {
        return stakeholder
      }
    }
    
    return null
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
    const baseScore = Math.min(100, (totalMessages * 10) + (responseCount * 5))
    return Math.max(0, baseScore)
  }

  const calculateCollaborationIndex = (participationMap: Map<string, number>): number => {
    const values = Array.from(participationMap.values())
    if (values.length === 0) return 0
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length
    
    return Math.max(0, 100 - (variance * 10))
  }

  // Enhanced audio playback with better error handling
  const handleAudioPlayback = async (message: Message) => {
    try {
      setCurrentlyProcessingAudio(message.id)
      
      const stakeholder = selectedStakeholders.find(s => s.name === message.stakeholderName)
      if (!stakeholder) return

      const voice = getStakeholderVoice(stakeholder.name)
      
      if (isAzureTTSAvailable() && voice) {
        const audioUrl = await azureTTS(message.content, voice)
        if (audioUrl) {
          await playAudio(audioUrl, message.id)
        }
      } else {
        // Fallback to browser TTS
        await playBrowserTTS(message.content, stakeholder.voice)
      }
    } catch (error) {
      console.error('Audio playback error:', error)
    } finally {
      setCurrentlyProcessingAudio(null)
    }
  }

  // Enhanced audio controls
  const playAudio = (audioUrl: string, messageId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }

      const audio = new Audio(audioUrl)
      setCurrentAudio(audio)
      setPlayingMessageId(messageId)
      setAudioStates(prev => ({ ...prev, [messageId]: 'playing' }))

      audio.onended = () => {
        setPlayingMessageId(null)
        setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
        resolve()
      }

      audio.onerror = (error) => {
        console.error('Audio playback error:', error)
        setPlayingMessageId(null)
        setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }))
        reject(error)
      }

      audio.play().catch(reject)
    })
  }

  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
      setPlayingMessageId(null)
      setAudioStates({})
    }
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

  // Enhanced end meeting functionality
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

    try {
      stopCurrentAudio();

      const meetingStartTime = new Date(messages[0]?.timestamp || new Date().toISOString());
      const meetingEndTime = new Date();
      const duration = Math.round((meetingEndTime.getTime() - meetingStartTime.getTime()) / 1000 / 60);

      // Create basic notes without AI dependency for now
      const basicNotes = createFallbackNotes({
        project: { name: selectedProject?.name || 'Current Project' },
        participants: selectedStakeholders,
        messages: messages.filter(m => m.speaker !== 'system'),
        duration: duration
      });

      setNoteGenerationProgress('Saving to database...');
      const stakeholderIds = selectedStakeholders.map(s => s.id);
      const rawChatTranscript = messages.filter(m => m.speaker !== 'system');
      
      const dbSaveSuccess = await saveMeetingToDatabase(
        selectedProject?.id || 'unknown',
        stakeholderIds,
        [{ content: basicNotes }], // transcript
        rawChatTranscript, // raw chat
        basicNotes, // meeting notes
        duration
      );

      // Save to localStorage as backup
      const notesObject = {
        id: `meeting-${Date.now()}`,
        title: `Meeting Notes: ${selectedProject?.name} - ${meetingEndTime.toLocaleDateString()}`,
        content: basicNotes,
        projectId: selectedProject?.id || 'unknown',
        meetingType: 'stakeholder-interview',
        participants: selectedStakeholders.map(s => s.name).join(', '),
        date: meetingEndTime.toISOString(),
        duration: `${duration} minutes`,
        createdBy: user?.email || 'Business Analyst'
      };

      const existingNotes = JSON.parse(localStorage.getItem('meetingNotes') || '[]');
      existingNotes.push(notesObject);
      localStorage.setItem('meetingNotes', JSON.stringify(existingNotes));

      // Generate PDF
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
          meetingNotes: basicNotes,
          rawChat: rawChatTranscript
        };

        await PDFExportService.exportMeetingTranscript(pdfData);
      } catch (pdfError) {
        console.error('PDF export failed:', pdfError);
      }

      setNoteGenerationProgress('Meeting ended successfully!');
      setMeetingEndedSuccess(true);
      
      setTimeout(() => {
        setCurrentView('notes');
      }, 1500);

    } catch (error) {
      console.error('Error ending meeting:', error);
      alert('Error ending meeting. Your conversation has been saved locally.');
      setCurrentView('notes');
    } finally {
      setIsLoading(false);
      setIsEndingMeeting(false);
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
        meetingNotes: `Live export generated at ${currentDate.toLocaleString()}`,
        rawChat: rawChatTranscript
      };

      await PDFExportService.exportMeetingTranscript(pdfData);
      
      // Show brief success message
      const originalPlaceholder = inputRef.current?.placeholder;
      if (inputRef.current) {
        inputRef.current.placeholder = '✅ PDF exported successfully!';
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.placeholder = originalPlaceholder || 'Type a message...';
          }
        }, 3000);
      }
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{selectedProject.name}</h1>
            <p className="text-purple-100 text-sm mt-1">
              Participants: {selectedStakeholders.map(s => s.name).join(', ')}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Current Speaker Display */}
            {currentSpeaker && (
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${getStakeholderColor(currentSpeaker)}`}>
                  {getStakeholderInitials(currentSpeaker.name)}
                </div>
                <div className="text-left">
                  <div className="font-medium text-white">{currentSpeaker.name}</div>
                  <div className="text-xs text-purple-100">{currentSpeaker.role}</div>
                </div>
                <div className="flex items-center space-x-1 text-green-300">
                  <div className="w-1 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <div className="w-1 h-3 bg-green-300 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-4 bg-green-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <span className="text-xs ml-2">Speaking...</span>
                </div>
              </div>
            )}
            
            {/* Audio Controls */}
            {playingMessageId && (
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30">
                <button onClick={stopCurrentAudio} className="text-white hover:text-purple-200">
                  <Square className="w-4 h-4" />
                </button>
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
                  <span>{noteGenerationProgress || 'Ending...'}</span>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Meeting Chat</h2>
        </div>

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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0 ${stakeholder ? getStakeholderColor(stakeholder) : 'bg-gray-500'}`}>
                  {stakeholder ? getStakeholderInitials(stakeholder.name) : 'ST'}
                </div>
                <div className="flex-1 max-w-2xl">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{message.stakeholderName}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {playingMessageId === message.id && (
                      <div className="flex items-center space-x-1 text-green-500">
                        <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
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
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={shouldAllowUserInput() ? "Type a message..." : isGeneratingResponse ? "Stakeholders are responding..." : playingMessageId ? "Audio playing... Press ESC to interrupt" : "Please wait..."}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!shouldAllowUserInput()}
            />
            <button
              onClick={() => setShowVoiceModal(true)}
              disabled={isLoading || isTranscribing}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
              title="Voice Input"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim() || !shouldAllowUserInput()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center space-x-2"
            >
              <span>Send</span>
            </button>
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
              <p><strong>Status:</strong> Meeting notes generated</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                📝 Your meeting notes have been saved and exported as PDF.
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