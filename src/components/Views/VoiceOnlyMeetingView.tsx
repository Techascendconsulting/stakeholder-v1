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

  // Consistent color scheme - no multiple colors
  const getAvatarColor = () => {
    // All participants should have the same background color
    return 'bg-gray-700'; // Consistent gray for everyone including user
  };

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden h-full flex flex-col items-center justify-center border-2 transition-all duration-300 hover:bg-gray-750">
      {/* Animated Speaking Ring */}
      {isCurrentSpeaker && (
        <div className="absolute inset-0 rounded-lg border-4 border-green-400 animate-pulse z-10">
          <div className="absolute inset-0 rounded-lg border-4 border-green-400 opacity-50 animate-ping"></div>
        </div>
      )}
      
      {/* Animated Thinking Ring */}
      {isThinking && !isCurrentSpeaker && (
        <div className="absolute inset-0 rounded-lg border-4 border-yellow-400 animate-pulse z-10">
          <div className="absolute inset-0 rounded-lg border-4 border-yellow-400 opacity-50 animate-ping"></div>
        </div>
      )}
      
      {/* Dark Background */}
      <div className={`absolute inset-0 ${getAvatarColor()}`}></div>
      
      {/* Content Overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full p-4">
        {/* Avatar Photo - Circular style */}
        {!isUser && participant.photo ? (
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
            <img 
              src={participant.photo} 
              alt={participant.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`w-24 h-24 rounded-full ${getAvatarColor()} flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg mb-4`}>
            {getInitials(participant.name)}
          </div>
        )}
        
        {/* Status Indicators */}
        <div className="absolute top-2 left-2">
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
        
        {/* Name Bar */}
        <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg backdrop-blur-sm text-center">
          <h3 className="font-medium text-sm truncate">{participant.name}</h3>
          <p className="text-xs text-gray-300 truncate">{participant.role}</p>
        </div>
        
        {/* Speaking Animation Dots */}
        {isCurrentSpeaker && (
          <div className="absolute bottom-16 right-2 flex space-x-1">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>
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

  // Enhanced stakeholder response processing - EXACT REPLICA of transcript meeting
  const processDynamicStakeholderResponse = async (stakeholder: any, messageContent: string, currentMessages: Message[], responseContext: string): Promise<Message[]> => {
    try {
      // Add to conversation queue to prevent simultaneous speaking
      setConversationQueue(prev => [...prev, stakeholder.id]);
      console.log(`🎯 ${stakeholder.name} added to queue. Current speaker: ${currentSpeaking}`);
      
      // Wait for turn if someone else is speaking
      while (currentSpeaking !== null && currentSpeaking !== stakeholder.id) {
        console.log(`⏳ ${stakeholder.name} waiting for ${currentSpeaking} to finish speaking...`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Start speaking
      console.log(`🗣️ ${stakeholder.name} now speaking`);
      setCurrentSpeaking(stakeholder.id);
      
      // Dynamic thinking state management
      addStakeholderToThinking(stakeholder.id);
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
          messageContent,
          stakeholderContext,
          conversationContext
        );

        // Clean up thinking state
        removeStakeholderFromThinking(stakeholder.id);
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

          // Check for baton passing - CRITICAL missing feature from transcript meeting
          const batonPassedStakeholder = detectBatonPassing(response, updatedMessages);
          
          // Remove from queue and set next speaker
          console.log(`✅ ${stakeholder.name} finished speaking, removing from queue`);
          setConversationQueue(prev => prev.filter(id => id !== stakeholder.id));
          setCurrentSpeaking(null);

          // Handle baton passing if detected
          if (batonPassedStakeholder && !updatedMessages.find(msg => 
            msg.id.startsWith('baton-response') && 
            msg.timestamp > responseMessage.timestamp
          )) {
            console.log(`🎯 Baton passed from ${stakeholder.name} to ${batonPassedStakeholder.name}`);
            setTimeout(async () => {
              await processDynamicStakeholderResponse(batonPassedStakeholder, messageContent, updatedMessages, 'baton_pass');
            }, 1000); // Natural delay for baton passing
          }

          return updatedMessages;
        }
      } catch (error) {
        console.error(`Error generating response for ${stakeholder.name}:`, error);
        removeStakeholderFromThinking(stakeholder.id);
        setDynamicFeedback(null);
        
        // Remove from queue on error
        setConversationQueue(prev => prev.filter(id => id !== stakeholder.id));
        setCurrentSpeaking(null);
      }

      return currentMessages;
    } catch (error) {
      console.error('Error in processDynamicStakeholderResponse:', error);
      
      // Clean up on any error
      setConversationQueue(prev => prev.filter(id => id !== stakeholder.id));
      setCurrentSpeaking(null);
      removeStakeholderFromThinking(stakeholder.id);
      setDynamicFeedback(null);
      
      return currentMessages;
    }
  };

  // Message handling with EXACT transcript meeting queue logic
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

    // User messages should NEVER be spoken - remove auto-speak completely
    // Only stakeholder responses will be spoken

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
      
      console.log(`🔍 Mention detection result:`, {
        stakeholders: userMentionResult.mentionedStakeholders.map(s => s.name),
        type: userMentionResult.mentionType,
        confidence: userMentionResult.confidence
      });

      if (userMentionResult.mentionedStakeholders.length > 0 && userMentionResult.confidence >= AIService.getMentionConfidenceThreshold()) {
        const mentionedNames = userMentionResult.mentionedStakeholders.map(s => s.name).join(', ');
        console.log(`🎯 User mentioned: ${mentionedNames} (${userMentionResult.mentionType})`);
        
        // Check if this is a group greeting for adaptive handling
        if (userMentionResult.mentionType === 'group_greeting') {
          setDynamicFeedback(`👋 Everyone will greet you back...`);
          setTimeout(() => setDynamicFeedback(null), 3000);
          
          // Use adaptive greeting system instead of hard-coded responses
          await handleAdaptiveGreeting(messageContent, currentMessages);
          return; // Exit early - adaptive greeting handles the flow
        }
        
        // Handle specific stakeholder mentions
        setDynamicFeedback(`🎯 ${mentionedNames} will respond...`);
        setTimeout(() => setDynamicFeedback(null), 3000);
        
        // Process each mentioned stakeholder using EXACT transcript meeting logic
        let workingMessages = currentMessages;
        for (const mentionedStakeholderContext of userMentionResult.mentionedStakeholders) {
          const fullStakeholder = selectedStakeholders.find(s => s.name === mentionedStakeholderContext.name);
          
          if (fullStakeholder) {
            console.log(`✅ About to trigger response for: ${fullStakeholder.name}`);
            
            // Process the response and update working messages - EXACT transcript meeting approach
            workingMessages = await processDynamicStakeholderResponse(
              fullStakeholder,
              messageContent,
              workingMessages,
              'user_mention'
            );
            
            console.log(`✅ Completed response for: ${fullStakeholder.name}, messages now: ${workingMessages.length}`);
            
            // Keep the current speaker visible for a moment after they finish
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Pause before next stakeholder if there are more
            if (userMentionResult.mentionedStakeholders.indexOf(mentionedStakeholderContext) < userMentionResult.mentionedStakeholders.length - 1) {
              console.log(`⏸️ Pausing 1.5s before next stakeholder response`);
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          }
        }
      } else {
        // Check if this is a general greeting for adaptive handling
        const isGroup = isGroupMessage(messageContent);
        const isGreeting = isSimpleGreeting(messageContent);
        
        if (isGroup && isGreeting) {
          console.log(`👋 Detected general greeting: "${messageContent}"`);
          await handleAdaptiveGreeting(messageContent, currentMessages);
        } else {
          console.log(`📋 No specific mentions detected, selecting random stakeholder`);
          // Handle general questions - pick one random stakeholder
          const randomStakeholder = selectedStakeholders[Math.floor(Math.random() * selectedStakeholders.length)];
          let workingMessages = currentMessages;
          workingMessages = await processDynamicStakeholderResponse(randomStakeholder, messageContent, workingMessages, 'general_question');
        }
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

    const stakeholder = selectedStakeholders.find(s => s.name === message.speaker);
    
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
    
    // Dynamic context for decision making
    const context = {
      greetingIteration,
      lastUserMessage: messageContent,
      totalParticipants: selectedStakeholders.length,
      conversationHistory: currentMessages
    };

    console.log(`👋 Adaptive greeting - iteration ${greetingIteration}, phase: ${conversationDynamics.phase}`);

    // Dynamic response strategy based on context
    if (greetingIteration === 1 || conversationDynamics.introducedMembers.size === 0) {
      // Initial introduction
      const leadStakeholder = selectedStakeholders[0]; // Simple lead selection
      let workingMessages = await processDynamicStakeholderResponse(leadStakeholder, messageContent, currentMessages, 'introduction_lead');
      
      setConversationDynamics(prev => ({
        ...prev,
        phase: 'introduction_active',
        leadSpeaker: leadStakeholder,
        greetingIterations: greetingIteration,
        introducedMembers: new Set([leadStakeholder.id])
      }));

      // Dynamic delay for next stakeholder if multiple stakeholders
      if (selectedStakeholders.length > 1) {
        setTimeout(async () => {
          const nextStakeholder = selectedStakeholders.find(s => s.id !== leadStakeholder.id);
          if (nextStakeholder) {
            await processDynamicStakeholderResponse(nextStakeholder, messageContent, workingMessages, 'self_introduction');
            setConversationDynamics(prev => ({
              ...prev,
              introducedMembers: new Set([...prev.introducedMembers, nextStakeholder.id])
            }));
          }
        }, 2000);
      }
    } else {
      // Transition to discussion or continued introduction
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

  // Calculate optimal grid layout based on participant count
  const getGridCols = (count: number) => {
    if (count <= 2) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 4) return 'grid-cols-2 md:grid-cols-2';
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
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
        {/* Participant Grid - Fixed height with equal-sized cards */}
        <div className="flex-1 p-4 min-h-0">
          <div className={`grid ${getGridCols(allParticipants.length)} gap-4 h-full`}>
            {allParticipants.map((participant, index) => (
              <div key={participant.name} className="h-full min-h-[200px] max-h-[300px]">
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

        {/* Dynamic Feedback */}
        {dynamicFeedback && (
          <div className="px-6 pb-2 flex-shrink-0">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center text-sm">
              {dynamicFeedback}
            </div>
          </div>
        )}

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
              disabled={isLoading}
            />
            <div className="flex space-x-2">
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