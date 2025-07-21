import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, Send, Users, Clock, Volume2, Play, Pause, Square, Phone, PhoneOff, Settings, MoreVertical, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useVoice } from '../../contexts/VoiceContext';
import { Message } from '../../types';
import AIService, { StakeholderContext, ConversationContext } from '../../services/aiService';
import { azureTTS, playBrowserTTS, isAzureTTSAvailable } from '../../lib/azureTTS';
import { transcribeAudio, getSupportedAudioFormat } from '../../lib/whisper';
import { DatabaseService } from '../../lib/database';

interface ParticipantCardProps {
  participant: any;
  isCurrentSpeaker: boolean;
  isUser?: boolean;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ 
  participant, 
  isCurrentSpeaker, 
  isUser = false 
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get stakeholder photo from selectedStakeholders or participant data
  const getParticipantPhoto = () => {
    if (isUser) return null;
    
    // Try participant.photo first
    if (participant.photo) return participant.photo;
    
    // Try to find in selectedStakeholders
    const stakeholder = selectedStakeholders?.find(s => 
      s.name === participant.name || s.id === participant.id
    );
    return stakeholder?.photo || null;
  };

  const photo = getParticipantPhoto();

  return (
    <div className="relative bg-gray-800 rounded-xl overflow-hidden group hover:bg-gray-750 transition-colors border border-gray-700 w-64 h-48">
      {/* Animated Speaking Ring */}
      {isCurrentSpeaker && (
        <div className="absolute inset-0 rounded-xl border-4 border-green-400 animate-pulse z-10">
          <div className="absolute inset-0 rounded-xl border-4 border-green-400 opacity-50 animate-ping"></div>
        </div>
      )}
      
      {/* Video/Photo Content */}
      {!isUser && photo ? (
        <img
          src={photo}
          alt={participant.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-red-500">
          <span className="text-white text-6xl font-bold">
            {getInitials(participant.name)}
          </span>
        </div>
      )}
      
      {/* Name overlay */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
        {participant.name}
      </div>

             {/* Speaking/Mute indicator */}
       {!isUser && (
         <div className="absolute top-2 left-2">
           {isCurrentSpeaker ? (
             <div className="bg-green-500 p-1 rounded-full animate-pulse">
               <Volume2 className="w-3 h-3 text-white" />
             </div>
           ) : (
             <div className="bg-gray-600 p-1 rounded-full">
               <MicOff className="w-3 h-3 text-white" />
             </div>
           )}
         </div>
       )}
    </div>
  );
};

interface SpeakingQueueHeaderProps {
  currentSpeaker: string | null;
  upcomingQueue: { name: string; id?: string }[];
  selectedStakeholders: any[];
}

const SpeakingQueueHeader: React.FC<SpeakingQueueHeaderProps> = ({ 
  currentSpeaker, 
  upcomingQueue, 
  selectedStakeholders 
}) => {
  if (!currentSpeaker && upcomingQueue.length === 0) return null;
  
  const getCurrentSpeakerInfo = () => {
    if (!currentSpeaker) return null;
    return selectedStakeholders.find(s => s.name === currentSpeaker) || { name: currentSpeaker, role: 'Participant' };
  };

  const getUpcomingSpeakerInfo = (speakerName: string) => {
    return selectedStakeholders.find(s => s.name === speakerName) || { name: speakerName, role: 'Participant' };
  };

  const currentSpeakerInfo = getCurrentSpeakerInfo();
  
  return (
    <div className="bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-sm rounded-xl px-6 py-4 mx-6 mb-4 border border-gray-600/50 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Current Speaker */}
        {currentSpeakerInfo && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-50"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-green-400 text-sm font-semibold">Currently Speaking</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{currentSpeakerInfo.name}</span>
                  <span className="text-gray-300 text-xs">•</span>
                  <span className="text-gray-300 text-xs">{currentSpeakerInfo.role}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Speaking Queue */}
        {upcomingQueue.length > 0 && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-400 text-sm font-medium">Up Next:</span>
            </div>
            <div className="flex items-center space-x-3">
              {upcomingQueue.slice(0, 3).map((speaker, index) => {
                const speakerInfo = getUpcomingSpeakerInfo(speaker.name);
                return (
                  <div key={index} className="flex items-center space-x-1">
                    <div className="bg-gray-600/80 rounded-lg px-3 py-1.5 border border-gray-500/50">
                      <div className="flex flex-col">
                        <span className="text-white text-xs font-medium">{speakerInfo.name}</span>
                        <span className="text-gray-300 text-xs">{speakerInfo.role}</span>
                      </div>
                    </div>
                    {index < Math.min(upcomingQueue.length - 1, 2) && (
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    )}
                  </div>
                );
              })}
              {upcomingQueue.length > 3 && (
                <div className="bg-gray-600/60 rounded-lg px-2 py-1.5 border border-gray-500/30">
                  <span className="text-gray-400 text-xs">+{upcomingQueue.length - 3} more</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const VoiceOnlyMeetingView: React.FC = () => {
  const { selectedProject, selectedStakeholders, setCurrentView, user } = useApp();
  const { globalAudioEnabled, getStakeholderVoice, isStakeholderVoiceEnabled } = useVoice();
  
  // State management (same as before)
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioStates, setAudioStates] = useState<{[key: string]: 'playing' | 'paused' | 'stopped'}>({});
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<any>(null);
  
  // Dynamic UX state management
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [dynamicFeedback, setDynamicFeedback] = useState<string | null>(null);
  const [responseQueue, setResponseQueue] = useState<{
    current: string | null;
    upcoming: { name: string; id?: string }[];
  }>({ current: null, upcoming: [] });
  
  // Speaking queue management - EXACT REPLICA of transcript meeting
  const [conversationQueue, setConversationQueue] = useState<string[]>([]);
  const [currentSpeaking, setCurrentSpeaking] = useState<string | null>(null);

  // Transcription toggle and panel state
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(false);
  const [transcriptPanelOpen, setTranscriptPanelOpen] = useState(false);
  const [transcriptMessages, setTranscriptMessages] = useState<Message[]>([]);

  // Background transcript capture (always active)
  const [backgroundTranscript, setBackgroundTranscript] = useState<Message[]>([]);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [meetingStartTime, setMeetingStartTime] = useState(Date.now());

  // Add conversation dynamics from transcript meeting for adaptive responses
  const [conversationDynamics, setConversationDynamics] = useState({
    phase: 'initial' as 'initial' | 'introduction_active' | 'discussion_active',
    greetingIterations: 0,
    leadSpeaker: null as any,
    introducedMembers: new Set<string>()
  });

  // Background transcript capture function (always captures, regardless of UI)
  const addToBackgroundTranscript = (message: Message) => {
    console.log('📝 BACKGROUND TRANSCRIPT - Adding message:', {
      speaker: message.speaker,
      stakeholderName: message.stakeholderName,
      contentLength: message.content.length,
      timestamp: message.timestamp
    });
    
    setBackgroundTranscript(prev => {
      const newTranscript = [...prev, message];
      console.log('📝 BACKGROUND TRANSCRIPT - New length:', newTranscript.length);
      return newTranscript;
    });
    
    // Also add to visible transcript if enabled
    if (transcriptionEnabled) {
      setTranscriptMessages(prev => [...prev, message]);
    }
  };

  // Initialize meeting in database
  useEffect(() => {
    const initializeMeeting = async () => {
      console.log('🎯 INIT MEETING - Checking conditions:', {
        hasSelectedProject: !!selectedProject,
        stakeholdersCount: selectedStakeholders.length,
        hasUserId: !!user?.id,
        hasExistingMeetingId: !!meetingId
      });
      
      if (selectedProject && selectedStakeholders.length > 0 && user?.id && !meetingId) {
        try {
          const stakeholderIds = selectedStakeholders.map(s => s.id);
          const stakeholderNames = selectedStakeholders.map(s => s.name);
          const stakeholderRoles = selectedStakeholders.map(s => s.role);
          
          console.log('🎯 INIT MEETING - Creating meeting with:', {
            userId: user.id,
            projectId: selectedProject.id,
            projectName: selectedProject.name,
            stakeholderIds,
            stakeholderNames,
            stakeholderRoles
          });
          
          const newMeetingId = await DatabaseService.createMeeting(
            user.id,
            selectedProject.id,
            selectedProject.name,
            stakeholderIds,
            stakeholderNames,
            stakeholderRoles,
            'voice-only'
          );
          
          console.log('🎯 INIT MEETING - DatabaseService.createMeeting result:', newMeetingId);
          
          if (newMeetingId) {
            setMeetingId(newMeetingId);
            setMeetingStartTime(Date.now());
            console.log('🎯 Meeting initialized in database:', newMeetingId);
          } else {
            console.error('🎯 INIT MEETING - Failed to create meeting, no ID returned');
          }
        } catch (error) {
          console.error('🎯 INIT MEETING - Error initializing meeting:', error);
        }
      } else {
        console.log('🎯 INIT MEETING - Conditions not met, skipping initialization');
      }
    };

    initializeMeeting();
  }, [selectedProject, selectedStakeholders, user?.id, meetingId]);

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
      setDynamicFeedback(null);
      
      // Create and add message with dynamic indexing
      const responseMessage = createResponseMessage(stakeholder, response, currentMessages.length);
      let updatedMessages = [...currentMessages, responseMessage];
      setMessages(updatedMessages);
      
      // Add to background transcript (always captured)
      addToBackgroundTranscript(responseMessage);
      
      // Force cleanup of thinking state to prevent display issues
      setTimeout(() => {
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

    // Add user message to background transcript (always captured)
    addToBackgroundTranscript(userMessage);

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

  // Direct voice recording functions
  const startDirectRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: getSupportedAudioFormat() });
        await transcribeAndSend(audioBlob);
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsTranscribing(false); // Only set to true when actually transcribing
      setDynamicFeedback('🎤 Recording your message... Click microphone to stop');
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      setIsTranscribing(false);
      
      // Show user-friendly error message
      let errorMessage = '❌ Recording failed. ';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Microphone permission denied. Please allow microphone access.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No microphone found. Please check your audio devices.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage += 'Recording not supported in this browser.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please try again.';
      }
      
      setDynamicFeedback(errorMessage);
      setTimeout(() => setDynamicFeedback(null), 5000);
    }
  };

  const stopDirectRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDynamicFeedback('🔄 Processing and transcribing your message...');
    }
  };

  const transcribeAndSend = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      
      // Check if OpenAI is configured
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your-openai-api-key-here') {
        // Test mode - simulate transcription
        console.log('🧪 Test mode: Simulating transcription');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
        
        const testTranscription = "Hello, this is a test message from the voice recorder.";
        setDynamicFeedback('🧪 Test mode: Simulated transcription');
        
        // Send the test message
        setInputMessage(testTranscription);
        await handleSendMessageWithText(testTranscription);
        
        // Clear feedback after message is fully processed
        setDynamicFeedback(null);
        return;
      }
      
