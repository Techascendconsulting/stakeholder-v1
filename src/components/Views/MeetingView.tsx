// Working meetingview.tsx


import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext' // Adjust path if needed
import { useVoice } from '../../contexts/VoiceContext' // Adjust path if needed
import VoiceInputModal from '../VoiceInputModal' // Adjust path if needed
import { stakeholderAI } from '../../lib/stakeholderAI' // Adjust path if needed
import { 
  ArrowLeft, Mic, Send, Volume2, VolumeX, Users, Loader2, MessageSquare, Play, Pause, AlertCircle
} from 'lucide-react'
import { isAudioRecordingSupported } from '../../lib/whisper' // Adjust path if needed
import { azureTTS, isAzureTTSAvailable, playBrowserTTS } from '../../lib/azureTTS' // Adjust path if needed
import { Message, Meeting } from '../../types' // Adjust path if needed

interface AudioPlaybackState {
  messageId: string
  isPlaying: boolean
  isLoading: boolean
  error?: string
}

const MeetingView: React.FC = () => {
  const { 
    selectedProject, selectedStakeholders, setCurrentView, addMeeting, updateMeeting, currentMeeting, setCurrentMeeting, addMessageToCurrentMeeting
  } = useApp()
  
  const { 
    globalAudioEnabled, setGlobalAudioEnabled, getStakeholderVoice, isStakeholderVoiceEnabled 
  } = useVoice()

  const [inputMessage, setInputMessage] = useState('')
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false)
  const [meetingStartTime] = useState(new Date())
  const [audioPlayback, setAudioPlayback] = useState<AudioPlaybackState | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get messages from current meeting transcript
  const messages = currentMeeting?.transcript || []

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
        timestamp: new Date().toISOString(),
        stakeholderName: 'System'
      }
      
      // Add welcome message to the meeting
      const updatedMeeting = {
        ...newMeeting,
        transcript: [welcomeMessage]
      }
      setCurrentMeeting(updatedMeeting)
      updateMeeting(newMeeting.id, { transcript: [welcomeMessage] })
    }
  }, [selectedProject, selectedStakeholders, currentMeeting, addMeeting, setCurrentMeeting, updateMeeting]);

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
    if (!inputMessage.trim() || isAiResponding) return;

    const userMessageText = inputMessage.trim();
    setInputMessage('');

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      content: userMessageText,
      timestamp: new Date().toISOString(),
      stakeholderName: 'Business Analyst'
    };

    // Add user message to current meeting
    addMessageToCurrentMeeting(userMessage);
    const updatedMessagesWithUser = [...messages, userMessage];
    setIsAiResponding(true);

    try {
      // Call the new, simplified AI function. It returns one single message block.
      const aiResponseMessage = await stakeholderAI.generateResponse(
        selectedProject,
        selectedStakeholders,
        updatedMessagesWithUser, // Pass the most up-to-date message list
        userMessageText
      );

      // Add the AI's response to the chat, but only if it's not empty.
      if (aiResponseMessage.content) {
        addMessageToCurrentMeeting(aiResponseMessage);
        
        // Audio playback for system-generated multi-responses is complex,
        // so we will only play audio for single-speaker messages for now.
        if (globalAudioEnabled && aiResponseMessage.speaker !== 'system') {
          setTimeout(() => playMessageAudio(aiResponseMessage), 300);
        }
      }

    } catch (error) {
      console.error('Error in sendMessage:', error);
      const fallbackMessage: Message = {
        id: `msg-${Date.now()}-fallback`,
        speaker: 'system',
        content: "I'm sorry, a critical error occurred. Please try again.",
        timestamp: new Date().toISOString(),
        stakeholderName: 'System',
        stakeholderRole: 'Error'
      };
      addMessageToCurrentMeeting(fallbackMessage);
    } finally {
      setIsAiResponding(false);
    }
  };

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
    if (!message.stakeholderName || message.speaker === 'user' || message.speaker === 'system') return

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
        duration
      })
      setCurrentMeeting(null)
    }
    setCurrentView('notes')
  }

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const getStakeholderById = (id: string) => selectedStakeholders.find(s => s.id === id)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentView('stakeholders')} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Group Meeting</h1>
              <p className="text-sm text-gray-600">{selectedProject.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">{selectedStakeholders.length} participants</span>
            <button onClick={() => setGlobalAudioEnabled(!globalAudioEnabled)} className={`p-2 rounded-lg ${globalAudioEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
              {globalAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button onClick={endMeeting} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              End Meeting
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4">
          {selectedStakeholders.map((stakeholder) => (
            <div key={stakeholder.id} className="flex items-center space-x-2">
              <img src={stakeholder.photo} alt={stakeholder.name} className="w-8 h-8 rounded-full object-cover" />
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
          const stakeholder = message.speaker !== 'user' && message.speaker !== 'system' ? getStakeholderById(message.speaker) : null;
          return (
            <div key={message.id} className={`flex items-start space-x-3 ${message.speaker === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className="flex-shrink-0">
                {message.speaker === 'user' ? (<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"><span className="text-white font-medium">BA</span></div>)
                : message.speaker === 'system' ? (<div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center"><MessageSquare className="w-5 h-5 text-white" /></div>)
                : stakeholder ? (<img src={stakeholder.photo} alt={stakeholder.name} className="w-10 h-10 rounded-full object-cover" />)
                : (<div className="w-10 h-10 bg-gray-400 rounded-full" />)}
              </div>
              <div className={`flex-1 max-w-3xl ${message.speaker === 'user' ? 'text-right' : ''}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{message.speaker === 'user' ? 'You' : message.stakeholderName || 'System'}</span>
                  <span className="text-xs text-gray-500">{formatTime(new Date(message.timestamp))}</span>
                </div>
                <div className={`inline-block p-3 rounded-lg ${message.speaker === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
                  {/* The whitespace-pre-wrap is important for showing the script-like format */}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          );
        })}
        {isAiResponding && (
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-600" /></div>
            <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-sm text-gray-600 italic">Stakeholders are responding...</p></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <input ref={inputRef} type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your question or message..." disabled={isAiResponding || isTranscribing} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              {isAudioRecordingSupported() && (
                <button onClick={() => setIsVoiceModalOpen(true)} disabled={isAiResponding} className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600">
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <button onClick={sendMessage} disabled={!inputMessage.trim() || isAiResponding} className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <VoiceInputModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} onSave={handleVoiceInput} onTranscribingChange={setIsTranscribing} />
    </div>
  );
}

export default MeetingView;