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

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden h-full">
      {/* Animated Speaking Ring */}
      {isCurrentSpeaker && (
        <div className="absolute inset-0 rounded-lg border-4 border-green-400 animate-pulse z-20">
          <div className="absolute inset-0 rounded-lg border-4 border-green-400 opacity-50 animate-ping"></div>
        </div>
      )}
      
      {/* Animated Thinking Ring */}
      {isThinking && !isCurrentSpeaker && (
        <div className="absolute inset-0 rounded-lg border-4 border-yellow-400 animate-pulse z-20">
          <div className="absolute inset-0 rounded-lg border-4 border-yellow-400 opacity-50 animate-ping"></div>
        </div>
      )}
      
      {/* Teams-style Full Photo Background */}
      {!isUser && participant.photo ? (
        <div className="absolute inset-0">
          <img 
            src={participant.photo} 
            alt={participant.name}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
          <div className="text-white text-6xl font-bold">
            {getInitials(participant.name)}
          </div>
        </div>
      )}
      
      {/* Status Indicators */}
      <div className="absolute top-3 left-3 z-30">
        {isCurrentSpeaker && (
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center shadow-lg animate-pulse">
            <Volume2 className="w-4 h-4 mr-1" />
            Speaking
          </div>
        )}
        {isThinking && !isCurrentSpeaker && (
          <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center shadow-lg animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-bounce"></div>
            Thinking
          </div>
        )}
      </div>
      
      {/* Name Bar at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white px-4 py-3 z-30">
        <h3 className="font-medium text-base text-center">{participant.name}</h3>
        <p className="text-sm text-gray-300 text-center">{participant.role}</p>
      </div>
      
      {/* Speaking Animation Dots */}
      {isCurrentSpeaker && (
        <div className="absolute bottom-20 right-3 flex space-x-1 z-30">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '300ms' }}></div>
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
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center space-x-4">
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
  
  // Speaking queue management - EXACT REPLICA of transcript meeting
  const [conversationQueue, setConversationQueue] = useState<string[]>([]);
  const [currentSpeaking, setCurrentSpeaking] = useState<string | null>(null);

  // Add conversation dynamics from transcript meeting for adaptive responses
  const [conversationDynamics, setConversationDynamics] = useState({
    phase: 'initial' as 'initial' | 'introduction_active' | 'discussion_active',
    greetingIterations: 0,
    leadSpeaker: null as any,
    introducedMembers: new Set<string>()
  });

  // Generate stakeholder response with context - EXACT COPY from transcript meeting
  const generateStakeholderResponse = async (stakeholder: any, userMessage: string, currentMessages: Message[], responseType: string) => {
    const stakeholderContext = {
      name: stakeholder.name,
      role: stakeholder.role,
      department: stakeholder.department,
      priorities: stakeholder.priorities,
      personality: stakeholder.personality,
      expertise: stakeholder.expertise || []
    };

    const conversationContext = {
      project: {
        name: selectedProject?.name || 'Current Project',
        description: selectedProject?.description || 'Project description',
        type: selectedProject?.type || 'General'
      },
      conversationHistory: currentMessages,
      stakeholders: selectedStakeholders.map(s => ({
        name: s.name,
        role: s.role,
        department: s.department,
        priorities: s.priorities,
        personality: s.personality,
        expertise: s.expertise || []
      }))
    };

    const aiService = AIService.getInstance();
    return await aiService.generateStakeholderResponse(
      userMessage,
      stakeholderContext,
      conversationContext,
      responseType
    );
  };

  // Create response message object - EXACT COPY from transcript meeting
  const createResponseMessage = (stakeholder: any, response: string, index: number): Message => {
    return {
      id: `ai-${Date.now()}-${index}`,
      speaker: stakeholder.id || 'stakeholder',
      content: response,
      timestamp: new Date().toISOString(),
      stakeholderName: stakeholder.name,
      stakeholderRole: stakeholder.role
    };
  };

  // Dynamic contextually-aligned thinking message generator - EXACT COPY from transcript meeting
  const generateThinkingMessage = (stakeholder: any, context: any) => {
    const userQuestion = context.messageContent || '';
    const responseContext = context.responseContext || '';
    
    // Simple thinking message based on context
    if (responseContext === 'baton_pass') {
      return `${stakeholder.name} is considering the question...`;
    } else if (responseContext === 'introduction_lead') {
      return `${stakeholder.name} is preparing to introduce the team...`;
    } else {
      return `${stakeholder.name} is thinking about your question...`;
    }
  };

  // Enhanced stakeholder response processing - EXACT COPY from transcript meeting
  const processDynamicStakeholderResponse = async (stakeholder: any, messageContent: string, currentMessages: Message[], responseContext: string): Promise<Message[]> => {
    console.log(`🚀 QUEUE DEBUG: ${stakeholder.name} starting processDynamicStakeholderResponse`);
    console.log(`🚀 QUEUE DEBUG: Current speaker before: ${currentSpeaking}`);
    console.log(`🚀 QUEUE DEBUG: Current queue before: [${conversationQueue.join(', ')}]`);
    
    try {
      // Add to conversation queue to prevent simultaneous speaking
      setConversationQueue(prev => {
        const newQueue = [...prev, stakeholder.id];
        console.log(`🚀 QUEUE DEBUG: ${stakeholder.name} added to queue. New queue: [${newQueue.join(', ')}]`);
        return newQueue;
      });
      
      // Wait for turn if someone else is speaking
      let waitCount = 0;
      while (currentSpeaking !== null && currentSpeaking !== stakeholder.id) {
        waitCount++;
        console.log(`🚀 QUEUE DEBUG: ${stakeholder.name} waiting (attempt ${waitCount}). Current speaker: ${currentSpeaking}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Safety break after 100 attempts (10 seconds)
        if (waitCount > 100) {
          console.error(`🚨 QUEUE ERROR: ${stakeholder.name} waited too long! Breaking wait loop.`);
          break;
        }
      }
      
      // Start speaking
      console.log(`🚀 QUEUE DEBUG: ${stakeholder.name} now taking turn to speak`);
      setCurrentSpeaking(stakeholder.id);
      
      // Dynamic thinking state management
      addStakeholderToThinking(stakeholder.id);
      
      // Generate dynamic thinking message based on actual user question context
      const thinkingContext = {
        stakeholder,
        messageContent,
        conversationHistory: currentMessages,
        responseContext
      };
      const thinkingMessage = generateThinkingMessage(stakeholder, thinkingContext);
      setDynamicFeedback(thinkingMessage);
      
      // Generate contextual response using AI service
      const response = await generateStakeholderResponse(stakeholder, messageContent, currentMessages, responseContext);
      
      // Clean up thinking state - ensure proper cleanup
      removeStakeholderFromThinking(stakeholder.id);
      setDynamicFeedback(null);
      
      // Create and add message with dynamic indexing
      const responseMessage = createResponseMessage(stakeholder, response, currentMessages.length);
      let updatedMessages = [...currentMessages, responseMessage];
      setMessages(updatedMessages);
      
      // Force cleanup of thinking state to prevent display issues
      setTimeout(() => {
        removeStakeholderFromThinking(stakeholder.id);
        setDynamicFeedback(null);
      }, 100);
      
      // Dynamic audio handling based on user preferences and context - EXACT COPY from transcript meeting
      if (globalAudioEnabled) {
        await playMessageAudio(responseMessage.id, response, stakeholder, true).catch(console.warn);
      }
      
      // Check for traditional baton passing (keep existing functionality)
      const batonPassedStakeholder = detectBatonPassing(response, updatedMessages);
      
      // Finish speaking
      console.log(`🚀 QUEUE DEBUG: ${stakeholder.name} finished speaking, clearing currentSpeaking`);
      setCurrentSpeaking(null);
      setConversationQueue(prev => {
        const newQueue = prev.filter(id => id !== stakeholder.id);
        console.log(`🚀 QUEUE DEBUG: ${stakeholder.name} removed from queue. New queue: [${newQueue.join(', ')}]`);
        return newQueue;
      });
      
      // Handle traditional baton passing if detected and no mentions were processed
      if (batonPassedStakeholder && !updatedMessages.find(msg => 
        msg.id.startsWith('mention-response') && 
        msg.timestamp > responseMessage.timestamp
      )) {
        console.log(`📋 Traditional baton passed to ${batonPassedStakeholder.name}`);
        setTimeout(async () => {
          await processDynamicStakeholderResponse(batonPassedStakeholder, messageContent, updatedMessages, 'baton_pass');
        }, 1000); // Small delay for natural flow
      }
      
      return updatedMessages;
          } catch (error) {
        console.error(`🚨 QUEUE ERROR: Error in ${stakeholder.name} response:`, error);
        removeStakeholderFromThinking(stakeholder.id);
        setDynamicFeedback(null);
        
        // Clean up conversation state on error
        console.log(`🚀 QUEUE DEBUG: ${stakeholder.name} error cleanup - clearing currentSpeaking`);
        setCurrentSpeaking(null);
        setConversationQueue(prev => {
          const newQueue = prev.filter(id => id !== stakeholder.id);
          console.log(`🚀 QUEUE DEBUG: ${stakeholder.name} error cleanup - removed from queue. New queue: [${newQueue.join(', ')}]`);
          return newQueue;
        });
      
      // Force cleanup of thinking state on error
      setTimeout(() => {
        removeStakeholderFromThinking(stakeholder.id);
        setDynamicFeedback(null);
      }, 100);
      
      throw error;
    }
  };

  // EXACT COPY of playMessageAudio from transcript meeting
  const playMessageAudio = async (messageId: string, text: string, stakeholder: any, autoPlay: boolean = true): Promise<void> => {
    console.log('Audio playback attempt:', { messageId, stakeholder: stakeholder.name, globalAudioEnabled, autoPlay });
    
    if (!globalAudioEnabled) {
      console.log('Audio disabled globally');
      return Promise.resolve();
    }

    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
      }
      
      if (!autoPlay) {
        return Promise.resolve();
      }

      setCurrentSpeaker(stakeholder);
      setIsAudioPlaying(true);

      const voiceName = stakeholder.voice;
      console.log('🎵 Using voice:', voiceName, 'for stakeholder:', stakeholder.name);
      console.log('🔧 Azure TTS Available:', isAzureTTSAvailable());
      
      if (isAzureTTSAvailable() && voiceName) {
        console.log('✅ Using Azure TTS for audio synthesis');
        const audioBlob = await azureTTS.synthesizeSpeech(text, voiceName);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        setCurrentAudio(audio);
        setPlayingMessageId(messageId);
        setAudioStates(prev => ({ ...prev, [messageId]: 'playing' }));
        
        return new Promise((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            setCurrentAudio(null);
            setPlayingMessageId(null);
            setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }));
            setCurrentSpeaker(null);
            setIsAudioPlaying(false);
            console.log(`🚀 AUDIO DEBUG: ${stakeholder.name} audio naturally ended`);
            resolve();
          };
          
          audio.onerror = (error) => {
            console.error('Audio element error:', error);
            URL.revokeObjectURL(audioUrl);
            setCurrentAudio(null);
            setPlayingMessageId(null);
            setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }));
            setCurrentSpeaker(null);
            setIsAudioPlaying(false);
            resolve();
          };
          
          audio.play().then(() => {
            console.log(`🚀 AUDIO DEBUG: ${stakeholder.name} audio started playing`);
          }).catch((playError) => {
            console.error('Audio play error:', playError);
            URL.revokeObjectURL(audioUrl);
            setCurrentAudio(null);
            setPlayingMessageId(null);
            setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }));
            setCurrentSpeaker(null);
            setIsAudioPlaying(false);
            resolve();
          });
        });
      } else {
        console.log('⚠️ Azure TTS not available or no voice, using browser TTS');
        setPlayingMessageId(messageId);
        setAudioStates(prev => ({ ...prev, [messageId]: 'playing' }));
        
        const browserAudio = await playBrowserTTS(text);
        
        return new Promise((resolve) => {
          // Browser TTS doesn't return a promise that waits for completion
          // So we'll use a timeout based on text length
          const estimatedDuration = Math.max(2000, text.length * 50); // ~50ms per character
          setTimeout(() => {
            setPlayingMessageId(null);
            setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }));
            setCurrentSpeaker(null);
            setIsAudioPlaying(false);
            console.log(`🚀 AUDIO DEBUG: ${stakeholder.name} browser TTS estimated completion`);
            resolve();
          }, estimatedDuration);
        });
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setCurrentSpeaker(null);
      setIsAudioPlaying(false);
      setPlayingMessageId(null);
      return Promise.resolve();
    }
  };

  // EXACT COPY of transcript meeting's handleSendMessage - NO MODIFICATIONS
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageContent = inputMessage.trim();
    setIsGeneratingResponse(true);
    setInputMessage('');

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    let currentMessages = [...messages, userMessage];
    setMessages(currentMessages);

    try {
      // Check for direct stakeholder mentions in user message FIRST
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
      
      // Enhanced debugging for mention detection
      console.log('🔍 DEBUG: User message analysis:', {
        messageContent,
        availableStakeholders: availableStakeholders.map(s => s.name),
        mentionResult: userMentionResult,
        threshold: AIService.getMentionConfidenceThreshold()
      });
      
      if (userMentionResult.mentionedStakeholders.length > 0 && userMentionResult.confidence >= AIService.getMentionConfidenceThreshold()) {
        const mentionedNames = userMentionResult.mentionedStakeholders.map(s => s.name).join(', ');
        console.log(`🎯 User directly mentioned stakeholder(s): ${mentionedNames} (${userMentionResult.mentionType}, confidence: ${userMentionResult.confidence})`);
        
        console.log(`🔍 Detailed detection results:`, {
          totalDetected: userMentionResult.mentionedStakeholders.length,
          stakeholders: userMentionResult.mentionedStakeholders.map(s => ({ name: s.name, role: s.role, department: s.department })),
          availableStakeholders: selectedStakeholders.map(s => ({ id: s.id, name: s.name, role: s.role }))
        });
        
        // Show prominent feedback that stakeholders will respond
        const feedbackText = userMentionResult.mentionedStakeholders.length > 1 
          ? `🎯 ${mentionedNames} will respond shortly...`
          : `🎯 ${userMentionResult.mentionedStakeholders[0].name} will respond shortly...`;
        setDynamicFeedback(feedbackText);
        setTimeout(() => setDynamicFeedback(null), 2000);
        
        // Set up the response queue to show users what to expect
        const responseQueueData = userMentionResult.mentionedStakeholders.map(s => ({
          name: s.name,
          id: selectedStakeholders.find(st => st.name === s.name)?.id || 'unknown'
        }));
        
        setResponseQueue({
          current: responseQueueData[0]?.name || null,
          upcoming: responseQueueData.slice(1)
        });
        
        // Trigger all mentioned stakeholders to respond
        console.log(`🚀 MAIN DEBUG: Starting sequential processing of ${userMentionResult.mentionedStakeholders.length} stakeholders`);
        let workingMessages = currentMessages;
        for (let i = 0; i < userMentionResult.mentionedStakeholders.length; i++) {
          const mentionedStakeholderContext = userMentionResult.mentionedStakeholders[i];
          const mentionedStakeholder = selectedStakeholders.find(s => 
            s.name === mentionedStakeholderContext.name
          );
          
          console.log(`🔍 Processing stakeholder: ${mentionedStakeholderContext.name}`, {
            found: !!mentionedStakeholder,
            stakeholderId: mentionedStakeholder?.id,
            stakeholderName: mentionedStakeholder?.name,
            currentMessageCount: workingMessages.length
          });
          
          if (mentionedStakeholder) {
            console.log(`🚀 MAIN DEBUG: About to process stakeholder ${i + 1}/${userMentionResult.mentionedStakeholders.length}: ${mentionedStakeholder.name}`);
            
            // Process the response and update working messages
            workingMessages = await processDynamicStakeholderResponse(mentionedStakeholder, messageContent, workingMessages, 'direct_mention');
            
            console.log(`🚀 MAIN DEBUG: Completed stakeholder ${i + 1}/${userMentionResult.mentionedStakeholders.length}: ${mentionedStakeholder.name}, messages now: ${workingMessages.length}`);
            
            // Keep the current speaker visible for a moment after they finish
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update response queue - move to next stakeholder (only if there are more)
            if (i < userMentionResult.mentionedStakeholders.length - 1) {
              setResponseQueue(prev => {
                const remaining = prev.upcoming.slice(1);
                return {
                  current: prev.upcoming[0]?.name || null,
                  upcoming: remaining
                };
              });
              
              console.log(`⏸️ Pausing 1.5s before next stakeholder response`);
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          } else {
            console.log(`❌ Could not find stakeholder object for: ${mentionedStakeholderContext.name}`);
          }
        }
        
        // Keep the final speaker visible for a moment, then clear
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Clear the response queue when all responses are complete
        setResponseQueue({ current: null, upcoming: [] });
        console.log('🏁 All direct mention responses complete - queue cleared');
        
        setIsGeneratingResponse(false);
        return; // Exit early - don't go through normal conversation flow
      }

      // If no direct mention detected, proceed with normal conversation flow
      // Dynamic conversation type detection
      const isGroup = isGroupMessage(messageContent);
      const isGreeting = isSimpleGreeting(messageContent);
      
      if (isGroup && isGreeting) {
        await handleAdaptiveGreeting(messageContent, currentMessages);
      } else {
        // Handle general questions - pick one random stakeholder
        const randomStakeholder = selectedStakeholders[Math.floor(Math.random() * selectedStakeholders.length)];
        let workingMessages = currentMessages;
        workingMessages = await processDynamicStakeholderResponse(randomStakeholder, messageContent, workingMessages, 'general_question');
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
    stopAllAudio();
    setCurrentView('stakeholders');
  };

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

  // Initialize conversation WITHOUT artificial welcome message
  useEffect(() => {
    if (selectedProject && selectedStakeholders.length > 0) {
      const aiService = AIService.getInstance();
      aiService.resetConversationState();
      
      // No welcome message - let the meeting start naturally
      setMessages([]);
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

  // Audio management - FIXED to prevent talking over each other
  const speakMessage = async (message: Message) => {
    if (!globalAudioEnabled) return;
    
    // SAFETY CHECK: Never speak user messages
    if (message.speaker === 'user') {
      console.log(`🚫 Skipping audio for user message - user messages should not be spoken`);
      return;
    }

    // Stop any current audio before starting new one
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setCurrentSpeaker(null);
      setIsAudioPlaying(false);
      setPlayingMessageId(null);
    }

    const stakeholder = selectedStakeholders.find(s => s.name === message.speaker || s.id === message.speaker);
    
    // Only stakeholder messages should use Azure TTS
    const voiceId = stakeholder?.voice || null;
    
    console.log(`🎵 Using voice: ${voiceId} for stakeholder: ${message.speaker}`);
    console.log(`🔧 Azure TTS Available: ${isAzureTTSAvailable()}`);
    
    try {
      setCurrentSpeaker(stakeholder || { name: message.speaker });
      setIsAudioPlaying(true);
      setPlayingMessageId(message.id);
      setAudioStates(prev => ({ ...prev, [message.id]: 'playing' }));

      let audioElement: HTMLAudioElement | null = null;

      // Use Azure TTS for stakeholders when available
      if (voiceId && isAzureTTSAvailable()) {
        try {
          console.log(`✅ Using Azure TTS with voice: ${voiceId}`);
          const audioBlob = await azureTTS.synthesizeSpeech(message.content, voiceId);
          const audioUrl = URL.createObjectURL(audioBlob);
          audioElement = new Audio(audioUrl);
        } catch (azureError) {
          console.warn('❌ Azure TTS failed, falling back to browser TTS:', azureError);
          audioElement = await playBrowserTTS(message.content);
        }
      } else {
        if (!voiceId) {
          console.log(`⚠️ No voice ID found for stakeholder, using browser TTS`);
        } else {
          console.log(`⚠️ Azure TTS not available, using browser TTS`);
        }
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

  // FIXED Stop button - stops current speaker and moves to next
  const handleStopCurrent = () => {
    console.log('🛑 Stop button clicked - stopping current speaker');
    
    // Stop current audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    
    // Reset current speaker states
    setCurrentSpeaker(null);
    setIsAudioPlaying(false);
    setPlayingMessageId(null);
    
    // Move to next in queue by removing current speaker
    if (currentSpeaking) {
      setConversationQueue(prev => prev.filter(id => id !== currentSpeaking));
      setCurrentSpeaking(null);
    }
  };

  // Stop all audio and clear all states
  const stopAllAudio = () => {
    console.log('🛑 Stopping all audio and clearing queue');
    
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    
    setCurrentSpeaker(null);
    setIsAudioPlaying(false);
    setPlayingMessageId(null);
    setAudioStates({});
    
    // Clear conversation queue to stop all pending speakers
    setConversationQueue([]);
    setCurrentSpeaking(null);
    setResponseQueue({ current: null, upcoming: [] });
    setThinkingStakeholders(new Set());
    setDynamicFeedback(null);
  };

  // Add thinking state management
  const addStakeholderToThinking = (stakeholderId: string) => {
    setThinkingStakeholders(prev => new Set([...prev, stakeholderId]));
  };

  const removeStakeholderFromThinking = (stakeholderId: string) => {
    setThinkingStakeholders(prev => {
      const newSet = new Set(prev);
      newSet.delete(stakeholderId);
      return newSet;
    });
  };

  // Baton passing detection - EXACT copy from transcript meeting
  const detectBatonPassing = (response: string, conversationHistory: Message[]) => {
    const responseLower = response.toLowerCase();
    
    // Common baton passing patterns
    const batonPatterns = [
      // Direct suggestions
      /([a-zA-Z]+)\s+(?:might|could|would|should)\s+be\s+(?:better|more)\s+(?:equipped|suited|able)/,
      /someone\s+from\s+([a-zA-Z]+)\s+(?:might|could|would|should)/,
      /([a-zA-Z]+)\s+(?:can|could|would|should)\s+(?:help|assist|answer|explain|walk|guide)/,
      /(?:ask|check with|speak to|talk to)\s+([a-zA-Z]+)/,
      /([a-zA-Z]+)\s+(?:knows|understands|handles)\s+(?:this|that|these)/,
      /([a-zA-Z]+)\s+(?:is|would be)\s+(?:the|a)\s+(?:right|best|better)\s+(?:person|one)/,
      
      // Department/role suggestions
      /someone\s+from\s+(?:the\s+)?([a-zA-Z]+)\s+(?:team|department|group)/,
      /(?:our|the)\s+([a-zA-Z]+)\s+(?:team|department|group)\s+(?:should|could|might)/,
      /(?:talk to|ask)\s+(?:the\s+)?([a-zA-Z]+)\s+(?:team|department|group)/,
      
      // Name-based suggestions
      /([A-Z][a-z]+)\s+(?:might|could|would|should)\s+be\s+(?:better|able|more)/,
      /([A-Z][a-z]+)\s+(?:can|could|would|should)\s+(?:help|handle|explain|answer)/,
      /(?:ask|check with|speak to|talk to)\s+([A-Z][a-z]+)/,
      /([A-Z][a-z]+)\s+(?:knows|understands|handles)\s+(?:this|that|these)/,
      /([A-Z][a-z]+)\s+(?:is|would be)\s+(?:the|a)\s+(?:right|best|better)\s+(?:person|one)/
    ];
    
    for (const pattern of batonPatterns) {
      const match = responseLower.match(pattern);
      if (match && match[1]) {
        const suggestion = match[1].toLowerCase();
        
        // Try to find stakeholder by name first
        const stakeholderByName = selectedStakeholders.find(s => 
          s.name.toLowerCase().includes(suggestion) || 
          s.name.toLowerCase().split(' ').some(part => part.includes(suggestion))
        );
        
        if (stakeholderByName) {
          return stakeholderByName;
        }
        
        // Try to find stakeholder by department/role
        const stakeholderByRole = selectedStakeholders.find(s => 
          s.department?.toLowerCase().includes(suggestion) || 
          s.role?.toLowerCase().includes(suggestion)
        );
        
        if (stakeholderByRole) {
          return stakeholderByRole;
        }
        
        // Try to find stakeholder by expertise domain
        const expertiseDomains = {
          'operations': ['operations', 'process', 'workflow', 'efficiency'],
          'technical': ['technical', 'development', 'engineering', 'system'],
          'business': ['business', 'strategy', 'management', 'commercial'],
          'product': ['product', 'design', 'user', 'customer'],
          'financial': ['financial', 'budget', 'accounting', 'finance'],
          'marketing': ['marketing', 'sales', 'promotion', 'communication'],
          'security': ['security', 'compliance', 'risk', 'audit'],
          'data': ['data', 'analytics', 'reporting', 'intelligence']
        };
        
        for (const [domain, keywords] of Object.entries(expertiseDomains)) {
          if (keywords.some(keyword => keyword.includes(suggestion) || suggestion.includes(keyword))) {
            const expertStakeholder = selectedStakeholders.find(s => 
              s.department?.toLowerCase().includes(domain) || 
              s.role?.toLowerCase().includes(domain) ||
              s.expertise?.some((exp: string) => exp.toLowerCase().includes(domain))
            );
            if (expertStakeholder) {
              return expertStakeholder;
            }
          }
        }
      }
    }
    
    return null;
  };

  // Adaptive greeting system - EXACT copy from transcript meeting
  const isSimpleGreeting = (message: string): boolean => {
    const greetingPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening)(\s+(all|everyone|team))?$/i,
      /^(hi|hello|hey)\s+(there|folks)$/i
    ];
    return greetingPatterns.some(pattern => pattern.test(message.trim()));
  };

  const isGroupMessage = (message: string): boolean => {
    const groupIndicators = ['all', 'everyone', 'team', 'group', 'folks', 'colleagues'];
    return groupIndicators.some(indicator => message.toLowerCase().includes(indicator));
  };

  const handleAdaptiveGreeting = async (messageContent: string, currentMessages: Message[]) => {
    const aiService = AIService.getInstance();
    const greetingIteration = conversationDynamics.greetingIterations + 1;
    
    console.log(`👋 Adaptive greeting - iteration ${greetingIteration}, phase: ${conversationDynamics.phase}`);
    console.log(`👥 Total stakeholders in meeting: ${selectedStakeholders.length}`);

    // FIXED: Handle ALL stakeholders in greeting, not just first 2
    if (greetingIteration === 1 || conversationDynamics.introducedMembers.size === 0) {
      console.log(`🎯 Processing greeting for ALL ${selectedStakeholders.length} stakeholders`);
      
      // Process all stakeholders sequentially using the exact transcript meeting pattern
      let workingMessages = currentMessages;
      for (let i = 0; i < selectedStakeholders.length; i++) {
        const stakeholder = selectedStakeholders[i];
        const responseType = i === 0 ? 'introduction_lead' : 'self_introduction';
        
        console.log(`✅ About to trigger greeting response for: ${stakeholder.name} (${i + 1}/${selectedStakeholders.length})`);
        
        workingMessages = await processDynamicStakeholderResponse(
          stakeholder, 
          messageContent, 
          workingMessages, 
          responseType
        );
        
        console.log(`✅ Completed greeting response for: ${stakeholder.name}`);
        
        // Update conversation dynamics to track introduced members
        setConversationDynamics(prev => ({
          ...prev,
          phase: 'introduction_active',
          leadSpeaker: i === 0 ? stakeholder : prev.leadSpeaker,
          greetingIterations: greetingIteration,
          introducedMembers: new Set([...prev.introducedMembers, stakeholder.id])
        }));
        
        // Natural pause between stakeholders (except for the last one)
        if (i < selectedStakeholders.length - 1) {
          console.log(`⏸️ Pausing 2s before next stakeholder greeting`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log(`🏁 All ${selectedStakeholders.length} stakeholders have completed their greetings`);
    } else {
      // Transition to discussion
      const facilitator = conversationDynamics.leadSpeaker || selectedStakeholders[0];
      await processDynamicStakeholderResponse(facilitator, messageContent, currentMessages, 'discussion_transition');
      
      setConversationDynamics(prev => ({
        ...prev,
        phase: 'discussion_active',
        greetingIterations: greetingIteration
      }));
    }
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

  // Teams-style row layout: 1-4 stakeholders in one row, 5 stakeholders with 3+2 centered rows
  const getRowLayout = (count: number) => {
    if (count <= 4) {
      return {
        containerClass: 'flex justify-center items-center h-full',
        rowClass: 'flex gap-6'
      };
    } else if (count === 5) {
      return {
        containerClass: 'flex flex-col justify-center items-center h-full space-y-6',
        rowClass: 'flex gap-6'
      };
    }
    // For more than 5, fall back to flexible rows
    return {
      containerClass: 'flex flex-wrap justify-center items-center h-full gap-6',
      rowClass: 'flex gap-6'
    };
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex-shrink-0">
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

          {/* Right section - Timer, participants, and controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-400 space-x-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
            </div>
            <div className="flex items-center text-gray-400 space-x-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">{allParticipants.length}</span>
            </div>
            
            {/* Meeting Controls - Moved to top right */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleStopCurrent}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 p-2 rounded-lg transition-colors"
                title="Stop current speaker"
              >
                <Square className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleEndMeeting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1"
              >
                <PhoneOff className="h-4 w-4" />
                <span>End</span>
              </button>
              
              <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 p-2 rounded-lg transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Fixed height, no scrolling */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Teams-style Participant Grid */}
        <div className="flex-1 p-4 min-h-0">
          {allParticipants.length <= 4 ? (
            // 1-4 participants: Single row, side-by-side
            <div className={getRowLayout(allParticipants.length).containerClass}>
              <div className={getRowLayout(allParticipants.length).rowClass}>
                {allParticipants.map((participant, index) => (
                  <div key={participant.name} className="w-80 h-60">
                    <ParticipantCard
                      participant={participant}
                      isCurrentSpeaker={currentSpeaker?.name === participant.name}
                      isThinking={thinkingStakeholders.has(participant.id || participant.name)}
                      isUser={index === 0}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : allParticipants.length === 5 ? (
            // 5 participants: 3 on top row, 2 centered on bottom row
            <div className={getRowLayout(5).containerClass}>
              {/* Top row - 3 participants */}
              <div className="flex gap-6">
                {allParticipants.slice(0, 3).map((participant, index) => (
                  <div key={participant.name} className="w-80 h-60">
                    <ParticipantCard
                      participant={participant}
                      isCurrentSpeaker={currentSpeaker?.name === participant.name}
                      isThinking={thinkingStakeholders.has(participant.id || participant.name)}
                      isUser={index === 0}
                    />
                  </div>
                ))}
              </div>
              {/* Bottom row - 2 participants, centered */}
              <div className="flex gap-6 justify-center">
                {allParticipants.slice(3, 5).map((participant, index) => (
                  <div key={participant.name} className="w-80 h-60">
                    <ParticipantCard
                      participant={participant}
                      isCurrentSpeaker={currentSpeaker?.name === participant.name}
                      isThinking={thinkingStakeholders.has(participant.id || participant.name)}
                      isUser={index + 3 === 0}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // More than 5: Flexible rows
            <div className={getRowLayout(allParticipants.length).containerClass}>
              {allParticipants.map((participant, index) => (
                <div key={participant.name} className="w-80 h-60">
                  <ParticipantCard
                    participant={participant}
                    isCurrentSpeaker={currentSpeaker?.name === participant.name}
                    isThinking={thinkingStakeholders.has(participant.id || participant.name)}
                    isUser={index === 0}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Controls - Fixed height */}
        <div className="bg-gray-800 border-t border-gray-700 p-4 flex-shrink-0">
          {/* Question Input */}
          <div className="flex space-x-3">
            <input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question or start the discussion..."
              className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => setShowVoiceModal(true)}
                className={`p-3 rounded-lg transition-colors ${
                  isTranscribing 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}

                title="Voice input"
              >
                {isTranscribing ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
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