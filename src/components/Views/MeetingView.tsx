// Filename: src/components/Views/MeetingView.tsx
// FINAL VERSION WITH STATE MANAGEMENT FIX: This code correctly handles conversation history,
// which fixes the chat restarting bug and makes the voice input work as intended.

import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useVoice } from '../../contexts/VoiceContext'
import VoiceInputModal from '../VoiceInputModal'
import { stakeholderAI } from '../../lib/stakeholderAI'
import { 
  ArrowLeft, Mic, Send, Volume2, VolumeX, Users, Loader2, MessageSquare, Play, Pause, AlertCircle
} from 'lucide-react'
import { isAudioRecordingSupported } from '../../lib/whisper'
import { azureTTS, isAzureTTSAvailable, playBrowserTTS } from '../../lib/azureTTS'
import { Message, Meeting } from '../../types'

interface AudioPlaybackState {
  messageId: string
  isPlaying: boolean
  isLoading: boolean
  audioObject?: HTMLAudioElement
}

const MeetingView: React.FC = () => {
  const { 
    selectedProject, 
    selectedStakeholders, 
    setCurrentView, 
    addMeeting, 
    updateMeeting, 
    currentMeeting, 
    setCurrentMeeting,
    meetings // Assuming `useApp` context provides the list of all meetings
  } = useApp()
  
  const { 
    globalAudioEnabled, setGlobalAudioEnabled, getStakeholderVoice, isStakeholderVoiceEnabled 
  } = useVoice()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false)
  const [audioPlayback, setAudioPlayback] = useState<AudioPlaybackState | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Add this entire useEffect block to your MeetingView.tsx file

