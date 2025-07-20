import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, Send, Users, Clock, Volume2, Play, Pause, Square, Phone, PhoneOff, Settings, MoreVertical } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useVoice } from '../../contexts/VoiceContext';
import { Message } from '../../types';
import AIService, { StakeholderContext, ConversationContext } from '../../services/aiService';
import { azureTTS, playBrowserTTS, isAzureTTSAvailable } from '../../lib/azureTTS';
import VoiceInputModal from '../VoiceInputModal';

interface ParticipantCardProps {
  participant: any;
  isCurrentSpeaker: boolean;
  isThinking: boolean;
  isUser?: boolean;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ 
  participant, 
  isCurrentSpeaker, 
  isThinking, 
  isUser = false 
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = () => {
    if (isUser) return 'bg-blue-600';
    const colors = ['bg-purple-600', 'bg-green-600', 'bg-yellow-600', 'bg-red-600', 'bg-indigo-600', 'bg-pink-600'];
    const index = participant.name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="relative bg-gray-800 rounded-lg p-4 aspect-video flex flex-col items-center justify-center border-2 transition-all duration-300 hover:bg-gray-750">
      {/* Speaking Ring */}
      {isCurrentSpeaker && (
        <div className="absolute inset-0 rounded-lg border-4 border-green-400 animate-pulse"></div>
      )}
      
      {/* Thinking Ring */}
      {isThinking && !isCurrentSpeaker && (
        <div className="absolute inset-0 rounded-lg border-4 border-yellow-400 animate-pulse"></div>
      )}
      
      {/* Avatar */}
      <div className={`w-16 h-16 rounded-full ${getAvatarColor()} flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg`}>
        {getInitials(participant.name)}
      </div>
      
      {/* Name */}
      <div className="text-center">
        <h3 className="text-white font-medium text-sm mb-1">{participant.name}</h3>
        <p className="text-gray-400 text-xs">{participant.role}</p>
      </div>
      
      {/* Status Indicators */}
      <div className="absolute top-2 left-2">
        {isCurrentSpeaker && (
          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <Volume2 className="w-3 h-3 mr-1" />
            Speaking
          </div>
        )}
        {isThinking && !isCurrentSpeaker && (
          <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
            Thinking
          </div>
        )}
      </div>
      
      {/* Speaking Animation */}
      {isCurrentSpeaker && (
        <div className="absolute bottom-2 right-2 flex space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      )}
    </div>
  );
};

interface SpeakingQueueHeaderProps {
  currentSpeaker: string | null;
  upcomingQueue: { name: string; id?: string }[];
}

const SpeakingQueueHeader: React.FC<SpeakingQueueHeaderProps> = ({ currentSpeaker, upcomingQueue }) => {
  if (!currentSpeaker && upcomingQueue.length === 0) return null;
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center space-x-4">
      {currentSpeaker && (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">Speaking: {currentSpeaker}</span>
        </div>
      )}
      
      {upcomingQueue.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Up next:</span>
          <div className="flex space-x-2">
            {upcomingQueue.slice(0, 3).map((speaker, index) => (
              <div key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                {speaker.name}
              </div>
            ))}
            {upcomingQueue.length > 3 && (
              <div className="text-gray-400 text-xs">+{upcomingQueue.length - 3} more</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const VoiceOnlyMeetingView: React.FC = () => {
  const { selectedProject, selectedStakeholders, setCurrentView } = useApp();
  const { globalAudioEnabled, getStakeholderVoice, isStakeholderVoiceEnabled } = useVoice();
  
  // State management (same as before)
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioStates, setAudioStates] = useState<{[key: string]: 'playing' | 'paused' | 'stopped'}>({});
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<any>(null);
  
  // Dynamic UX state management
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [thinkingStakeholders, setThinkingStakeholders] = useState<Set<string>>(new Set());
  const [dynamicFeedback, setDynamicFeedback] = useState<string | null>(null);
  const [responseQueue, setResponseQueue] = useState<{
    current: string | null;
    upcoming: { name: string; id?: string }[];
  }>({ current: null, upcoming: [] });
  
  // Meeting timer
  const [meetingStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - meetingStartTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [meetingStartTime]);

  // Initialize conversation
  useEffect(() => {
    if (selectedProject && selectedStakeholders.length > 0) {
      const aiService = AIService.getInstance();
      aiService.resetConversationState();
      
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        speaker: 'system',
        content: `Welcome to your voice meeting for ${selectedProject?.name}. The following stakeholders are present: ${selectedStakeholders.map(s => s.name).join(', ')}.`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
      
      // Auto-play welcome message
      if (globalAudioEnabled) {
        speakMessage(welcomeMessage);
      }
    }
  }, [selectedProject, selectedStakeholders]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  };

  // Audio management (same as before)
  const speakMessage = async (message: Message) => {
    if (!globalAudioEnabled) return;

    const stakeholder = selectedStakeholders.find(s => s.name === message.speaker);
    const voiceId = stakeholder ? getStakeholderVoice(stakeholder.name) : null;
    
    try {
      setCurrentSpeaker(stakeholder || { name: message.speaker });
      setIsAudioPlaying(true);
      setPlayingMessageId(message.id);
      setAudioStates(prev => ({ ...prev, [message.id]: 'playing' }));

      let audioElement: HTMLAudioElement | null = null;

      if (voiceId && isAzureTTSAvailable() && isStakeholderVoiceEnabled(stakeholder?.name || '')) {
        try {
          const audioBlob = await azureTTS(message.content, voiceId);
          const audioUrl = URL.createObjectURL(audioBlob);
          audioElement = new Audio(audioUrl);
        } catch (azureError) {
          console.warn('Azure TTS failed, falling back to browser TTS:', azureError);
          audioElement = await playBrowserTTS(message.content);
        }
      } else {
        audioElement = await playBrowserTTS(message.content);
      }

      if (audioElement) {
        setCurrentAudio(audioElement);
        
        audioElement.onended = () => {
          setCurrentSpeaker(null);
          setIsAudioPlaying(false);
          setPlayingMessageId(null);
          setAudioStates(prev => ({ ...prev, [message.id]: 'stopped' }));
          setCurrentAudio(null);
        };

        audioElement.onerror = () => {
          console.error('Audio playback error for message:', message.id);
          setCurrentSpeaker(null);
          setIsAudioPlaying(false);
          setPlayingMessageId(null);
          setAudioStates(prev => ({ ...prev, [message.id]: 'stopped' }));
          setCurrentAudio(null);
        };

        await audioElement.play();
      }
    } catch (error) {
      console.error('Error playing message audio:', error);
      setCurrentSpeaker(null);
      setIsAudioPlaying(false);
      setPlayingMessageId(null);
      setAudioStates(prev => ({ ...prev, [message.id]: 'stopped' }));
    }
  };

  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setCurrentSpeaker(null);
      setIsAudioPlaying(false);
      setPlayingMessageId(null);
    }
  };

  // Add thinking state management
  const addStakeholderToThinking = (stakeholderName: string) => {
    setThinkingStakeholders(prev => new Set([...prev, stakeholderName]));
  };

  const removeStakeholderFromThinking = (stakeholderName: string) => {
    setThinkingStakeholders(prev => {
      const newSet = new Set(prev);
      newSet.delete(stakeholderName);
      return newSet;
    });
  };

  // Process stakeholder response (same logic as before)
  const processDynamicStakeholderResponse = async (
    stakeholder: any,
    originalMessage: string,
    currentMessages: Message[],
    responseType: string = 'mention'
  ): Promise<Message[]> => {
    console.log(`🤖 Processing ${responseType} response for ${stakeholder.name}`);
    
    addStakeholderToThinking(stakeholder.name);
    setDynamicFeedback(`${stakeholder.name} is thinking...`);

    try {
      const aiService = AIService.getInstance();
      
      const stakeholderContext: StakeholderContext = {
        name: stakeholder.name,
        role: stakeholder.role,
        department: stakeholder.department,
        priorities: stakeholder.priorities,
        personality: stakeholder.personality,
        expertise: stakeholder.expertise || []
      };

      const conversationContext: ConversationContext = {
        project: {
          name: selectedProject?.name || '',
          description: selectedProject?.description || '',
          type: selectedProject?.type || ''
        },
        conversationHistory: currentMessages,
        stakeholders: selectedStakeholders.map(s => ({
          name: s.name,
          role: s.role,
          department: s.department || '',
          priorities: s.priorities || [],
          personality: s.personality || '',
          expertise: s.expertise || []
        }))
      };

      const response = await aiService.generateStakeholderResponse(
        originalMessage,
        stakeholderContext,
        conversationContext
      );

      removeStakeholderFromThinking(stakeholder.name);
      setDynamicFeedback(null);

      if (response) {
        const responseMessage: Message = {
          id: `${stakeholder.id}-${Date.now()}`,
          speaker: stakeholder.name,
          content: response,
          timestamp: new Date().toISOString(),
          stakeholderName: stakeholder.name,
          stakeholderRole: stakeholder.role
        };

        const updatedMessages = [...currentMessages, responseMessage];
        setMessages(updatedMessages);

        // Auto-play the response
        if (globalAudioEnabled) {
          await speakMessage(responseMessage);
        }

        return updatedMessages;
      }
    } catch (error) {
      console.error(`Error generating response for ${stakeholder.name}:`, error);
      removeStakeholderFromThinking(stakeholder.name);
      setDynamicFeedback(null);
    }

    return currentMessages;
  };

  // Message handling (same as before)
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');
    setIsGeneratingResponse(true);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    let currentMessages = [...messages, userMessage];
    setMessages(currentMessages);

    // Auto-speak user message
    if (globalAudioEnabled) {
      await speakMessage(userMessage);
    }

    try {
      const aiService = AIService.getInstance();
      const availableStakeholders = selectedStakeholders.map(s => ({
        name: s.name,
        role: s.role,
        department: s.department,
        priorities: s.priorities,
        personality: s.personality,
        expertise: s.expertise || []
      }));

      const userMentionResult = await aiService.detectStakeholderMentions(messageContent, availableStakeholders);
      
      if (userMentionResult.mentionedStakeholders.length > 0 && userMentionResult.confidence >= AIService.getMentionConfidenceThreshold()) {
        const mentionedNames = userMentionResult.mentionedStakeholders.map(s => s.name).join(', ');
        console.log(`🎯 User mentioned: ${mentionedNames}`);
        
        setDynamicFeedback(`🎯 ${mentionedNames} will respond...`);
        setTimeout(() => setDynamicFeedback(null), 2000);
        
        const responseQueueData = userMentionResult.mentionedStakeholders.map(s => ({
          name: s.name,
          id: selectedStakeholders.find(st => st.name === s.name)?.id || 'unknown'
        }));
        
        setResponseQueue({
          current: responseQueueData[0]?.name || null,
          upcoming: responseQueueData.slice(1)
        });
        
        let workingMessages = currentMessages;
        for (let i = 0; i < userMentionResult.mentionedStakeholders.length; i++) {
          const mentionedStakeholderContext = userMentionResult.mentionedStakeholders[i];
          const mentionedStakeholder = selectedStakeholders.find(s => 
            s.name === mentionedStakeholderContext.name
          );
          
          if (mentionedStakeholder) {
            workingMessages = await processDynamicStakeholderResponse(
              mentionedStakeholder, 
              messageContent, 
              workingMessages, 
              'direct_mention'
            );
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (i < userMentionResult.mentionedStakeholders.length - 1) {
              setResponseQueue(prev => {
                const remaining = prev.upcoming.slice(1);
                return {
                  current: prev.upcoming[0]?.name || null,
                  upcoming: remaining
                };
              });
              
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        setResponseQueue({ current: null, upcoming: [] });
      } else {
        // Handle group greetings or general questions
        const randomStakeholder = selectedStakeholders[Math.floor(Math.random() * selectedStakeholders.length)];
        await processDynamicStakeholderResponse(randomStakeholder, messageContent, currentMessages);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const handleVoiceInput = (text: string) => {
    setInputMessage(text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleTranscribingChange = (transcribing: boolean) => {
    setIsTranscribing(transcribing);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndMeeting = () => {
    stopCurrentAudio();
    setCurrentSpeaker(null);
    setResponseQueue({ current: null, upcoming: [] });
    setCurrentView('stakeholders');
  };

  // Early return with debug info
  if (!selectedProject || !selectedStakeholders?.length) {
    console.log('🚨 VoiceOnlyMeetingView: Missing data', {
      selectedProject: selectedProject ? 'exists' : 'null',
      selectedStakeholders: selectedStakeholders ? `${selectedStakeholders.length} items` : 'null'
    });
    
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">No meeting configured</h2>
          <p className="text-gray-400">Please select a project and stakeholders first.</p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const allParticipants = [
    { name: 'You', role: 'Meeting Host' },
    ...selectedStakeholders
  ];

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleEndMeeting}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {selectedProject?.name}
              </h1>
              <p className="text-sm text-gray-400">Voice Meeting</p>
            </div>
          </div>

          {/* Center section - Speaking Queue */}
          <div className="flex-1 mx-8">
            <SpeakingQueueHeader 
              currentSpeaker={responseQueue.current}
              upcomingQueue={responseQueue.upcoming}
            />
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-400 space-x-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
            </div>
            <div className="flex items-center text-gray-400 space-x-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">{allParticipants.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Participant Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
            {allParticipants.map((participant, index) => (
              <ParticipantCard
                key={participant.name}
                participant={participant}
                isCurrentSpeaker={currentSpeaker?.name === participant.name}
                isThinking={thinkingStakeholders.has(participant.name)}
                isUser={index === 0}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Feedback */}
        {dynamicFeedback && (
          <div className="px-6 pb-2">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center text-sm">
              {dynamicFeedback}
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="bg-gray-800 border-t border-gray-700 p-6 flex-shrink-0">
          {/* Question Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ask a Question
            </label>
            <div className="flex space-x-3">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question here..."
                className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                disabled={isLoading}
              />
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setShowVoiceModal(true)}
                  className={`p-3 rounded-lg transition-colors ${
                    isTranscribing 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                  disabled={isLoading}
                  title="Voice input"
                >
                  {isTranscribing ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  title="Send message"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {isGeneratingResponse && (
              <div className="flex items-center justify-center mt-3 text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                Generating response...
              </div>
            )}
          </div>

          {/* Meeting Controls */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={stopCurrentAudio}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 p-3 rounded-full transition-colors"
              title="Stop audio"
            >
              <Square className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleEndMeeting}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
            >
              <PhoneOff className="h-5 w-5" />
              <span>End Meeting</span>
            </button>
            
            <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 p-3 rounded-full transition-colors">
              <MoreVertical className="h-5 w-5" />
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
    </div>
  );
};