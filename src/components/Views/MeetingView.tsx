import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useVoice } from '../../contexts/VoiceContext'
import VoiceInputModal from '../VoiceInputModal'
import { stakeholderAI } from '../../lib/stakeholderAI'
import { 
  ArrowLeft, Mic, Send, Volume2, VolumeX, Users, Clock, Settings, Loader2, Video, VideoOff, Phone, MoreHorizontal, MessageSquare, FileText, Play, Pause, AlertCircle
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
    selectedProject, selectedStakeholders, setCurrentView, addMeeting, updateMeeting, currentMeeting, setCurrentMeeting 
  } = useApp()
  
  const { 
    globalAudioEnabled, setGlobalAudioEnabled, getStakeholderVoice, isStakeholderVoiceEnabled 
  } = useVoice()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false)
  const [meetingStartTime] = useState(new Date())
  const [audioPlayback, setAudioPlayback] = useState<AudioPlaybackState | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        speaker: 'system',
        content: `Welcome to your ${newMeeting.meetingType} meeting for ${selectedProject.name}. The stakeholders are ready to discuss the project requirements. You can start by greeting them.`,
        timestamp: new Date().toISOString()
      }
      
      setMessages([welcomeMessage])
    }
  }, [selectedProject, selectedStakeholders, currentMeeting, addMeeting, setCurrentMeeting])

  if (!selectedProject || selectedStakeholders.length === 0) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Meeting Configuration</h3>
        <p className="text-gray-600 mb-6">Please select a project and stakeholders to start a meeting.</p>
        <button onClick={() => setCurrentView('projects')} className="text-blue-600 hover:text-blue-800 font-medium">
          Back to Projects
        </button>
      </div>
    )
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isAiResponding) return

    const userMessageText = inputMessage.trim();
    setInputMessage('');

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      content: userMessageText,
      timestamp: new Date().toISOString(),
      stakeholderName: 'Business Analyst'
    }

    const updatedMessagesWithUser = [...messages, userMessage];
    setMessages(updatedMessagesWithUser);
    setIsAiResponding(true);

    const conversationContext = {
      projectId: selectedProject.id,
      stakeholderIds: selectedStakeholders.map(s => s.id),
      messages: updatedMessagesWithUser,
      meetingType: selectedStakeholders.length > 1 ? 'group' as const : 'individual' as const
    };

    try {
      const aiResponseMessage = await stakeholderAI.generateGroupResponse(
        conversationContext,
        selectedProject,
        selectedStakeholders,
        userMessageText
      );

      setMessages(prevMessages => [...prevMessages, aiResponseMessage]);

      if (globalAudioEnabled && aiResponseMessage.speaker !== 'user') {
        setTimeout(() => playMessageAudio(aiResponseMessage), 300);
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      const fallbackMessage: Message = {
        id: `msg-${Date.now()}-fallback`,
        speaker: 'system',
        content: "I'm sorry, I seem to have encountered a technical issue. Could you please try asking that again?",
        timestamp: new Date().toISOString(),
        stakeholderName: 'System',
        stakeholderRole: 'Error'
      };
      setMessages(prevMessages => [...prevMessages, fallbackMessage]);
    } finally {
      setIsAiResponding(false);
    }
  }
  
  useEffect(() => {
    if (currentMeeting && messages.length > currentMeeting.transcript.length) {
      updateMeeting(currentMeeting.id, { transcript: messages });
    }
  }, [messages, currentMeeting, updateMeeting]);

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

    setAudioPlayback({ messageId: message.id, isPlaying: false, isLoading: true })

    try {
      if (isAzureTTSAvailable()) {
        const voiceName = getStakeholderVoice(stakeholder.id, stakeholder.role)
        const audioBlob = await azureTTS.synthesizeSpeech(message.content, voiceName)
        setAudioPlayback({ messageId: message.id, isPlaying: true, isLoading: false })
        await azureTTS.playAudio(audioBlob)
      } else {
        setAudioPlayback({ messageId: message.id, isPlaying: true, isLoading: false })
        await playBrowserTTS(message.content)
      }
    } catch (error) {
      console.error('Audio playback error:', error)
      setAudioPlayback({ messageId: message.id, isPlaying: false, isLoading: false, error: 'Audio playback failed' })
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

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const getStakeholderById = (id: string) => selectedStakeholders.find(s => s.id === id)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Meeting Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentView('stakeholders')} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{selectedStakeholders.length > 1 ? 'Group Meeting' : 'Individual Interview'}</h1>
                <p className="text-sm text-gray-600">{selectedProject.name} • Started {formatTime(meetingStartTime)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{selectedStakeholders.length} participant{selectedStakeholders.length !== 1 ? 's' : ''}</span>
            </div>
            <button onClick={() => setGlobalAudioEnabled(!globalAudioEnabled)} className={`p-2 rounded-lg transition-colors ${globalAudioEnabled ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title={globalAudioEnabled ? 'Disable audio' : 'Enable audio'}>
              {globalAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button onClick={endMeeting} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
              End Meeting
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4">