useEffect(() => {
  // This effect runs whenever 'isAiResponding' changes.
  if (!isAiResponding) {
    // If the AI is NOT responding, it means it just finished.
    // We will focus the input field so the user can type immediately.
    inputRef.current?.focus();
  }
}, [isAiResponding]); // The dependency array ensures this runs only when isAiResponding changes.


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages]);

  // This useEffect will clean up the audio object when the component unmounts
  useEffect(() => {
    return () => {
      if (audioPlayback?.audioObject) {
        audioPlayback.audioObject.pause();
      }
    };
  }, [audioPlayback]);

  // =================================================================================
  // THE CORE FIX: This new useEffect correctly handles loading and creating meetings.
  // =================================================================================
  useEffect(() => {
    if (!selectedProject || selectedStakeholders.length === 0) {
      return; // Do nothing if we don't have what we need.
    }

    // 1. Find an existing meeting for this project and stakeholder group.
    const existingMeeting = meetings.find(m => 
      m.projectId === selectedProject.id &&
      // This checks if the stakeholder groups are the same, regardless of order.
      m.stakeholderIds.length === selectedStakeholders.length &&
      m.stakeholderIds.every(id => selectedStakeholders.some(s => s.id === id))
    );

    if (existingMeeting) {
      // 2. If a meeting exists, LOAD its history.
      setCurrentMeeting(existingMeeting);
      setMessages(existingMeeting.transcript);
    } else {
      // 3. If NO meeting exists, CREATE a new one.
      const newMeeting: Meeting = {
        id: `meeting-${Date.now()}`,
        projectId: selectedProject.id,
        stakeholderIds: selectedStakeholders.map(s => s.id),
        meetingType: selectedStakeholders.length === 1 ? 'individual' : 'group',
        transcript: [], // Start with an empty transcript
        date: new Date().toISOString(),
        duration: 0,
        status: 'in-progress'
      };
      
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        speaker: 'system',
        content: `Welcome to your new group meeting for ${selectedProject.name}. The stakeholders are ready to discuss the project requirements. You can start by greeting them.`,
        timestamp: new Date().toISOString()
      };

      // The initial transcript only contains the welcome message.
      newMeeting.transcript = [welcomeMessage];

      addMeeting(newMeeting);
      setCurrentMeeting(newMeeting);
      setMessages(newMeeting.transcript);
    }
  }, [selectedProject, selectedStakeholders]); // This hook only runs when the project or stakeholders change.


  // This useEffect saves the transcript to the meeting object whenever messages change.
  useEffect(() => {
    if (currentMeeting && messages.length > 0) {
      // Check to prevent unnecessary updates on initial load.
      if (JSON.stringify(currentMeeting.transcript) !== JSON.stringify(messages)) {
        updateMeeting(currentMeeting.id, { transcript: messages });
      }
    }
  }, [messages, currentMeeting, updateMeeting]);


  if (!selectedProject || selectedStakeholders.length === 0 || !currentMeeting) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Meeting...</h3>
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
    
    // Use the functional form of setMessages to ensure we're always updating the latest state.
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsAiResponding(true);

    try {
      const aiResponseMessage = await stakeholderAI.generateResponse(
        selectedProject,
        selectedStakeholders,
        updatedMessages, // Pass the most up-to-date message list
        userMessageText
      );

      if (aiResponseMessage.content) {
        setMessages(prevMessages => [...prevMessages, aiResponseMessage]);
        if (globalAudioEnabled && aiResponseMessage.speaker !== 'system') {
          setTimeout(() => playMessageAudio(aiResponseMessage), 500);
        }
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
    } finally {
      setIsAiResponding(false);
    }
  };

  const stopCurrentAudio = () => {
    if (audioPlayback?.audioObject) {
      audioPlayback.audioObject.pause();
      audioPlayback.audioObject.currentTime = 0;
    }
    setAudioPlayback(null);
  };

  const playMessageAudio = async (message: Message) => {
    if (audioPlayback) stopCurrentAudio();
    
    const stakeholder = selectedStakeholders.find(s => s.id === message.speaker);
    if (!stakeholder || !isStakeholderVoiceEnabled(stakeholder.id)) return;

    setAudioPlayback({ messageId: message.id, isPlaying: false, isLoading: true });

    try {
      const lines = message.content.split('\n');
      const speakerLine = lines.find(line => line.startsWith(stakeholder.name)) || message.content;
      const speechText = speakerLine.replace(`${stakeholder.name}:`, '').trim();

      const voiceName = getStakeholderVoice(stakeholder.id, stakeholder.role);
      const audioBlob = await azureTTS.synthesizeSpeech(speechText, voiceName);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => setAudioPlayback(null);
      audio.play();

      setAudioPlayback({
        messageId: message.id,
        isPlaying: true,
        isLoading: false,
        audioObject: audio
      });

    } catch (error) {
      console.error('Audio playback error:', error);
      setAudioPlayback({ messageId: message.id, isPlaying: false, isLoading: false });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceInput = (transcription: string) => {
    setInputMessage(transcription);
    inputRef.current?.focus();
  };

  const endMeeting = () => {
    stopCurrentAudio();
    if (currentMeeting) {
      const duration = Math.floor((Date.now() - new Date(currentMeeting.date).getTime()) / 1000 / 60);
      updateMeeting(currentMeeting.id, { status: 'completed', duration, transcript: messages });
      setCurrentMeeting(null);
    }
    setCurrentView('projects'); // Go back to projects list after ending
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentView('projects')} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
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
            <button onClick={() => { setGlobalAudioEnabled(!globalAudioEnabled); if (globalAudioEnabled) stopCurrentAudio(); }} className={`p-2 rounded-lg ${globalAudioEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
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
          const isThisMessagePlaying = audioPlayback?.messageId === message.id && audioPlayback.isPlaying;
          const isThisMessageLoading = audioPlayback?.messageId === message.id && audioPlayback.isLoading;
          const canThisMessageBePlayed = message.speaker !== 'user' && message.speaker !== 'system';

          return (
            <div key={message.id} className={`flex items-start space-x-3 ${message.speaker === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className="flex-shrink-0">
                {message.speaker === 'user' ? (<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"><span className="text-white font-medium">BA</span></div>)
                : (<div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center"><MessageSquare className="w-5 h-5 text-white" /></div>)}
              </div>
              <div className={`flex-1 max-w-3xl ${message.speaker === 'user' ? 'text-right' : ''}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{message.speaker === 'user' ? 'You' : message.stakeholderName || 'System'}</span>
                  <span className="text-xs text-gray-500">{formatTime(new Date(message.timestamp))}</span>
                  
                  {canThisMessageBePlayed && (
                    <div className="flex items-center space-x-1">
                      {isThisMessageLoading ? (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      ) : isThisMessagePlaying ? (
                        <button onClick={stopCurrentAudio} className="p-1 text-red-500 hover:text-red-700" title="Stop">
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => playMessageAudio(message)} className="p-1 text-gray-400 hover:text-blue-600" title="Play">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className={`inline-block p-3 rounded-lg ${message.speaker === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
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
