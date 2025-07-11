// Filename: src/components/Views/MeetingView.tsx
// FINAL, ROBUST VERSION: This component is now a pure display. It reads the transcript
// directly from the `currentMeeting` object in the context.

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useVoice } from '../../contexts/VoiceContext';
import VoiceInputModal from '../VoiceInputModal';
import { stakeholderAI } from '../../lib/stakeholderAI';
import { ArrowLeft, Mic, Send, Volume2, VolumeX, Users, Loader2, MessageSquare, Play, Pause, AlertCircle } from 'lucide-react';
import { Message, Meeting } from '../../types';
import { azureTTS, isAzureTTSAvailable } from '../../lib/azureTTS';

const MeetingView: React.FC = () => {
  const {
    selectedProject,
    selectedStakeholders,
    setCurrentView,
    currentMeeting,
    setCurrentMeeting,
    addMessageToCurrentMeeting, // The new, direct update function
    meetings, // We still need the list to find the meeting
  } = useApp();

  const { globalAudioEnabled, getStakeholderVoice, isStakeholderVoiceEnabled } = useVoice();

  const [inputMessage, setInputMessage] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [audioPlayback, setAudioPlayback] = useState<any>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // This effect now simply finds and sets the current meeting from the main list.
  useEffect(() => {
    if (!selectedProject || selectedStakeholders.length === 0) return;

    const existingMeeting = meetings.find(m =>
      m.projectId === selectedProject.id &&
      m.stakeholderIds.length === selectedStakeholders.length &&
      m.stakeholderIds.every(id => selectedStakeholders.some(s => s.id === id))
    );

    if (existingMeeting) {
      setCurrentMeeting(existingMeeting);
    } else {
      // Logic to create a new meeting if one doesn't exist
      // This part should be handled by a function in AppContext ideally,
      // but we'll keep it simple for now.
      const newMeeting: Meeting = {
        id: `meeting-${Date.now()}`,
        projectId: selectedProject.id,
        stakeholderIds: selectedStakeholders.map(s => s.id),
        transcript: [{
          id: `welcome-${Date.now()}`,
          speaker: 'system',
          content: `Welcome to your new meeting for ${selectedProject.name}.`,
          timestamp: new Date().toISOString()
        }],
        date: new Date().toISOString(),
        duration: 0,
        status: 'in-progress',
      };
      // This should ideally call an `addMeeting` function in the context
      setCurrentMeeting(newMeeting);
    }
  }, [selectedProject, selectedStakeholders, meetings, setCurrentMeeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMeeting?.transcript]); // Scroll when the transcript changes

  useEffect(() => {
    if (!isAiResponding) {
      inputRef.current?.focus();
    }
  }, [isAiResponding]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isAiResponding || !currentMeeting) return;

    const userMessageText = inputMessage.trim();
    setInputMessage('');

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      content: userMessageText,
      timestamp: new Date().toISOString(),
      stakeholderName: 'Business Analyst',
    };

    // Directly update the context. This is a single, atomic operation.
    addMessageToCurrentMeeting(userMessage);
    setIsAiResponding(true);

    try {
      const aiResponseMessage = await stakeholderAI.generateResponse(
        selectedProject!,
        selectedStakeholders,
        currentMeeting.transcript, // Pass the current, definitive transcript
        userMessageText
      );

      if (aiResponseMessage.content) {
        // Directly update the context again with the AI's response.
        addMessageToCurrentMeeting(aiResponseMessage);
        if (globalAudioEnabled && aiResponseMessage.speaker !== 'system') {
          playMessageAudio(aiResponseMessage);
        }
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
    } finally {
      setIsAiResponding(false);
    }
  };
  
  // ... (The rest of your functions like playMessageAudio, endMeeting, etc., remain the same)
  // They will now correctly use `currentMeeting.transcript` because that's what's being displayed.

  if (!currentMeeting) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin" /> Loading Meeting...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        {/* Your header JSX here */}
        <h1>{selectedProject?.name}</h1>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {currentMeeting.transcript.map((message) => (
          <div key={message.id} className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg ${message.speaker === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              <p className="font-bold">{message.stakeholderName || 'System'}</p>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 p-2 border rounded"
            disabled={isAiResponding}
          />
          <button onClick={sendMessage} disabled={!inputMessage.trim() || isAiResponding} className="p-2 bg-blue-500 text-white rounded">
            <Send />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingView;