      const transcription = await transcribeAudio(audioBlob);
      
      if (transcription && transcription.trim()) {
        // Automatically send the transcription
        setInputMessage(transcription);
        // Trigger the send message with the transcribed text
        await handleSendMessageWithText(transcription);
        
        // Clear feedback after message is fully processed
        setDynamicFeedback(null);
      } else {
        console.warn('No transcription received or transcription was empty');
        setDynamicFeedback('❌ No speech detected. Please try again.');
        setTimeout(() => setDynamicFeedback(null), 3000);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      
      // Show user-friendly error message
      let errorMessage = '❌ Transcription failed. ';
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage += 'OpenAI API key not configured.';
        } else if (error.message.includes('quota')) {
          errorMessage += 'API quota exceeded.';
        } else if (error.message.includes('network')) {
          errorMessage += 'Network error. Check your connection.';
        } else {
          errorMessage += 'Please try again.';
        }
      } else {
        errorMessage += 'Please try again.';
      }
      
      setDynamicFeedback(errorMessage);
      setTimeout(() => setDynamicFeedback(null), 5000);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSendMessageWithText = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    // Set the input message and trigger the existing handleSendMessage logic
    setInputMessage(messageText);
    
    // Use the existing handleSendMessage function which has all the proper logic
    await handleSendMessage();
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopDirectRecording();
    } else {
      startDirectRecording();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndMeeting = () => {
    console.log('🔚 END MEETING - Starting end meeting process');
    console.log('🔚 Meeting data before save:', {
      meetingId,
      userId: user?.id,
      backgroundTranscriptLength: backgroundTranscript.length,
      messagesLength: messages.length,
      selectedProject: selectedProject?.name,
      selectedStakeholders: selectedStakeholders?.length
    });
    
    stopAllAudio();
    saveMeetingToDatabase();
    setCurrentView('stakeholders');
  };

  // Save meeting to database with complete transcript and metadata
  const saveMeetingToDatabase = async () => {
    console.log('💾 SAVE MEETING - Starting save process');
    console.log('💾 Save validation:', {
      meetingId,
      userId: user?.id,
      backgroundTranscriptLength: backgroundTranscript.length,
      backgroundTranscriptSample: backgroundTranscript.slice(0, 2)
    });
    
    if (!meetingId || !user?.id) {
      console.warn('❌ Cannot save meeting: missing meetingId or user', { meetingId, userId: user?.id });
      return;
    }

    if (backgroundTranscript.length === 0) {
      console.warn('⚠️ Warning: No background transcript captured during meeting');
    }

    try {
      const duration = Math.floor((Date.now() - meetingStartTime) / 1000); // in seconds
      console.log('💾 Meeting duration calculated:', duration, 'seconds');
      
      // Generate meeting summary from background transcript
      console.log('💾 Generating meeting summary...');
      const meetingSummary = await generateMeetingSummary(backgroundTranscript);
      console.log('💾 Meeting summary generated:', meetingSummary.substring(0, 100) + '...');
      
      // Extract topics and insights
      console.log('💾 Extracting topics and insights...');
      const topicsDiscussed = extractTopicsFromTranscript(backgroundTranscript);
      const keyInsights = extractKeyInsights(backgroundTranscript);
      console.log('💾 Topics:', topicsDiscussed);
      console.log('💾 Key insights:', keyInsights.length, 'insights extracted');
      
      // Save to database
      console.log('💾 Calling DatabaseService.saveMeetingData...');
      const success = await DatabaseService.saveMeetingData(
        meetingId,
        backgroundTranscript, // Complete transcript (always captured)
        messages, // Raw chat messages
        '', // Meeting notes (empty for voice-only)
        meetingSummary,
        duration,
        topicsDiscussed,
        keyInsights
      );

      console.log('💾 DatabaseService.saveMeetingData result:', success);

      if (success) {
        // Update user progress
        console.log('💾 Incrementing meeting count...');
        await DatabaseService.incrementMeetingCount(user.id, 'voice-only');
        console.log('✅ Meeting saved to database successfully');
      } else {
        console.error('❌ Failed to save meeting to database');
      }

      // Also save to localStorage as backup
      const meetingData = {
        id: meetingId,
        project: selectedProject?.name,
        stakeholders: selectedStakeholders?.map(s => s.name),
        transcript: backgroundTranscript,
        summary: meetingSummary,
        duration,
        date: new Date().toISOString()
      };
      localStorage.setItem(`meeting-${meetingId}`, JSON.stringify(meetingData));
      
    } catch (error) {
      console.error('Error saving meeting:', error);
    }
  };

  // Generate AI-powered meeting summary
  const generateMeetingSummary = async (transcript: Message[]): Promise<string> => {
    if (transcript.length === 0) return 'No conversation recorded.';
    
    try {
      const conversationText = transcript
        .map(msg => `${msg.stakeholderName || msg.speaker}: ${msg.content}`)
        .join('\n');
      
      const aiService = AIService.getInstance();
      const prompt = `Please provide a concise meeting summary of this stakeholder interview:

${conversationText}

Focus on:
- Key topics discussed
- Important insights shared
- Stakeholder perspectives
- Next steps or recommendations

Keep it professional and under 300 words.`;

      const summary = await aiService.generateResponse(prompt, [], {});
      return summary || 'Unable to generate meeting summary.';
    } catch (error) {
      console.error('Error generating meeting summary:', error);
      return 'Meeting summary could not be generated due to technical issues.';
    }
  };

  // Extract topics discussed from transcript
  const extractTopicsFromTranscript = (transcript: Message[]): string[] => {
    const topics = new Set<string>();
    
    // Simple keyword extraction (can be enhanced with NLP)
    const topicKeywords = [
      'process', 'workflow', 'system', 'requirements', 'goals', 'challenges',
      'improvement', 'efficiency', 'automation', 'integration', 'data',
      'user experience', 'performance', 'security', 'compliance', 'budget'
    ];

    transcript.forEach(msg => {
      const content = msg.content.toLowerCase();
      topicKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          topics.add(keyword);
        }
      });
    });

    return Array.from(topics).slice(0, 10); // Limit to top 10 topics
  };

  // Extract key insights from transcript
  const extractKeyInsights = (transcript: Message[]): string[] => {
    const insights: string[] = [];
    
    // Look for insight indicators in stakeholder responses
    transcript.forEach(msg => {
      if (msg.speaker !== 'user' && msg.content.length > 100) {
        const content = msg.content;
        
        // Look for sentences that indicate insights
        if (content.includes('challenge') || content.includes('issue') || 
            content.includes('improvement') || content.includes('recommend') ||
            content.includes('important') || content.includes('key')) {
          
          // Extract the sentence containing the insight
          const sentences = content.split('.').filter(s => s.length > 20);
          sentences.forEach(sentence => {
            if (sentence.includes('challenge') || sentence.includes('issue') || 
                sentence.includes('improvement') || sentence.includes('recommend')) {
              insights.push(sentence.trim() + '.');
            }
          });
        }
      }
    });

    return insights.slice(0, 5); // Limit to top 5 insights
  };

  // Meeting timer
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - meetingStartTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [meetingStartTime]);

  // Auto-scroll transcript to bottom when new messages are added
  useEffect(() => {
    if (transcriptEndRef.current && transcriptPanelOpen) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcriptMessages, transcriptPanelOpen]);

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
    setDynamicFeedback(null);
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

  // Calculate optimal grid layout for video call style
  const getGridCols = (count: number) => {
    if (count <= 2) return 'grid-cols-1 lg:grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4';
  };

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-gray-900 px-6 py-3 flex items-center justify-between text-white border-b border-gray-700">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <span className="font-semibold text-lg">{selectedProject?.name || 'Stakeholder Meeting'}</span>
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-green-400 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Live Meeting
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-300">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Transcription Toggle */}
          <div className="flex items-center space-x-3">
            <span className="text-gray-300 text-sm">Transcription</span>
            <button
              onClick={() => {
                setTranscriptionEnabled(!transcriptionEnabled);
                if (!transcriptionEnabled) {
                  setTranscriptPanelOpen(true);
                  // Add existing messages to transcript when enabling
                  setTranscriptMessages(messages);
                } else {
                  setTranscriptPanelOpen(false);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                transcriptionEnabled ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  transcriptionEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Meeting Controls */}
          <div className="flex items-center space-x-2">
            {/* Mic Button */}
            <button
              onClick={handleMicClick}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isRecording 
                  ? 'bg-purple-600 hover:bg-purple-700 animate-pulse shadow-lg shadow-purple-500/50' 
                  : isTranscribing
                  ? 'bg-blue-500 hover:bg-blue-600 animate-pulse'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isRecording ? 'Stop Recording' : isTranscribing ? 'Processing...' : 'Start Recording'}
            >
              {isRecording ? <Square className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
            </button>

            {/* Stop Button */}
            <button
              onClick={handleStopCurrent}
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
              title="Stop current speaker"
            >
              <Square className="w-4 h-4 text-white" />
            </button>

            {/* Debug Button - Remove after testing */}
            <button
              onClick={() => {
                console.log('🔍 DEBUG INFO:', {
                  meetingId,
                  userId: user?.id,
                  userEmail: user?.email,
                  backgroundTranscriptLength: backgroundTranscript.length,
                  messagesLength: messages.length,
                  selectedProject: selectedProject?.name,
                  selectedStakeholdersCount: selectedStakeholders?.length,
                  meetingStartTime,
                  elapsedTime: Math.floor((Date.now() - meetingStartTime) / 1000)
                });
                
                // Test database connection
                DatabaseService.getUserProgress(user?.id || '').then(progress => {
                  console.log('🔍 DATABASE TEST - User progress:', progress);
                }).catch(error => {
                  console.error('🔍 DATABASE TEST - Error:', error);
                });
              }}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
              title="Debug info"
            >
              <span className="text-white text-xs">?</span>
            </button>

            {/* End Call */}
            <button 
              onClick={handleEndMeeting}
              className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
              title="End meeting"
            >
              <Phone className="w-4 h-4 text-white transform rotate-[135deg]" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-1.5">
            <Users className="w-4 h-4 text-gray-300" />
            <span className="text-gray-200">{allParticipants.length} participants</span>
          </div>
        </div>
      </div>

      {/* Speaking Queue Header */}
      <SpeakingQueueHeader 
        currentSpeaker={currentSpeaker?.name || null}
        upcomingQueue={responseQueue.upcoming}
        selectedStakeholders={selectedStakeholders}
      />

      {/* Main Content - Fixed height, no scrolling */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Main Video Area */}
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="flex flex-col gap-4 max-h-[calc(100vh-280px)] items-center">
            {(() => {
              const totalParticipants = allParticipants.length;
              
              // Layout logic based on number of participants
              if (totalParticipants <= 4) {
                // 1-4 people: single row
                return (
                  <div className="flex gap-4 justify-center">
                    {allParticipants.map((participant, index) => (
                      <ParticipantCard
                        key={participant.name}
                        participant={participant}
                        isCurrentSpeaker={currentSpeaker?.name === participant.name}
                        isUser={index === 0}
                      />
                    ))}
                  </div>
                );
              } else if (totalParticipants === 5) {
                // 5 people: 3 in first row, 2 centered in second row
                return (
                  <>
                    <div className="flex gap-4">
                      {allParticipants.slice(0, 3).map((participant, index) => (
                        <ParticipantCard
                          key={participant.name}
                          participant={participant}
                          isCurrentSpeaker={currentSpeaker?.name === participant.name}
                          isUser={index === 0}
                        />
                      ))}
                    </div>
                    <div className="flex gap-4 justify-center">
                      {allParticipants.slice(3, 5).map((participant, index) => (
                        <ParticipantCard
                          key={participant.name}
                          participant={participant}
                          isCurrentSpeaker={currentSpeaker?.name === participant.name}
                          isUser={index + 3 === 0}
                        />
                      ))}
                    </div>
                  </>
                );
              } else if (totalParticipants === 6) {
                // 6 people: 3 in first row, 3 in second row
                return (
                  <>
                    <div className="flex gap-4">
                      {allParticipants.slice(0, 3).map((participant, index) => (
                        <ParticipantCard
                          key={participant.name}
                          participant={participant}
                          isCurrentSpeaker={currentSpeaker?.name === participant.name}
                          isUser={index === 0}
                        />
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {allParticipants.slice(3, 6).map((participant, index) => (
                        <ParticipantCard
                          key={participant.name}
                          participant={participant}
                          isCurrentSpeaker={currentSpeaker?.name === participant.name}
                          isUser={index + 3 === 0}
                        />
                      ))}
                    </div>
                  </>
                );
              } else {
                // 7+ people: 3 in first row, rest centered in second row
                return (
                  <>
                    <div className="flex gap-4">
                      {allParticipants.slice(0, 3).map((participant, index) => (
                        <ParticipantCard
                          key={participant.name}
                          participant={participant}
                          isCurrentSpeaker={currentSpeaker?.name === participant.name}
                          isUser={index === 0}
                        />
                      ))}
                    </div>
                    <div className="flex gap-4 justify-center">
                      {allParticipants.slice(3).map((participant, index) => (
                        <ParticipantCard
                          key={participant.name}
                          participant={participant}
                          isCurrentSpeaker={currentSpeaker?.name === participant.name}
                          isUser={index + 3 === 0}
                        />
                      ))}
                    </div>
                  </>
                );
              }
            })()}
          </div>
        </div>

        {/* Message Input Area */}
        <div className="relative px-6 py-4 bg-gray-900 border-t border-gray-700">
          {/* Dynamic Feedback Display */}
          {dynamicFeedback && (
            <div className="mb-3 bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-sm rounded-lg px-3 py-2 text-center border border-purple-500/30 shadow-lg">
              <span className="text-white text-sm font-medium">{dynamicFeedback}</span>
            </div>
          )}
          
          <div className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message"
              className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-400"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Sliding Transcript Panel */}
          {transcriptionEnabled && (
            <>
              {/* Floating Transcript Button (when minimized) */}
              {!transcriptPanelOpen && (
                <button
                  onClick={() => setTranscriptPanelOpen(true)}
                  className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg shadow-lg transition-all duration-200 text-xs font-medium"
                  title="Show transcript"
                >
                  Transcript ({transcriptMessages.length})
                </button>
              )}

              {/* Transcript Panel - slides up from text area */}
              <div 
                className={`absolute bottom-full left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-600 transition-all duration-300 ease-in-out overflow-hidden ${
                  transcriptPanelOpen ? 'max-h-32' : 'max-h-0'
                }`}
              >
                {/* Transcript Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <h3 className="text-white font-medium text-sm">Transcript</h3>
                    <span className="text-gray-400 text-xs">({transcriptMessages.length})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setTranscriptPanelOpen(!transcriptPanelOpen)}
                      className="text-gray-400 hover:text-white transition-colors p-1"
                      title={transcriptPanelOpen ? "Minimize transcript" : "Show transcript"}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTranscriptMessages([])}
                      className="text-gray-400 hover:text-red-400 transition-colors p-1"
                      title="Clear transcript"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Transcript Content */}
                <div className="overflow-y-auto p-3 space-y-2" style={{ height: '80px' }}>
                  {transcriptMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <div className="w-6 h-6 mx-auto mb-1 opacity-50">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <p className="text-xs">Transcript appears here</p>
                      </div>
                    </div>
                  ) : (
                    transcriptMessages.map((message, index) => (
                      <div key={message.id} className="flex space-x-2">
                        <div className="flex-shrink-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            message.speaker === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-purple-600 text-white'
                          }`}>
                            {message.speaker === 'user' 
                              ? 'U' 
                              : (message.stakeholderName || message.speaker).split(' ').map(n => n[0]).join('').slice(0, 1)
                            }
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1 mb-1">
                            <span className="text-white font-medium text-xs">
                              {message.speaker === 'user' ? 'You' : (message.stakeholderName || message.speaker)}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-200 text-xs leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={transcriptEndRef} />
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};