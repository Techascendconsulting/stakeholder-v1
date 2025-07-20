import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useVoice } from '../../contexts/VoiceContext';
import { Mic, Phone, Send, PhoneOff, Volume2, VolumeX, Users, Clock, MessageSquare } from 'lucide-react';
import VoiceInputModal from '../VoiceInputModal';

const VoiceOnlyMeetingView: React.FC = () => {
  const { 
    selectedProject, 
    selectedStakeholders,
    setCurrentView,
    setCurrentMeeting 
  } = useApp();
  
  const { globalAudioEnabled, setGlobalAudioEnabled } = useVoice();
  
  // State management
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] = useState<string>('Ready to start conversation');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Meeting timer
  useEffect(() => {
    if (meetingStarted) {
      intervalRef.current = setInterval(() => {
        setMeetingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [meetingStarted]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start meeting
  const startMeeting = () => {
    setMeetingStarted(true);
    setConversationStatus('Meeting in progress...');
    
    // Create meeting record
    const newMeeting = {
      id: `voice-meeting-${Date.now()}`,
      projectId: selectedProject?.id || '',
      projectName: selectedProject?.name || '',
      stakeholders: selectedStakeholders.map(s => s.name),
      startTime: new Date().toISOString(),
      endTime: null,
      mode: 'voice-only' as const,
      status: 'active' as const
    };
    
    setCurrentMeeting(newMeeting);
  };

  // End meeting
  const endMeeting = () => {
    setMeetingStarted(false);
    setConversationStatus('Meeting ended');
    setCurrentSpeaker(null);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Navigate back to dashboard or show summary
    setTimeout(() => {
      setCurrentView('dashboard');
    }, 2000);
  };

  // Handle voice input
  const handleVoiceInput = (text: string) => {
    setInputMessage(text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle transcribing state
  const handleTranscribingChange = (transcribing: boolean) => {
    setIsTranscribing(transcribing);
  };

  // Send message/question
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !meetingStarted) return;

    setIsLoading(true);
    setConversationStatus('Processing your question...');
    
    const question = inputMessage.trim();
    setInputMessage('');

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate stakeholder response
      const respondingStakeholder = selectedStakeholders[Math.floor(Math.random() * selectedStakeholders.length)];
      setCurrentSpeaker(respondingStakeholder.name);
      setConversationStatus(`${respondingStakeholder.name} is responding...`);
      
      // Simulate response duration
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setCurrentSpeaker(null);
      setConversationStatus('Ready for next question');
      
    } catch (error) {
      console.error('Error processing question:', error);
      setConversationStatus('Error processing question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{selectedProject?.name}</h1>
              <p className="text-gray-300 text-sm">Voice-Only Meeting</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Meeting Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${meetingStarted ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-sm">{meetingStarted ? 'Live' : 'Ready'}</span>
              </div>
              
              {/* Duration */}
              {meetingStarted && (
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(meetingDuration)}</span>
                </div>
              )}
              
              {/* Audio Toggle */}
              <button
                onClick={() => setGlobalAudioEnabled(!globalAudioEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  globalAudioEnabled 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {globalAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {!meetingStarted ? (
          /* Pre-Meeting Setup */
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Your Voice Meeting</h2>
              <p className="text-gray-300 mb-6">
                Connect with your stakeholders through natural conversation
              </p>
              
              {/* Stakeholders */}
              <div className="bg-black/20 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3 flex items-center justify-center">
                  <Users className="w-5 h-5 mr-2" />
                  Meeting Participants
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedStakeholders.map(stakeholder => (
                    <div key={stakeholder.id} className="bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 text-sm">
                      {stakeholder.name} - {stakeholder.role}
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={startMeeting}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors flex items-center space-x-2 mx-auto"
              >
                <Phone className="w-6 h-6" />
                <span>Start Voice Meeting</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Meeting Interface */
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">{conversationStatus}</h2>
              {currentSpeaker && (
                <div className="flex items-center justify-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>{currentSpeaker} is speaking...</span>
                </div>
              )}
            </div>

            {/* Question Input Area */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Ask Your Question
              </h3>
              
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={meetingStarted ? "Type your question..." : "Start the meeting to ask questions"}
                    className="flex-1 bg-black/20 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!meetingStarted || isLoading}
                  />
                  <button
                    onClick={() => setShowVoiceModal(true)}
                    disabled={!meetingStarted || isLoading || isTranscribing}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed flex items-center space-x-2"
                    title="Voice Input"
                  >
                    <Mic className="w-5 h-5" />
                    {isTranscribing && (
                      <span className="text-sm">Recording...</span>
                    )}
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!meetingStarted || !inputMessage.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                {isLoading && (
                  <div className="text-center text-gray-400">
                    <div className="inline-flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <span className="ml-2">Processing...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* End Meeting */}
            <div className="text-center">
              <button
                onClick={endMeeting}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Meeting</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Voice Input Modal */}
      <VoiceInputModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSave={handleVoiceInput}
        onTranscribingChange={handleTranscribingChange}
      />
    </div>
  );
};

export default VoiceOnlyMeetingView;