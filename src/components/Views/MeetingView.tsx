import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useVoice } from '../../contexts/VoiceContext'
import VoiceInputModal from '../VoiceInputModal'
import { 
  ArrowLeft, 
  Mic, 
  Send, 
  Volume2, 
  VolumeX, 
  Users, 
  Clock,
  Settings,
  Loader2,
  Video,
  VideoOff,
  Phone,
  MoreHorizontal,
  MessageSquare,
  FileText,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react'
import { isAudioRecordingSupported } from '../../lib/whisper'
import { azureTTS, isAzureTTSAvailable, playBrowserTTS } from '../../lib/azureTTS'
import { stakeholderAI } from '../../lib/stakeholderAI'
import { Message, Meeting } from '../../types'

interface AudioPlaybackState {
  messageId: string
  isPlaying: boolean
  isLoading: boolean
  error?: string
}

const MeetingView: React.FC = () => {
  const { 
    selectedProject, 
    selectedStakeholders, 
    setCurrentView, 
    addMeeting, 
    currentMeeting, 
    setCurrentMeeting,
    stakeholders,
    updateMeeting
  } = useApp()

  const { 
    getStakeholderVoice, 
    globalAudioEnabled, 
    setGlobalAudioEnabled 
  } = useVoice()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [meetingStartTime] = useState(new Date())
  const [audioPlaybackStates, setAudioPlaybackStates] = useState<Map<string, AudioPlaybackState>>(new Map())
  const [showVoiceModal, setShowVoiceModal] = useState(false)

  // Add state for tracking which stakeholder is currently responding
  const [respondingStakeholder, setRespondingStakeholder] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!selectedProject || selectedStakeholders.length === 0) {
      setCurrentView('stakeholders')
      return
    }

    // Initialize meeting if not already set
    if (!currentMeeting) {
      const newMeeting: Meeting = {
        id: `meeting-${Date.now()}`,
        projectId: selectedProject.id,
        stakeholderIds: selectedStakeholders.map(s => s.id),
        transcript: [],
        date: new Date().toISOString(),
        duration: 0,
        status: 'in-progress',
        meetingType: selectedStakeholders.length > 1 ? 'group' : 'individual'
      }
      setCurrentMeeting(newMeeting)
      addMeeting(newMeeting)
    }
  }, [selectedProject, selectedStakeholders, currentMeeting, setCurrentView, setCurrentMeeting, addMeeting])

  const handleVoiceInput = () => {
    setShowVoiceModal(true)
  }

  const handleVoiceTranscription = (transcription: string) => {
    // Append to existing input message with proper spacing
    setInputMessage(prev => {
      const trimmedPrev = prev.trim()
      const trimmedNew = transcription.trim()
      
      if (!trimmedPrev) return trimmedNew
      if (!trimmedNew) return trimmedPrev
      
      return `${trimmedPrev} ${trimmedNew}`
    })
  }

  const formatMeetingDuration = () => {
    const now = new Date()
    const duration = Math.floor((now.getTime() - meetingStartTime.getTime()) / 1000 / 60)
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:00`
    }
    return `${minutes}:00`
  }

  const updateAudioPlaybackState = (messageId: string, updates: Partial<AudioPlaybackState>) => {
    setAudioPlaybackStates(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(messageId) || { messageId, isPlaying: false, isLoading: false }
      newMap.set(messageId, { ...current, ...updates })
      return newMap
    })
  }

  const stopCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    
    // Reset all playing states
    setAudioPlaybackStates(prev => {
      const newMap = new Map(prev)
      for (const [messageId, state] of newMap) {
        if (state.isPlaying) {
          newMap.set(messageId, { ...state, isPlaying: false })
        }
      }
      return newMap
    })
  }

  const playMessageAudio = async (message: Message) => {
    if (message.speaker === 'user' || !globalAudioEnabled) return

    const messageId = message.id
    const currentState = audioPlaybackStates.get(messageId)

    // If already playing, stop it
    if (currentState?.isPlaying) {
      stopCurrentAudio()
      return
    }

    // Stop any currently playing audio
    stopCurrentAudio()

    // Set loading state
    updateAudioPlaybackState(messageId, { isLoading: true, error: undefined })

    try {
      // Get stakeholder info and voice
      const stakeholder = stakeholders.find(s => s.id === message.speaker)
      const voiceName = stakeholder?.voice || getStakeholderVoice(message.speaker, message.stakeholderRole)

      let audioBlob: Blob

      if (isAzureTTSAvailable()) {
        // Use Azure TTS
        console.log(`Using Azure TTS voice: ${voiceName} for ${message.stakeholderName}`)
        audioBlob = await azureTTS.synthesizeSpeech(message.content, voiceName)
      } else {
        // Fallback to browser TTS (though we'll create a silent blob and use speechSynthesis)
        console.log('Azure TTS not available, falling back to browser TTS')
        updateAudioPlaybackState(messageId, { isLoading: false, isPlaying: true })
        
        try {
          await playBrowserTTS(message.content)
          updateAudioPlaybackState(messageId, { isPlaying: false })
        } catch (error) {
          console.error('Browser TTS failed:', error)
          updateAudioPlaybackState(messageId, { 
            isPlaying: false, 
            error: 'Audio playback failed' 
          })
        }
        return
      }

      // Create audio element and play
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      currentAudioRef.current = audio

      audio.onloadstart = () => {
        updateAudioPlaybackState(messageId, { isLoading: true, isPlaying: false })
      }

      audio.oncanplay = () => {
        updateAudioPlaybackState(messageId, { isLoading: false, isPlaying: true })
      }

      audio.onended = () => {
        updateAudioPlaybackState(messageId, { isPlaying: false, isLoading: false })
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
      }

      audio.onerror = (error) => {
        console.error('Audio playback error:', error)
        updateAudioPlaybackState(messageId, { 
          isPlaying: false, 
          isLoading: false, 
          error: 'Audio playback failed' 
        })
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
      }

      await audio.play()

    } catch (error) {
      console.error('TTS synthesis error:', error)
      let errorMessage = 'Audio synthesis failed'
      
      if (error instanceof Error) {
        if (error.message.includes('authentication')) {
          errorMessage = 'Azure TTS authentication failed'
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error - check connection'
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded - try again later'
        }
      }

      updateAudioPlaybackState(messageId, { 
        isLoading: false, 
        isPlaying: false, 
        error: errorMessage 
      })

      // Try browser TTS as fallback
      try {
        await playBrowserTTS(message.content)
      } catch (fallbackError) {
        console.error('Browser TTS fallback also failed:', fallbackError)
      }
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentMeeting) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      speaker: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputMessage('')

    // Update meeting with new message
    if (currentMeeting) {
      updateMeeting(currentMeeting.id, { transcript: updatedMessages })
    }

    // Generate AI stakeholder responses with natural conversation flow
    generateStakeholderResponses(userMessage, updatedMessages)
  }

  const generateStakeholderResponses = async (userMessage: Message, currentMessages: Message[]) => {
    const conversationContext = {
      projectId: selectedProject!.id,
      stakeholderIds: selectedStakeholders.map(s => s.id),
      messages: currentMessages,
      meetingType: selectedStakeholders.length > 1 ? 'group' as const : 'individual' as const
    }

    // Determine which stakeholders should respond based on the question
    const relevantStakeholders = determineRelevantStakeholders(userMessage.content, selectedStakeholders)
    
    // Process stakeholders sequentially, one at a time
    await processStakeholdersSequentially(relevantStakeholders, userMessage, conversationContext)
  }

  const processStakeholdersSequentially = async (
    stakeholders: Stakeholder[], 
    userMessage: Message, 
    conversationContext: any
  ) => {
    const isIntroductionPhase = conversationContext.messages.length <= 2 && (
      userMessage.content.toLowerCase().includes('hi') ||
      userMessage.content.toLowerCase().includes('hello') ||
      userMessage.content.toLowerCase().includes('introduce') ||
      userMessage.content.toLowerCase().includes('good morning') ||
      userMessage.content.toLowerCase().includes('good afternoon')
    )

    for (let i = 0; i < stakeholders.length; i++) {
      const stakeholder = stakeholders[i]
      
      try {
        // Show that this stakeholder is responding
        setRespondingStakeholder(stakeholder.id)
        
        // Small delay before first response for realism
        if (i === 0) {
          await new Promise(resolve => setTimeout(resolve, 1200))
        }
        
        // Generate AI response using OpenAI
        const response = await stakeholderAI.generateResponse(
          stakeholder.id,
          userMessage.content,
          conversationContext,
          selectedProject!,
          stakeholder,
          isIntroductionPhase && i > 0 // Flag for follow-up introductions
        )
        
        const stakeholderMessage: Message = {
          id: `msg-${Date.now()}-${stakeholder.id}`,
          speaker: stakeholder.id,
          content: response,
          timestamp: new Date().toISOString(),
          stakeholderName: stakeholder.name,
          stakeholderRole: stakeholder.role
        }

        // Add the message to the conversation
        setMessages(prev => {
          const newMessages = [...prev, stakeholderMessage]
          
          // Update meeting transcript
          if (currentMeeting) {
            updateMeeting(currentMeeting.id, { transcript: newMessages })
          }
          
          return newMessages
        })

        // Auto-play audio if enabled
        if (globalAudioEnabled) {
          setTimeout(() => {
            playMessageAudio(stakeholderMessage)
          }, 300)
        }

        // Wait for this stakeholder to "finish speaking" before next one starts
        if (i < stakeholders.length - 1) {
          const wordCount = response.split(' ').length
          const speakingTime = Math.max(1500, (wordCount / 190) * 60 * 1000) // Slightly slower: 190 words per minute
          const pauseTime = 600 // Even shorter pause between speakers
          
          await new Promise(resolve => setTimeout(resolve, speakingTime + pauseTime))
        }
        
      } catch (error) {
        console.error(`Error generating response for ${stakeholder.name}:`, error)
        
        // Fallback response if OpenAI fails
        const fallbackMessage: Message = {
          id: `msg-${Date.now()}-${stakeholder.id}-fallback`,
          speaker: stakeholder.id,
          content: `I need a moment to gather my thoughts on that question. Could you rephrase it or ask about a specific aspect of our ${stakeholder.department} processes?`,
          timestamp: new Date().toISOString(),
          stakeholderName: stakeholder.name,
          stakeholderRole: stakeholder.role
        }
        
        setMessages(prev => {
          const newMessages = [...prev, fallbackMessage]
          if (currentMeeting) {
            updateMeeting(currentMeeting.id, { transcript: newMessages })
          }
          return newMessages
        })
        
        // Short delay even for fallback
        if (i < stakeholders.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
      }
    }
    
    // Clear responding indicator when all stakeholders are done
    setRespondingStakeholder(null)
  }

  // Determine which stakeholders should respond based on question content
  const determineRelevantStakeholders = (question: string, allStakeholders: Stakeholder[]) => {
    const lowerQuestion = question.toLowerCase()
    
    // Check if a specific stakeholder is mentioned by name
    const mentionedStakeholder = allStakeholders.find(stakeholder => 
      lowerQuestion.includes(stakeholder.name.toLowerCase()) ||
      lowerQuestion.includes(stakeholder.name.split(' ')[0].toLowerCase()) ||
      lowerQuestion.includes(stakeholder.name.split(' ')[1]?.toLowerCase() || '') // Last name too
    )
    
    if (mentionedStakeholder) {
      return [mentionedStakeholder]
    }
    
    // For initial greetings, start with the most senior stakeholder
    if (messages.length === 0 || 
        lowerQuestion.includes('hi') || 
        lowerQuestion.includes('hello') || 
        lowerQuestion.includes('good morning') ||
        lowerQuestion.includes('good afternoon')) {
      
      // If this is the very first message, only the senior stakeholder responds
      if (messages.length === 0) {
        const seniorStakeholder = allStakeholders.find(s => s.role.includes('Head')) || allStakeholders[0]
        return seniorStakeholder ? [seniorStakeholder] : []
      }
      
      // If there's already been one introduction, include all stakeholders for natural flow
      const hasIntroductions = messages.some(msg => 
        msg.speaker !== 'user' && 
        (msg.content.toLowerCase().includes('hello') || 
         msg.content.toLowerCase().includes('hi') || 
         msg.content.toLowerCase().includes('glad'))
      )
      
      if (hasIntroductions) {
        // Return remaining stakeholders who haven't introduced themselves yet
        const introducedStakeholders = new Set(
          messages
            .filter(msg => msg.speaker !== 'user')
            .map(msg => msg.speaker)
        )
        
        return allStakeholders.filter(s => !introducedStakeholders.has(s.id))
      }
      
      // Fallback to senior stakeholder
      const seniorStakeholder = allStakeholders.find(s => s.role.includes('Head')) || allStakeholders[0]
      return seniorStakeholder ? [seniorStakeholder] : []
    }
    
    // If asking everyone to introduce themselves
    if (lowerQuestion.includes('everyone') || 
        (lowerQuestion.includes('introduce') && lowerQuestion.includes('yourself'))) {
      // Return all stakeholders in seniority order
      return [...allStakeholders].sort((a, b) => {
        const seniorityOrder = ['Head', 'Manager', 'Lead', 'Partner']
        const aLevel = seniorityOrder.findIndex(level => a.role.includes(level))
        const bLevel = seniorityOrder.findIndex(level => b.role.includes(level))
        return aLevel - bLevel
      })
    }
    
    // Domain-specific keywords to determine relevance
    const domainKeywords = {
      'operations': ['process', 'workflow', 'efficiency', 'operations', 'coordination', 'resource', 'timeline'],
      'customer service': ['customer', 'service', 'support', 'satisfaction', 'experience', 'communication'],
      'it': ['technical', 'system', 'integration', 'security', 'technology', 'data', 'infrastructure'],
      'hr': ['training', 'employee', 'change', 'adoption', 'people', 'organizational', 'staff'],
      'compliance': ['compliance', 'risk', 'audit', 'regulation', 'policy', 'governance', 'legal']
    }
    
    const relevantStakeholders: Stakeholder[] = []
    
    // Check each stakeholder's domain relevance
    allStakeholders.forEach(stakeholder => {
      const department = stakeholder.department.toLowerCase()
      const role = stakeholder.role.toLowerCase()
      
      // Check if question contains keywords relevant to this stakeholder
      let isRelevant = false
      
      if (department.includes('operations') || role.includes('operations')) {
        isRelevant = domainKeywords.operations.some(keyword => lowerQuestion.includes(keyword))
      }
      if (department.includes('customer') || role.includes('customer')) {
        isRelevant = isRelevant || domainKeywords['customer service'].some(keyword => lowerQuestion.includes(keyword))
      }
      if (department.includes('technology') || department.includes('it') || role.includes('it')) {
        isRelevant = isRelevant || domainKeywords.it.some(keyword => lowerQuestion.includes(keyword))
      }
      if (department.includes('human') || department.includes('hr') || role.includes('hr')) {
        isRelevant = isRelevant || domainKeywords.hr.some(keyword => lowerQuestion.includes(keyword))
      }
      if (department.includes('risk') || department.includes('compliance') || role.includes('compliance')) {
        isRelevant = isRelevant || domainKeywords.compliance.some(keyword => lowerQuestion.includes(keyword))
      }
      
      if (isRelevant) {
        relevantStakeholders.push(stakeholder)
      }
    })
    
    // If no stakeholders are deemed relevant and it's a broad business question, 
    // include the most senior stakeholder (Head of Operations)
    if (relevantStakeholders.length === 0 && (
      lowerQuestion.includes('requirement') || 
      lowerQuestion.includes('need') || 
      lowerQuestion.includes('challenge') ||
      lowerQuestion.includes('goal') ||
      lowerQuestion.includes('objective') ||
      lowerQuestion.includes('process') ||
      lowerQuestion.includes('what') ||
      lowerQuestion.includes('how') ||
      lowerQuestion.includes('why') ||
      lowerQuestion.includes('tell me')
    )) {
      const seniorStakeholder = allStakeholders.find(s => s.role.includes('Head')) || allStakeholders[0]
      if (seniorStakeholder) {
        relevantStakeholders.push(seniorStakeholder)
      }
    }
    
    return relevantStakeholders
  }

  const endMeeting = () => {
    // Stop any playing audio
    stopCurrentAudio()
    
    if (currentMeeting) {
      const updatedMeeting: Meeting = {
        ...currentMeeting,
        transcript: messages,
        status: 'completed',
        duration: Math.floor((new Date().getTime() - new Date(currentMeeting.date).getTime()) / 1000 / 60)
      }
      
      updateMeeting(currentMeeting.id, updatedMeeting)
      setCurrentMeeting(null)
      setCurrentView('notes')
    }
  }

  if (!selectedProject || selectedStakeholders.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">No stakeholders selected for the meeting</p>
          <button 
            onClick={() => setCurrentView('stakeholders')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Select Stakeholders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Meeting Header - Teams/Zoom Style */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentView('stakeholders')}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Leave Meeting</span>
          </button>
          <div className="h-6 w-px bg-gray-600"></div>
          <div>
            <h1 className="text-lg font-semibold">
              {selectedStakeholders.length > 1 ? 'Cross-Functional Requirements Meeting' : 'Stakeholder Interview'}
            </h1>
            <p className="text-sm text-gray-300">
              {selectedProject.name} • {formatMeetingDuration()}
            </p>
          </div>
        </div>
        
        {/* Meeting Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <Users className="w-4 h-4" />
            <span>{selectedStakeholders.length + 1}</span>
          </div>
          
          <button
            onClick={() => setGlobalAudioEnabled(!globalAudioEnabled)}
            className={`p-3 rounded-full transition-colors ${
              globalAudioEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={globalAudioEnabled ? 'Disable Audio Responses' : 'Enable Audio Responses'}
          >
            {globalAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`p-3 rounded-full transition-colors ${
              videoEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={videoEnabled ? 'Disable Video Responses' : 'Enable Video Responses'}
          >
            {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={endMeeting}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Phone className="w-4 h-4" />
            <span>End Meeting</span>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-white font-semibold mb-4">Meeting Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="text-gray-300 text-sm font-medium">Audio Settings</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Auto-play responses</span>
                  <button
                    onClick={() => setGlobalAudioEnabled(!globalAudioEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      globalAudioEnabled ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        globalAudioEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {isAzureTTSAvailable() ? (
                  <div className="text-xs text-green-400 flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Azure TTS Active</span>
                  </div>
                ) : (
                  <div className="text-xs text-yellow-400 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Browser TTS Fallback</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <h4 className="text-gray-300 text-sm font-medium">Video Settings</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Video responses</span>
                  <button
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      videoEnabled ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        videoEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-gray-300 text-sm font-medium">Recording</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-300 text-sm">Meeting being recorded</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Meeting Area */}
      <div className="flex-1 flex bg-gray-50">
        {/* Participants Panel */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Participants ({selectedStakeholders.length + 1})</span>
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* User */}
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">You</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">You (Business Analyst)</p>
                <p className="text-sm text-blue-600">Meeting Host</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>

            {/* Stakeholders */}
            {selectedStakeholders.map((stakeholder) => (
              <div key={stakeholder.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={stakeholder.photo}
                  alt={stakeholder.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{stakeholder.name}</p>
                  <p className="text-sm text-gray-600">{stakeholder.role}</p>
                  {stakeholder.voice && (
                    <p className="text-xs text-blue-600">{stakeholder.voice}</p>
                  )}
                  {/* Show responding indicator */}
                  {respondingStakeholder === stakeholder.id && (
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-blue-600 font-medium">Responding...</span>
                    </div>
                  )}
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  respondingStakeholder === stakeholder.id ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
                }`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat/Conversation Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Requirements Discussion</span>
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>Transcript being captured</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-sm">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Welcome to your Requirements Gathering Session</h3>
                  <p className="text-gray-600 mb-6">
                    Begin your professional stakeholder interview by asking strategic questions about business processes, 
                    requirements, and challenges. This is your opportunity to gather comprehensive insights for your Business Requirements Document.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-medium text-blue-900 mb-3">Professional BA Interview Starters:</p>
                    <ul className="text-left space-y-2 text-blue-800 text-sm">
                      <li>• "Could you walk me through your current end-to-end process?"</li>
                      <li>• "What are the primary pain points you're experiencing?"</li>
                      <li>• "How do you define success for this initiative?"</li>
                      <li>• "What are your must-have vs. nice-to-have requirements?"</li>
                      <li>• "Are there any regulatory or compliance considerations?"</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => {
              const playbackState = audioPlaybackStates.get(message.id)
              
              return (
                <div key={message.id} className="flex items-start space-x-4">
                  {message.speaker === 'user' ? (
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">You</span>
                    </div>
                  ) : (
                    <img
                      src={selectedStakeholders.find(s => s.id === message.speaker)?.photo}
                      alt={message.stakeholderName}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                    />
                  )}
                  
                  <div className="flex-1 max-w-4xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-semibold text-gray-900">
                        {message.speaker === 'user' ? 'You' : message.stakeholderName}
                      </span>
                      {message.stakeholderRole && (
                        <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                          {message.stakeholderRole}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.speaker !== 'user' && globalAudioEnabled && (
                        <button
                          onClick={() => playMessageAudio(message)}
                          disabled={playbackState?.isLoading}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 disabled:opacity-50 flex items-center space-x-1"
                          title="Play audio response"
                        >
                          {playbackState?.isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : playbackState?.isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      {playbackState?.error && (
                        <span className="text-xs text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{playbackState.error}</span>
                        </span>
                      )}
                    </div>
                    
                    <div className={`rounded-2xl p-4 shadow-sm ${
                      message.speaker === 'user' 
                        ? 'bg-blue-600 text-white ml-8' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      {/* Video Response Area (only when video is enabled and not user) */}
                      {videoEnabled && message.speaker !== 'user' && (
                        <div className="mb-4">
                          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9', maxWidth: '400px' }}>
                            <img
                              src={selectedStakeholders.find(s => s.id === message.speaker)?.photo}
                              alt={message.stakeholderName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                              <div className="bg-black bg-opacity-50 rounded-full p-3">
                                <Video className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                              {message.stakeholderName}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <p className={`leading-relaxed ${
                        message.speaker === 'user' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Show global responding indicator when any stakeholder is responding */}
            {respondingStakeholder && (
              <div className="flex items-start space-x-4">
                <img
                  src={selectedStakeholders.find(s => s.id === respondingStakeholder)?.photo}
                  alt="Responding stakeholder"
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-blue-500 shadow-sm"
                />
                <div className="flex-1 max-w-4xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-semibold text-gray-900">
                      {selectedStakeholders.find(s => s.id === respondingStakeholder)?.name}
                    </span>
                    <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                      {selectedStakeholders.find(s => s.id === respondingStakeholder)?.role}
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-blue-600 font-medium">is responding...</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking about your question...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about requirements, processes, challenges, or constraints..."
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />
                {isTranscribing && (
                  <div className="flex items-center space-x-2 mt-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Transcribing your question...</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-2">
                {isAudioRecordingSupported() && (
                  <button
                    onClick={handleVoiceInput}
                    className={`p-3 rounded-xl transition-colors ${
                      'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title="Voice input"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || respondingStakeholder !== null}
                  className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
          </div>
        </div>
      </div>

      {/* Voice Input Modal */}
      <VoiceInputModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSave={handleVoiceTranscription}
        initialText={inputMessage}
      />
    </div>
  )
}

export default MeetingView