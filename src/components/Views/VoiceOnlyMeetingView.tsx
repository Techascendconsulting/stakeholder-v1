import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, Send, Users, Clock, Volume2, Play, Pause, Square } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useVoice } from '../../contexts/VoiceContext';
import { Message } from '../../types';
import AIService, { StakeholderContext, ConversationContext } from '../../services/aiService';
import { azureTTS, playBrowserTTS, isAzureTTSAvailable } from '../../lib/azureTTS';
import VoiceInputModal from '../VoiceInputModal';

interface SpeakerGridProps {
  currentSpeaker: string | null;
  stakeholders: any[];
  user: { name: string; role: string };
  thinkingStakeholders: Set<string>;
}

const SpeakerGrid: React.FC<SpeakerGridProps> = ({ currentSpeaker, stakeholders, user, thinkingStakeholders }) => {
  const allParticipants = [user, ...stakeholders];
  
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
      {allParticipants.map((participant) => {
        const isCurrentSpeaker = currentSpeaker === participant.name;
        const isThinking = thinkingStakeholders.has(participant.name);
        const avatarColor = participant.name === user.name ? 'bg-blue-500' : 'bg-purple-500';
        
        return (
          <div
            key={participant.name}
            className={`relative p-3 rounded-lg border-2 transition-all duration-300 ${
              isCurrentSpeaker 
                ? 'border-green-400 bg-green-50 scale-105 shadow-lg' 
                : isThinking
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Speaking/Thinking indicator */}
            {isCurrentSpeaker && (
              <div className="absolute -top-1 -right-1 bg-green-400 rounded-full p-1 animate-pulse">
                <Volume2 className="h-3 w-3 text-white" />
              </div>
            )}
            {isThinking && !isCurrentSpeaker && (
              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 animate-pulse">
                <div className="h-3 w-3 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            
            {/* Avatar */}
            <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg`}>
              {participant.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Name and Role */}
            <div className="text-center">
              <div className={`font-medium text-sm ${
                isCurrentSpeaker ? 'text-green-700' : 
                isThinking ? 'text-yellow-700' : 
                'text-gray-900'
              }`}>
                {participant.name}
              </div>
              <div className="text-xs text-gray-500">{participant.role}</div>
            </div>
            
            {/* Speaking animation */}
            {isCurrentSpeaker && (
              <div className="flex justify-center mt-1 space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
            
            {/* Thinking animation */}
            {isThinking && !isCurrentSpeaker && (
              <div className="flex justify-center mt-1 space-x-1">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface MeetingQueueProps {
  queue: { name: string; id?: string }[];
  currentSpeaker: string | null;
}

const MeetingQueue: React.FC<MeetingQueueProps> = ({ queue, currentSpeaker }) => {
  if (!currentSpeaker && queue.length === 0) return null;
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-center mb-2">
        <Users className="h-4 w-4 text-blue-600 mr-2" />
        <span className="font-medium text-blue-900 text-sm">Speaking Queue</span>
      </div>
      
      {currentSpeaker && (
        <div className="bg-green-100 border border-green-200 rounded-lg p-2 mb-2">
          <div className="flex items-center">
            <Volume2 className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-green-800 font-medium text-sm">Speaking: {currentSpeaker}</span>
          </div>
        </div>
      )}
      
      {queue.length > 0 && (
        <div>
          <div className="text-xs text-blue-700 mb-1">Up Next:</div>
          {queue.map((speaker, index) => (
            <div key={index} className="bg-white border border-blue-200 rounded p-2 mb-1 flex items-center">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                {index + 1}
              </span>
              <span className="text-blue-900 text-sm">{speaker.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const VoiceOnlyMeetingView: React.FC = () => {
  const { selectedProject, selectedStakeholders, setCurrentView } = useApp();
  const { globalAudioEnabled, getStakeholderVoice, isStakeholderVoiceEnabled } = useVoice();
  
  // State management (same as MeetingView)
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
  
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Audio management (same as MeetingView)
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

  // Process stakeholder response (same logic as MeetingView)
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

  // Message handling (same as MeetingView)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No meeting configured</h2>
          <p className="text-gray-600">Please select a project and stakeholders first.</p>
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

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleEndMeeting}
              className="mr-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Voice Meeting: {selectedProject?.name}
              </h1>
              <p className="text-xs text-gray-600">Listen & Learn Mode - {formatTime(elapsedTime)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
            </div>
            <button
              onClick={handleEndMeeting}
              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              End Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
        {/* Speaker Grid */}
        <div className="flex-shrink-0">
          <SpeakerGrid 
            currentSpeaker={currentSpeaker?.name || null}
            stakeholders={selectedStakeholders}
            user={{ name: 'You', role: 'Meeting Participant' }}
            thinkingStakeholders={thinkingStakeholders}
          />
        </div>
        
        {/* Meeting Queue */}
        <div className="flex-shrink-0">
          <MeetingQueue 
            queue={responseQueue.upcoming}
            currentSpeaker={responseQueue.current}
          />
        </div>
        
        {/* Dynamic Feedback */}
        {dynamicFeedback && (
          <div className="flex-shrink-0 bg-blue-100 border border-blue-300 rounded-lg p-3 text-center">
            <p className="text-blue-800 font-medium">{dynamicFeedback}</p>
          </div>
        )}
        
        {/* Question Input Area */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ask a Question
            </label>
            <div className="flex-1 flex space-x-3">
              <div className="flex-1 flex">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question here..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setShowVoiceModal(true)}
                  className={`p-3 rounded-lg transition-colors ${
                    isTranscribing 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  {isTranscribing ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {isGeneratingResponse && (
            <div className="text-center text-gray-600 mt-3">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Generating response...
              </div>
            </div>
          )}
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