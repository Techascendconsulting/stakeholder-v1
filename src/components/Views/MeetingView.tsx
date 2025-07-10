import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useVoice } from '../../contexts/VoiceContext'
import VoiceInputModal from '../VoiceInputModal'
import { stakeholderAI } from '../../lib/stakeholderAI'
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
    updateMeeting,
    currentMeeting,
    setCurrentMeeting
  } = useApp()
  
  const { 
    globalAudioEnabled, 
    setGlobalAudioEnabled, 
    getStakeholderVoice, 
    isStakeholderVoiceEnabled 
  } = useVoice()

  // State management
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)
  const [respondingStakeholder, setRespondingStakeholder] = useState<string | null>(null)
  const [meetingStartTime] = useState(new Date())
  const [audioPlayback, setAudioPlayback] = useState<AudioPlaybackState | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize meeting when component mounts
  useEffect(() => {
    if (selectedProject && selectedStakeholders.length > 0 && !currentMeeting) {
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
      
      addMeeting(newMeeting)
      setCurrentMeeting(newMeeting)
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        speaker: 'system',
        content: `Welcome to your ${newMeeting.meetingType} meeting for ${selectedProject.name}. The stakeholders are ready to discuss the project requirements.`,
        timestamp: new Date().toISOString()
      }
      
      setMessages([welcomeMessage])
    }
  }, [selectedProject, selectedStakeholders, currentMeeting, addMeeting, setCurrentMeeting])

  // Check if we have the required data
  if (!selectedProject || selectedStakeholders.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Meeting Configuration</h3>
          <p className="text-gray-600 mb-6">Please select a project and stakeholders to start a meeting</p>
          <button
            onClick={() => setCurrentView('projects')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Projects
          </button>
        </div>
      </div>
    )
  }

  const handleAIResponse = async (userMessageText: string, currentMessages: Message[]) => {
    if (!selectedProject || selectedStakeholders.length === 0) return;

    const conversationContext = {
      projectId: selectedProject.id,
      stakeholderIds: selectedStakeholders.map(s => s.id),
      messages: currentMessages,
      meetingType: selectedStakeholders.length > 1 ? 'group' as const : 'individual' as const
    };

    // Set loading state to show "Stakeholder is typing..." indicator
    setRespondingStakeholder('system'); // Use 'system' to indicate general loading

    try {
      // Call the AI to get the stakeholder's response
      const aiResponseMessage = await stakeholderAI.generateGroupResponse(
        conversationContext,
        selectedProject,
        selectedStakeholders,
        userMessageText
      );

      // Add the AI's response to the chat history
      const newMessages = [...currentMessages, aiResponseMessage];
      setMessages(newMessages);

      // Update meeting with new message
      if (currentMeeting) {
        updateMeeting(currentMeeting.id, { transcript: newMessages });
      }

      // Auto-play audio if enabled
      if (globalAudioEnabled && aiResponseMessage.speaker !== 'user') {
        setTimeout(() => {
          playMessageAudio(aiResponseMessage);
        }, 300);
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback response if AI fails
      const fallbackMessage: Message = {
        id: `msg-${Date.now()}-fallback`,
        speaker: selectedStakeholders[0]?.id || 'system',
        content: "I'm sorry, I seem to have encountered a technical issue. Could you please try asking that again?",
        timestamp: new Date().toISOString(),
        stakeholderName: selectedStakeholders[0]?.name || 'System',
        stakeholderRole: selectedStakeholders[0]?.role || 'System'
      };
      
      const newMessages = [...currentMessages, fallbackMessage];
      setMessages(newMessages);
      
      if (currentMeeting) {
        updateMeeting(currentMeeting.id, { transcript: newMessages });
      }
    } finally {
      // Clear loading state
      setRespondingStakeholder(null);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || respondingStakeholder) return

    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      stakeholderName: 'Business Analyst'
    }

    // Add user message to chat
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage('')

    // Update meeting with user message
    if (currentMeeting) {
      updateMeeting(currentMeeting.id, { transcript: newMessages })
    }

    // Generate AI response
    await handleAIResponse(userMessage.content, newMessages)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleVoiceInput = (transcription: string) => {
    setInputMessage(transcription)
    inputRef.current?.focus()
  }

  const playMessageAudio = async (message: Message) => {
    if (!message.stakeholderName || message.speaker === 'user') return

    const stakeholder = selectedStakeholders.find(s => s.id === message.speaker)
    if (!stakeholder || !isStakeholderVoiceEnabled(stakeholder.id)) return

    setAudioPlayback({
      messageId: message.id,
      isPlaying: false,
      isLoading: true
    })

    try {
      if (isAzureTTSAvailable()) {
        const voiceName = getStakeholderVoice(stakeholder.id, stakeholder.role)
        const audioBlob = await azureTTS.synthesizeSpeech(message.content, voiceName)
        
        setAudioPlayback({
          messageId: message.id,
          isPlaying: true,
          isLoading: false
        })

        await azureTTS.playAudio(audioBlob)
      } else {
        setAudioPlayback({
          messageId: message.id,
          isPlaying: true,
          isLoading: false
        })
        await playBrowserTTS(message.content)
      }
    } catch (error) {
      console.error('Audio playback error:', error)
      setAudioPlayback({
        messageId: message.id,
        isPlaying: false,
        isLoading: false,
        error: 'Audio playback failed'
      })
    } finally {
      setTimeout(() => setAudioPlayback(null), 500)
    }
  }

  const endMeeting = () => {
    if (currentMeeting) {
      const duration = Math.floor((Date.now() - new Date(currentMeeting.date).getTime()) / 1000 / 60)
      updateMeeting(currentMeeting.id, { 
        status: 'completed',
        duration,
        transcript: messages
      })
      setCurrentMeeting(null)
    }
    setCurrentView('notes')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStakeholderById = (id: string) => {
    return selectedStakeholders.find(s => s.id === id)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Meeting Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('stakeholders')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {selectedStakeholders.length > 1 ? 'Group Meeting' : 'Individual Interview'}
                </h1>
                <p className="text-sm text-gray-600">
                  {selectedProject.name} • Started {formatTime(meetingStartTime)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Participants */}
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {selectedStakeholders.length} participant{selectedStakeholders.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setGlobalAudioEnabled(!globalAudioEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                globalAudioEnabled 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={globalAudioEnabled ? 'Disable audio' : 'Enable audio'}
            >
              {globalAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* End Meeting */}
            <button
              onClick={endMeeting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              End Meeting
            </button>
          </div>
        </div>

        {/* Stakeholder Avatars */}
        <div className="flex items-center space-x-3 mt-4">
          {selectedStakeholders.map((stakeholder) => (
            <div key={stakeholder.id} className="flex items-center space-x-2">
              <img
                src={stakeholder.photo}
                alt={stakeholder.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{stakeholder.name}</p>
                <p className="text-xs text-gray-600">{stakeholder.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => {
          const stakeholder = message.speaker !== 'user' && message.speaker !== 'system' 
            ? getStakeholderById(message.speaker) 
            : null

          return (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.speaker === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.speaker === 'user' ? (
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">BA</span>
                  </div>
                ) : message.speaker === 'system' ? (
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                ) : stakeholder ? (
                  <img
                    src={stakeholder.photo}
                    alt={stakeholder.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">?</span>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 max-w-3xl ${message.speaker === 'user' ? 'text-right' : ''}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {message.speaker === 'user' 
                      ? 'You' 
                      : message.stakeholderName || 'System'}
                  </span>
                  {message.stakeholderRole && (
                    <span className="text-xs text-blue-600 font-medium">
                      {message.stakeholderRole}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  
                  {/* Audio Controls */}
                  {message.speaker !== 'user' && message.speaker !== 'system' && stakeholder && (
                    <button
                      onClick={() => playMessageAudio(message)}
                      disabled={audioPlayback?.messageId === message.id && audioPlayback.isLoading}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Play audio"
                    >
                      {audioPlayback?.messageId === message.id ? (
                        audioPlayback.isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : audioPlayback.isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.speaker === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.speaker === 'system'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        {/* Typing Indicator */}
        {respondingStakeholder && (
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 italic">
                Stakeholder is thinking...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question or message..."
                disabled={respondingStakeholder !== null || isTranscribing}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              
              {/* Voice Input Button */}
              {isAudioRecordingSupported() && (
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  disabled={respondingStakeholder !== null}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Voice input"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || respondingStakeholder !== null}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {isTranscribing && (
          <div className="mt-2 flex items-center space-x-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Transcribing audio...</span>
          </div>
        )}
      </div>

      {/* Voice Input Modal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSave={handleVoiceInput}
        onTranscribingChange={setIsTranscribing}
      />
    </div>
  )
}

export default MeetingView