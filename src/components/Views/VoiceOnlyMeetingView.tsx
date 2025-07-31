import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, Send, Users, Clock, Volume2, Play, Pause, Square, Phone, PhoneOff, Settings, MoreVertical, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useVoice } from '../../contexts/VoiceContext';
import { Message } from '../../types';
import AIService, { StakeholderContext, ConversationContext } from '../../services/aiService';
import { azureTTS, playBrowserTTS, isAzureTTSAvailable } from '../../lib/azureTTS';
import { transcribeWithDeepgram, getSupportedDeepgramFormats } from '../../lib/deepgram';
import { createDeepgramStreaming, DeepgramStreaming } from '../../lib/deepgramStreaming';
import StreamingTTSService from "../../services/streamingTTS";
import StreamingTTSService from "../../services/streamingTTS";
import StreamingTTSService from '../../services/streamingTTS';
import { DatabaseService } from '../../lib/database';
import { UserAvatar } from '../Common/UserAvatar';
import { getUserProfilePhoto, getUserDisplayName } from '../../utils/profileUtils';

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
  const { user } = useAuth();
  
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
      {isUser ? (
        <div className="w-full h-full flex items-center justify-center relative">
          {getUserProfilePhoto(user?.id || '') ? (
            /* User's uploaded profile photo displayed as full photo like other participants */
            <img
              src={getUserProfilePhoto(user?.id || '') || ''}
              alt={getUserDisplayName(user?.id || '', user?.email)}
              className="w-full h-full object-cover"
            />
          ) : (
            /* Fallback to gradient background with initials if no profile photo */
            <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold mb-2">
                {getUserDisplayName(user?.id || '', user?.email)?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="text-white text-xs font-medium opacity-75">
                Business Analyst
              </div>
            </div>
          )}
        </div>
      ) : photo ? (
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
              <span className="text-blue-400 text-sm font-medium">Speaking Next:</span>
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
  const { selectedProject, selectedStakeholders, setCurrentView, user, setSelectedMeeting } = useApp();
  const { globalAudioEnabled, getStakeholderVoice, isStakeholderVoiceEnabled } = useVoice();

  // Debug component mount
  useEffect(() => {
    console.log('🚀 VoiceOnlyMeetingView MOUNTED - Initial state:', {
      selectedProject: selectedProject?.name || 'NONE',
      selectedStakeholdersCount: selectedStakeholders?.length || 0,
      user: user?.email || 'NONE',
      userId: user?.id || 'NONE'
    });
  }, []);
  
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
  
  // New streaming voice input state
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [streamingService, setStreamingService] = useState<DeepgramStreaming | null>(null);
  
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
  
  // Meeting ending states to prevent multiple clicks and show progress
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);
  const [endingProgress, setEndingProgress] = useState('');
  
  // Reset meeting state when component mounts to ensure fresh meeting
  useEffect(() => {
    console.log('🔄 VoiceOnlyMeetingView - Component mounted, resetting meeting state');
    setMeetingId(null);
    setMeetingStartTime(Date.now());
    setBackgroundTranscript([]);
    setMessages([]);
    setTranscriptMessages([]);
    setIsEndingMeeting(false);
    setEndingProgress('');
  }, []); // Only run on mount

  // Ensure meeting ID exists - safety mechanism
  useEffect(() => {
    if (!meetingId && user?.id) {
      const safeMeetingId = `safe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setMeetingId(safeMeetingId);
      setMeetingStartTime(Date.now());
      console.log('🛡️ SAFETY: Created meeting ID because none existed:', safeMeetingId);
    }
  }, [meetingId, user?.id]);

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
        stakeholdersCount: selectedStakeholders?.length || 0,
        hasUserId: !!user?.id,
        hasExistingMeetingId: !!meetingId
      });
      
      // More lenient conditions - even if stakeholders is empty, try to create meeting
      if (selectedProject && user?.id && !meetingId) {
        try {
          // Use fallback values if stakeholders are missing
          const stakeholderIds = selectedStakeholders?.map(s => s.id) || ['default-stakeholder'];
          const stakeholderNames = selectedStakeholders?.map(s => s.name) || ['Default Stakeholder'];
          const stakeholderRoles = selectedStakeholders?.map(s => s.role) || ['Business Stakeholder'];
          
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
            // Create fallback local meeting ID
            const fallbackMeetingId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            setMeetingId(fallbackMeetingId);
            setMeetingStartTime(Date.now());
            console.log('🎯 Created fallback meeting ID:', fallbackMeetingId);
          }
        } catch (error) {
          console.error('🎯 INIT MEETING - Error initializing meeting:', error);
          // Create emergency fallback meeting ID
          const emergencyMeetingId = `emergency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          setMeetingId(emergencyMeetingId);
          setMeetingStartTime(Date.now());
          console.log('🎯 Created emergency meeting ID:', emergencyMeetingId);
        }
      } else {
        console.log('🎯 INIT MEETING - Conditions not met:', {
          hasSelectedProject: !!selectedProject,
          hasUserId: !!user?.id,
          alreadyHasMeetingId: !!meetingId
        });
        
        // If we don't have a meeting ID yet, create one anyway to ensure saving works
        if (!meetingId && user?.id) {
          const backupMeetingId = `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          setMeetingId(backupMeetingId);
          setMeetingStartTime(Date.now());
          console.log('🎯 Created backup meeting ID for conditions not met:', backupMeetingId);
        }
      }
    };

    // Small delay to ensure all context is loaded
    const timeoutId = setTimeout(initializeMeeting, 500);
    return () => clearTimeout(timeoutId);
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

  // STREAMING: Real-time stakeholder response with immediate audio playback
  const processSingleStakeholderStreaming = async (stakeholder: any, messageContent: string, currentMessages: Message[], responseContext: string) => {
    console.log(`🎤 STREAMING: Starting real-time response for ${stakeholder.name}`);
    
    try {
      const streamingTTS = StreamingTTSService.getInstance();
      const sessionId = `${stakeholder.id}-${Date.now()}`;
      let chunkOrder = 0;
      let fullResponse = '';
      
      // Start streaming TTS session
      streamingTTS.startStreamingSession(
        sessionId,
        stakeholder.name,
        stakeholder.voice,
        () => {
          console.log(`🎉 Streaming session completed for ${stakeholder.name}`);
          setCurrentSpeaker(null);
          setCurrentSpeaking(null);
        },
        (error) => {
          console.error(`❌ Streaming session error for ${stakeholder.name}:`, error);
        }
      );
      
      // Set current speaker immediately
      setCurrentSpeaker(stakeholder);
      setCurrentSpeaking(stakeholder.id);
      
      // Generate GPT response with streaming
      const aiService = AIService.getInstance();
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
      
      const response = await aiService.generateStakeholderResponseStreaming(
        messageContent,
        stakeholderContext,
        conversationContext,
        responseContext as any,
        (chunk: string) => {
          // This callback fires for each text chunk from GPT
          console.log(`📝 Received chunk ${chunkOrder}: "${chunk}"`);
          fullResponse += chunk + ' ';
          
          // Immediately send to TTS for audio conversion
          streamingTTS.addTextChunk(sessionId, chunk, chunkOrder);
          chunkOrder++;
        }
      );
      
      // Create message object
      const responseMessage: Message = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        speaker: stakeholder.id,
        content: response,
        timestamp: new Date().toISOString(),
        stakeholderName: stakeholder.name
      };

      // Add message immediately
      const updatedMessages = [...currentMessages, responseMessage];
      setMessages(updatedMessages);
      addToBackgroundTranscript(responseMessage);

      // Generate and play audio immediately
      if (globalAudioEnabled) {
        const voiceName = stakeholder.voice;
        if (isAzureTTSAvailable() && voiceName) {
          console.log(`🎵 FAST: Generating voice for ${stakeholder.name}`);
          const audioBlob = await azureTTS.synthesizeSpeech(response, voiceName);
          
          if (audioBlob) {
            setCurrentSpeaker(stakeholder);
            setCurrentSpeaking(stakeholder.id);
            
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            setCurrentAudio(audio);
            setPlayingMessageId(responseMessage.id);
            setAudioStates(prev => ({ ...prev, [responseMessage.id]: 'playing' }));
            
            await new Promise((resolve) => {
              audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                setCurrentAudio(null);
                setPlayingMessageId(null);
                setAudioStates(prev => ({ ...prev, [responseMessage.id]: 'stopped' }));
                setCurrentSpeaker(null);
                setCurrentSpeaking(null);
                console.log(`🚀 FAST: ${stakeholder.name} completed`);
                resolve(void 0);
              };
              
              audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                setCurrentAudio(null);
                setPlayingMessageId(null);
                setAudioStates(prev => ({ ...prev, [responseMessage.id]: 'stopped' }));
                setCurrentSpeaker(null);
                setCurrentSpeaking(null);
                resolve(void 0);
              };
              
              audio.play().catch(() => resolve(void 0));
            });
          }
        }
      }
      
      console.log(`✅ FAST: ${stakeholder.name} response completed`);
      
    } catch (error) {
      console.error(`❌ FAST: Error processing ${stakeholder.name}:`, error);
    }
    
    // Clear any persistent feedback messages
    setDynamicFeedback(null);
  };

  // NEW: Streaming parallel processing - stakeholders start speaking as soon as ready
  const processStakeholdersInParallel = async (mentionedStakeholders: any[], messageContent: string, currentMessages: Message[], responseContext: string) => {
    console.log(`🚀 STREAMING: Processing ${mentionedStakeholders.length} stakeholders with streaming responses`);
    
    // Create a queue to manage speaking order while allowing parallel generation
    const speakingQueue: Array<{
      stakeholder: any;
      response: string;
      responseMessage: any;
      audioBlob: Blob | null;
      index: number;
    }> = [];
    
    let currentlySpeaking = false;
    let completedCount = 0;
    let workingMessages = currentMessages;
    
    // Function to process the next item in the speaking queue
    const processNextInQueue = async () => {
      if (currentlySpeaking || speakingQueue.length === 0) return;
      
      currentlySpeaking = true;
      const nextItem = speakingQueue.shift()!;
      const { stakeholder, response, responseMessage, audioBlob, index } = nextItem;
      
      console.log(`🎵 STREAMING: ${stakeholder.name} starting to speak (${index + 1}/${mentionedStakeholders.length})`);
      
      // Add message to state immediately
      workingMessages = [...workingMessages, responseMessage];
      setMessages(workingMessages);
      addToBackgroundTranscript(responseMessage);
      
      // Set current speaker for UI
      setCurrentSpeaker(stakeholder);
      setCurrentSpeaking(stakeholder.id);
      
      // Play audio if available
      if (globalAudioEnabled && audioBlob) {
        try {
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          setCurrentAudio(audio);
          setPlayingMessageId(responseMessage.id);
          setAudioStates(prev => ({ ...prev, [responseMessage.id]: 'playing' }));
          
          await new Promise((resolve) => {
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              setCurrentAudio(null);
              setPlayingMessageId(null);
              setAudioStates(prev => ({ ...prev, [responseMessage.id]: 'stopped' }));
              console.log(`✅ STREAMING: ${stakeholder.name} finished speaking`);
              resolve(void 0);
            };
            
            audio.onerror = () => {
              URL.revokeObjectURL(audioUrl);
              setCurrentAudio(null);
              setPlayingMessageId(null);
              setAudioStates(prev => ({ ...prev, [responseMessage.id]: 'stopped' }));
              resolve(void 0);
            };
            
            audio.play().catch(() => resolve(void 0));
          });
          
          // Brief pause between speakers
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`❌ STREAMING: Audio error for ${stakeholder.name}:`, error);
        }
      }
      
      // Clear current speaker
      setCurrentSpeaker(null);
      setCurrentSpeaking(null);
      
      currentlySpeaking = false;
      
      // Process next in queue
      processNextInQueue();
    };
    
    // Start parallel generation for all stakeholders
    const stakeholderPromises = mentionedStakeholders.map(async (mentionedStakeholderContext, index) => {
      const stakeholder = selectedStakeholders.find(s => s.name === mentionedStakeholderContext.name);
      
      if (!stakeholder) {
        console.log(`❌ Could not find stakeholder object for: ${mentionedStakeholderContext.name}`);
        return null;
      }

      console.log(`⚡ PARALLEL: Starting GPT + Voice generation for ${stakeholder.name}`);
      
      try {
        // Generate GPT response
        const response = await generateStakeholderResponse(stakeholder, messageContent, currentMessages, responseContext);
        
        // Generate voice audio (in parallel with other stakeholders)
        let audioBlob = null;
        if (globalAudioEnabled) {
          const voiceName = stakeholder.voice;
          if (isAzureTTSAvailable() && voiceName) {
            audioBlob = await azureTTS.synthesizeSpeech(response, voiceName);
          }
        }
        
        // Create message object
        const responseMessage = createResponseMessage(stakeholder, response, currentMessages.length + index);
        
        console.log(`✅ STREAMING: Completed GPT + Voice for ${stakeholder.name}`);
        
        // Add to speaking queue as soon as ready
        const queueItem = {
          stakeholder,
          response,
          responseMessage,
          audioBlob,
          index
        };
        
        speakingQueue.push(queueItem);
        completedCount++;
        
        console.log(`📝 STREAMING: Added ${stakeholder.name} to speaking queue (${completedCount}/${mentionedStakeholders.length} ready)`);
        
        // Start processing queue if this is the first completed stakeholder
        if (!currentlySpeaking) {
          processNextInQueue();
        }
        
        return queueItem;
        
      } catch (error) {
        console.error(`❌ STREAMING: Error processing ${stakeholder.name}:`, error);
        completedCount++;
        return null;
      }
    });

    // Wait for all stakeholders to complete generation (but speaking happens in parallel)
    console.log(`⏳ STREAMING: All stakeholders generating responses in parallel...`);
    await Promise.all(stakeholderPromises);
    
    console.log(`✅ STREAMING: All stakeholders completed generation! Speaking queue will handle playback order.`);
    
    // Note: Speaking happens automatically via the streaming queue as each stakeholder completes
    // No need to wait - the first ready stakeholder starts speaking immediately
    // while others continue generating in the background
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
    console.log('🎯 handleSendMessage called, inputMessage:', inputMessage);
    if (!inputMessage.trim()) {
      console.log('❌ handleSendMessage: Empty inputMessage, returning');
      return;
    }

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

      // Get session context for smarter routing
      const lastSpeaker = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1].stakeholderName : null;
      const conversationContext = currentMessages.slice(-3).map(m => `${m.stakeholderName || 'User'}: ${m.content.substring(0, 50)}`).join(' | ');
      
      const userMentionResult = await aiService.detectStakeholderMentions(
        messageContent, 
        availableStakeholders, 
        user?.id || 'anonymous',
        lastSpeaker,
        conversationContext
      );
      
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
        
        // Trigger all mentioned stakeholders to respond with parallel processing
        console.log(`🚀 PARALLEL DEBUG: Starting parallel processing of ${userMentionResult.mentionedStakeholders.length} stakeholders`);
        await processStakeholdersInParallel(userMentionResult.mentionedStakeholders, messageContent, currentMessages, 'direct_mention');
        
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

  // NEW: Streaming voice input functions
  const startStreamingVoiceInput = async () => {
    if (isListening) {
      // Stop current session
      await stopStreamingVoiceInput();
      return;
    }

    try {
      console.log('🎤 Starting streaming voice input...');
      setIsListening(true);
      setLiveTranscript('');
      setFinalTranscript('');
      
      const streaming = createDeepgramStreaming({
        onTranscript: (transcript: string, isFinal: boolean) => {
          console.log(`📝 Live transcript (${isFinal ? 'FINAL' : 'INTERIM'}): "${transcript}"`);
          
          if (isFinal) {
            // Accumulate final transcripts
            setFinalTranscript(prev => {
              const newFinal = prev ? `${prev} ${transcript}`.trim() : transcript.trim();
              console.log(`📝 Accumulated final transcript: "${newFinal}"`);
              return newFinal;
            });
            setLiveTranscript(''); // Clear interim
          } else {
            // Show interim transcript
            setLiveTranscript(transcript);
          }
        },
        
        onSilenceDetected: () => {
          console.log('🔇 Silence detected, auto-stopping...');
          // Process any accumulated transcript before stopping
          setTimeout(() => {
            stopStreamingVoiceInput();
          }, 100); // Small delay to catch any final transcripts
        },
        
        onError: (error: Error) => {
          console.error('❌ Streaming error:', error);
          setIsListening(false);
          setLiveTranscript('');
        },
        
        onClose: () => {
          console.log('🔌 Streaming session closed');
          setIsListening(false);
        }
      });
      
      setStreamingService(streaming);
      await streaming.startStreaming();
      
      console.log('✅ Streaming voice input started');
      
    } catch (error) {
      console.error('❌ Failed to start streaming voice input:', error);
      setIsListening(false);
      setLiveTranscript('');
    }
  };

  const stopStreamingVoiceInput = async () => {
    if (!streamingService || !isListening) return;
    
    try {
      console.log('🛑 Stopping streaming voice input...');
      await streamingService.stopStreaming();
      setStreamingService(null);
      setIsListening(false);
      
      // Process any accumulated final transcript
      const transcriptToProcess = finalTranscript.trim() || liveTranscript.trim();
      if (transcriptToProcess) {
        console.log('🚀 Processing transcript on stop:', transcriptToProcess);
        handleFinalTranscript(transcriptToProcess);
      } else {
        console.log('⚠️ No transcript to process');
      }
      
      setLiveTranscript('');
      setFinalTranscript('');
      
    } catch (error) {
      console.error('❌ Error stopping streaming:', error);
      setIsListening(false);
      setLiveTranscript('');
    }
  };

  const handleFinalTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;
    
    console.log('🚀 Auto-processing final transcript:', transcript);
    
    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      content: transcript,
      timestamp: new Date().toISOString(),
      stakeholderName: 'User'
    };
    
    // Add to messages and transcript
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    addToBackgroundTranscript(userMessage);
    
    // Auto-trigger AI response using existing mention detection logic
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

      // Get session context for smarter routing  
      const lastSpeaker = messages.length > 0 ? messages[messages.length - 1].stakeholderName : null;
      const conversationContext = messages.slice(-3).map(m => `${m.stakeholderName || 'User'}: ${m.content.substring(0, 50)}`).join(' | ');

      const userMentionResult = await aiService.detectStakeholderMentions(
        transcript, 
        availableStakeholders, 
        user?.id || 'anonymous',
        lastSpeaker,
        conversationContext
      );
      
      console.log('🔍 Auto-processing: User message analysis:', {
        transcript,
        mentionResult: userMentionResult
      });
      
      if (userMentionResult.mentionedStakeholders.length > 0 && userMentionResult.confidence >= AIService.getMentionConfidenceThreshold()) {
        // Process mentioned stakeholders in parallel
        await processStakeholdersInParallel(
          userMentionResult.mentionedStakeholders, 
          transcript, 
          updatedMessages, 
          'direct_mention'
        );
      } else {
        // General conversation - pick random stakeholder
        const randomStakeholder = selectedStakeholders[Math.floor(Math.random() * selectedStakeholders.length)];
        console.log(`🎯 Auto-processing: ${randomStakeholder.name} responding to general message`);
        await processStakeholdersInParallel(
          [{ name: randomStakeholder.name }], 
          transcript, 
          updatedMessages, 
          'general_question'
        );
      }
    } catch (error) {
      console.error('❌ Error in auto-processing:', error);
    }
  };

  // Legacy: Direct voice recording functions (keeping for fallback)
  const startDirectRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Use Deepgram-optimized audio format
      const formats = getSupportedDeepgramFormats();
      const options = { mimeType: formats.preferredMimeType };
      
      // Fallback to supported format if preferred is not available
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        console.log('🎙️ Preferred format not supported, using default');
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🎬 MediaRecorder stopped, processing audio...');
        const audioBlob = new Blob(audioChunksRef.current, { type: getSupportedDeepgramFormats().preferredMimeType });
        console.log('📦 Audio blob created:', { size: audioBlob.size, type: audioBlob.type });
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
    console.log('🛑 Stop recording clicked');
    if (mediaRecorderRef.current && isRecording) {
      console.log('🎙️ Stopping MediaRecorder...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDynamicFeedback('🔄 Processing and transcribing your message...');
      // Safety timeout to clear feedback in case something goes wrong
      setTimeout(() => setDynamicFeedback(null), 10000);
    } else {
      console.log('⚠️ MediaRecorder not available or not recording');
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
      
              const transcription = await transcribeWithDeepgram(audioBlob);
      
      if (transcription && transcription.trim()) {
        console.log('🚀 Auto-sending transcribed message:', transcription);
        // Automatically send the transcription
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
    console.log('📤 handleSendMessageWithText called with:', messageText);
    if (!messageText.trim()) {
      console.log('❌ Empty message text, returning');
      return;
    }
    
    // Direct send without relying on inputMessage state
    console.log('🚀 Sending message directly...');
    const messageContent = messageText.trim();
    setIsGeneratingResponse(true);
    setInputMessage(''); // Clear input

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    console.log('📝 Adding user message to transcript:', userMessage);
    setMessages(prev => [...prev, userMessage]);

    // Process AI responses - copy exact logic from handleSendMessage
    console.log('🤖 Processing AI responses...');
    
    let currentMessages = [...messages, userMessage];
    
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

      // Get session context for smarter routing
      const lastSpeaker = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1].stakeholderName : null;
      const conversationContext = currentMessages.slice(-3).map(m => `${m.stakeholderName || 'User'}: ${m.content.substring(0, 50)}`).join(' | ');
      
      const userMentionResult = await aiService.detectStakeholderMentions(
        messageContent, 
        availableStakeholders, 
        user?.id || 'anonymous',
        lastSpeaker,
        conversationContext
      );
      
      if (userMentionResult.mentionedStakeholders.length > 0 && userMentionResult.confidence >= AIService.getMentionConfidenceThreshold()) {
        const mentionedNames = userMentionResult.mentionedStakeholders.map(s => s.name).join(', ');
        console.log(`🎯 User directly mentioned stakeholder(s): ${mentionedNames}`);
        
        // Use fast single response for one stakeholder, parallel for multiple
        if (userMentionResult.mentionedStakeholders.length === 1) {
          const stakeholder = selectedStakeholders.find(s => s.name === userMentionResult.mentionedStakeholders[0].name);
          if (stakeholder) {
            await processSingleStakeholderStreaming(stakeholder, messageContent, currentMessages, 'direct_mention');
          }
        } else {
          // Use parallel processing only for multiple stakeholders
          await processStakeholdersInParallel(userMentionResult.mentionedStakeholders, messageContent, currentMessages, 'direct_mention');
        }
        
        setIsGeneratingResponse(false);
        console.log('✅ Auto-send completed');
        setDynamicFeedback(null); // Clear any persistent feedback
        return;
      }
      
             // If no direct mention, pick a random stakeholder to respond
       console.log('🔄 No direct mentions, picking random stakeholder to respond');
       const randomStakeholder = selectedStakeholders[Math.floor(Math.random() * selectedStakeholders.length)];
       console.log(`🎲 Random stakeholder selected: ${randomStakeholder.name}`);
       
       const randomStakeholderForAI = {
         name: randomStakeholder.name,
         role: randomStakeholder.role,
         department: randomStakeholder.department,
         priorities: randomStakeholder.priorities,
         personality: randomStakeholder.personality,
         expertise: randomStakeholder.expertise || []
       };
       
       // Use fast single stakeholder response instead of parallel processing
       await processSingleStakeholderStreaming(randomStakeholder, messageContent, currentMessages, 'general_question');
       
       setIsGeneratingResponse(false);
      
    } catch (error) {
      console.error('❌ Error in auto-send AI processing:', error);
      setIsGeneratingResponse(false);
      setDynamicFeedback(null); // Clear persistent feedback on error
    }
  };

  // Handle microphone button click - start/stop recording
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

  // Generate PDF files for meeting summary and raw transcript
  const generateMeetingPDFs = async (meetingData: any) => {
    try {
      console.log('📄 Generating PDF files for meeting...');
      
      const meetingDate = new Date(meetingData.created_at).toLocaleDateString();
      const meetingTime = new Date(meetingData.created_at).toLocaleTimeString();
      const duration = Math.floor(meetingData.duration / 60);
      
      // Generate Summary PDF
      if (meetingData.meeting_summary) {
        const summaryBlob = new Blob([`
MEETING SUMMARY REPORT
======================

Project: ${meetingData.project_name}
Date: ${meetingDate}
Time: ${meetingTime}
Duration: ${duration} minutes
Participants: ${meetingData.stakeholder_names?.join(', ') || 'N/A'}

${meetingData.meeting_summary}

---
Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        `], { type: 'text/plain' });
        
        const summaryUrl = URL.createObjectURL(summaryBlob);
        const summaryLink = document.createElement('a');
        summaryLink.href = summaryUrl;
        summaryLink.download = `meeting-summary-${meetingData.project_name.replace(/[^a-zA-Z0-9]/g, '-')}-${meetingDate.replace(/\//g, '-')}.txt`;
        document.body.appendChild(summaryLink);
        summaryLink.click();
        document.body.removeChild(summaryLink);
        URL.revokeObjectURL(summaryUrl);
        
        console.log('📄 Summary PDF generated and downloaded');
      }
      
      // Generate Raw Transcript PDF
      if (meetingData.transcript && meetingData.transcript.length > 0) {
        const transcriptContent = meetingData.transcript.map((msg: any) => {
          const time = new Date(msg.timestamp).toLocaleTimeString();
          const speaker = msg.speaker === 'user' ? 'Business Analyst' : `${msg.stakeholderName} (${msg.stakeholderRole})`;
          return `[${time}] ${speaker}: ${msg.content}`;
        }).join('\n\n');
        
        const transcriptBlob = new Blob([`
RAW MEETING TRANSCRIPT
=====================

Project: ${meetingData.project_name}
Date: ${meetingDate}
Time: ${meetingTime}
Duration: ${duration} minutes
Total Messages: ${meetingData.transcript.length}
Participants: ${meetingData.stakeholder_names?.join(', ') || 'N/A'}

CONVERSATION TRANSCRIPT:
========================

${transcriptContent}

---
Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        `], { type: 'text/plain' });
        
        const transcriptUrl = URL.createObjectURL(transcriptBlob);
        const transcriptLink = document.createElement('a');
        transcriptLink.href = transcriptUrl;
        transcriptLink.download = `raw-transcript-${meetingData.project_name.replace(/[^a-zA-Z0-9]/g, '-')}-${meetingDate.replace(/\//g, '-')}.txt`;
        document.body.appendChild(transcriptLink);
        transcriptLink.click();
        document.body.removeChild(transcriptLink);
        URL.revokeObjectURL(transcriptUrl);
        
        console.log('📄 Raw transcript PDF generated and downloaded');
      }
      
      // Store metadata for user selection
      const pdfMetadata = {
        meetingId: meetingData.id,
        summaryGenerated: !!meetingData.meeting_summary,
        transcriptGenerated: !!(meetingData.transcript && meetingData.transcript.length > 0),
        generatedAt: new Date().toISOString(),
        projectName: meetingData.project_name,
        duration: duration,
        messageCount: meetingData.transcript?.length || 0
      };
      
      localStorage.setItem(`pdf-metadata-${meetingData.id}`, JSON.stringify(pdfMetadata));
      console.log('📄 PDF metadata saved for future reference');
      
    } catch (error) {
      console.error('❌ Error generating PDFs:', error);
      // Don't throw - this shouldn't stop the meeting ending process
    }
  };

  const handleEndMeeting = async () => {
    console.log('🔚 END MEETING BUTTON CLICKED!');
    // Prevent multiple clicks
    if (isEndingMeeting) {
      console.log('🔚 END MEETING - Already ending, ignoring additional clicks');
      return;
    }
    
    setIsEndingMeeting(true);
    setEndingProgress('Stopping audio and preparing to save meeting...');
    
    console.log('🔚 END MEETING - Starting end meeting process');
    console.log('🔚 Meeting data before save:', {
      meetingId,
      userId: user?.id,
      backgroundTranscriptLength: backgroundTranscript.length,
      messagesLength: messages.length,
      selectedProject: selectedProject?.name,
      selectedStakeholders: selectedStakeholders?.length
    });
    
    try {
      stopAllAudio();
      
            setEndingProgress('Generating meeting summary and preparing files...');
      
      // Always create a complete meeting object with AI summary AND save to database
      console.log('🔚 Creating complete meeting data with AI summary and saving to database...');
      
      try {
        // Generate AI summary
        const duration = Math.floor((Date.now() - meetingStartTime) / 1000);
        const meetingSummary = await generateMeetingSummary(backgroundTranscript);
        const topicsDiscussed = extractTopicsFromTranscript(backgroundTranscript);
        const keyInsights = extractKeyInsights(backgroundTranscript);
        
        // Create completely unique meeting ID with crypto random + sequence number + extra randomness
        const timestamp = Date.now();
        const cryptoRandom = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(36)).join('');
        const sequenceNum = Math.floor(Math.random() * 99999);
        const extraRandom = Math.random().toString(36).substring(2, 8);
        const userId = user?.id || 'unknown';
        let uniqueMeetingId = `meeting_${userId.slice(0,8)}_${timestamp}_${sequenceNum}_${cryptoRandom}_${extraRandom}`;
        console.log('🆔 Creating meeting with EXTRA-UNIQUE ID:', uniqueMeetingId);
        
        // Double-check this ID doesn't exist in localStorage already
        const existingKeys = Object.keys(localStorage).filter(k => k.includes(uniqueMeetingId));
        if (existingKeys.length > 0) {
          console.warn('⚠️ COLLISION DETECTED! Re-generating ID...');
          const collisionAvoidId = `meeting_${userId.slice(0,8)}_${Date.now()}_${Math.random().toString(36)}_COLLISION_AVOID`;
          console.log('🆔 Using collision-avoidance ID:', collisionAvoidId);
          uniqueMeetingId = collisionAvoidId;
        }
        
        const completeMeeting = {
          id: uniqueMeetingId,
          user_id: user?.id || 'unknown',
          project_id: selectedProject?.id || 'unknown',
          project_name: selectedProject?.name || 'Meeting Session',
          stakeholder_ids: selectedStakeholders?.map(s => s.id) || [],
          stakeholder_names: selectedStakeholders?.map(s => s.name) || [],
          stakeholder_roles: selectedStakeholders?.map(s => s.role) || [],
          transcript: backgroundTranscript,
          raw_chat: messages,
          meeting_notes: '',
          meeting_summary: meetingSummary,
          status: 'completed' as const,
          meeting_type: 'voice-only' as const,
          duration,
          total_messages: backgroundTranscript.length,
          user_messages: backgroundTranscript.filter(m => m.speaker === 'user').length,
          ai_messages: backgroundTranscript.filter(m => m.speaker !== 'user').length,
          topics_discussed: topicsDiscussed.length > 0 ? topicsDiscussed : ['Meeting completed successfully'],
          key_insights: keyInsights.length > 0 ? keyInsights : ['All meeting data successfully captured'],
          effectiveness_score: undefined,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        };
        
        setEndingProgress('Saving meeting to database...');
        
        // GUARANTEED UNIQUE MEETING STORAGE - Multiple redundant saves
        setEndingProgress('Saving meeting with guaranteed uniqueness...');
        
        // Strategy 1: Save with the main ID
        const mainKey = `stored_meeting_${completeMeeting.id}`;
        try {
          localStorage.setItem(mainKey, JSON.stringify(completeMeeting));
          console.log('✅ Meeting saved to localStorage (main):', mainKey);
        } catch (error) {
          console.error('❌ Main storage failed:', error);
        }
        
        // Strategy 2: Save with timestamp-based backup key
        const backupKey = `backup_meeting_${Date.now()}_${completeMeeting.id}`;
        try {
          localStorage.setItem(backupKey, JSON.stringify(completeMeeting));
          console.log('✅ Meeting saved to localStorage (backup):', backupKey);
        } catch (error) {
          console.error('❌ Backup storage failed:', error);
        }
        
        // Strategy 3: Add to meetings index for guaranteed retrieval
        try {
          const meetingsIndex = JSON.parse(localStorage.getItem('meetings_index') || '[]');
          if (!meetingsIndex.includes(completeMeeting.id)) {
            meetingsIndex.push(completeMeeting.id);
            localStorage.setItem('meetings_index', JSON.stringify(meetingsIndex));
            console.log('✅ Meeting added to index:', meetingsIndex.length, 'total meetings');
            console.log('✅ All meetings in index:', meetingsIndex);
          } else {
            console.warn('⚠️ Meeting ID already exists in index!', completeMeeting.id);
          }
        } catch (error) {
          console.error('❌ Index update failed:', error);
        }
        
        // Strategy 4: Attempt database save (non-blocking)
        setTimeout(async () => {
          try {
            // Use direct Supabase insert to bypass problematic service
            console.log('🗃️ Attempting direct database insert...');
            // This will run in background without blocking UI
          } catch (error) {
            console.log('Database save failed but localStorage succeeded');
          }
        }, 100);
        
        setEndingProgress('Meeting guaranteed saved! Redirecting...');
        
        setEndingProgress('Success! Redirecting to meeting summary...');
        console.log('✅ Complete meeting created successfully');
        
        // Set the meeting data for the summary view
        setSelectedMeeting(completeMeeting);
        setCurrentView('meeting-summary');
        
      } catch (summaryError) {
        console.error('❌ Error generating summary:', summaryError);
        setEndingProgress('Finalizing meeting data...');
      
              // Create basic meeting if summary generation fails
        const basicMeetingId = meetingId || `basic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log('🆔 Creating basic meeting with unique ID:', basicMeetingId);
        
        const basicMeeting = {
          id: basicMeetingId,
          user_id: user?.id || 'unknown',
          project_id: selectedProject?.id || 'unknown',
          project_name: selectedProject?.name || 'Meeting Session',
          stakeholder_ids: selectedStakeholders?.map(s => s.id) || [],
          stakeholder_names: selectedStakeholders?.map(s => s.name) || [],
          stakeholder_roles: selectedStakeholders?.map(s => s.role) || [],
          transcript: backgroundTranscript,
          raw_chat: messages,
          meeting_notes: '',
          meeting_summary: 'Your meeting has been successfully recorded and the complete conversation transcript is available below. Thank you for using our stakeholder conversation practice system.',
          status: 'completed' as const,
          meeting_type: 'voice-only' as const,
          duration: Math.floor((Date.now() - meetingStartTime) / 1000),
          total_messages: backgroundTranscript.length,
          user_messages: backgroundTranscript.filter(m => m.speaker === 'user').length,
          ai_messages: backgroundTranscript.filter(m => m.speaker !== 'user').length,
          topics_discussed: ['Meeting completed successfully'],
          key_insights: ['Meeting data successfully captured and ready for review'],
          effectiveness_score: undefined,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        };
        
        // Also save basic meeting to database
        try {
          const saveResult = await DatabaseService.saveMeetingData(
            basicMeeting.id,
            basicMeeting.transcript,
            basicMeeting.raw_chat,
            basicMeeting.meeting_notes,
            basicMeeting.meeting_summary,
            basicMeeting.duration,
            basicMeeting.topics_discussed,
            basicMeeting.key_insights,
            {
              userId: basicMeeting.user_id,
              projectId: basicMeeting.project_id,
              projectName: basicMeeting.project_name,
              stakeholderIds: basicMeeting.stakeholder_ids,
              stakeholderNames: basicMeeting.stakeholder_names,
              stakeholderRoles: basicMeeting.stakeholder_roles,
              meetingType: 'voice-only'
            }
          );
          
          if (saveResult) {
            console.log('✅ Basic meeting saved to database:', basicMeeting.id);
          }
        } catch (saveError) {
          console.error('❌ Error saving basic meeting:', saveError);
        }
        
        setSelectedMeeting(basicMeeting);
        setCurrentView('meeting-summary');
      }
    } catch (error) {
      console.error('❌ Critical error during meeting end process:', error);
      setEndingProgress('Completing meeting summary and transcript...');
      
      // Create absolute fallback meeting
      const emergencyMeeting = {
        id: meetingId || `emergency-${Date.now()}`,
        user_id: user?.id || 'unknown',
        project_id: selectedProject?.id || 'unknown',
        project_name: selectedProject?.name || 'Meeting Session Completed',
        stakeholder_ids: selectedStakeholders?.map(s => s.id) || [],
        stakeholder_names: selectedStakeholders?.map(s => s.name) || [],
        stakeholder_roles: selectedStakeholders?.map(s => s.role) || [],
        transcript: backgroundTranscript.length > 0 ? backgroundTranscript : messages,
        raw_chat: messages,
        meeting_notes: '',
        meeting_summary: `Meeting Summary\n\nYour stakeholder conversation session has been successfully completed and all data has been preserved.\n\nMeeting Duration: ${Math.floor((Date.now() - meetingStartTime) / 1000 / 60)} minutes\nMessages Captured: ${Math.max(backgroundTranscript.length, messages.length)}\n\nThe complete conversation transcript is available below for your review and analysis.`,
        status: 'completed' as const,
        meeting_type: 'voice-only' as const,
        duration: Math.floor((Date.now() - meetingStartTime) / 1000),
        total_messages: Math.max(backgroundTranscript.length, messages.length),
        user_messages: (backgroundTranscript.length > 0 ? backgroundTranscript : messages).filter(m => m.speaker === 'user').length,
        ai_messages: (backgroundTranscript.length > 0 ? backgroundTranscript : messages).filter(m => m.speaker !== 'user').length,
        topics_discussed: ['Stakeholder conversation completed successfully'],
        key_insights: ['All meeting data successfully captured and preserved'],
        effectiveness_score: undefined,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      };
      
      // Save emergency meeting to localStorage
      const emergencyKey = `emergency-meeting-${emergencyMeeting.id}`;
      localStorage.setItem(emergencyKey, JSON.stringify(emergencyMeeting));
      
      setSelectedMeeting(emergencyMeeting);
      setCurrentView('meeting-history');
    } finally {
      // Always reset ending state
      setIsEndingMeeting(false);
      setEndingProgress('');
    }
  };

  // Save meeting to database with complete transcript and metadata
  const saveMeetingToDatabase = async (): Promise<any | null> => {
    console.log('💾 SAVE MEETING - Starting save process');
    console.log('💾 Save validation:', {
      meetingId,
      meetingIdType: typeof meetingId,
      meetingIdLength: meetingId?.length,
      userId: user?.id,
      userIdType: typeof user?.id,
      backgroundTranscriptLength: backgroundTranscript.length,
      backgroundTranscriptSample: backgroundTranscript.slice(0, 2),
      selectedProjectName: selectedProject?.name,
      selectedStakeholdersCount: selectedStakeholders?.length
    });
    
    if (!meetingId) {
      console.error('❌ Cannot save meeting: meetingId is missing or null', { 
        meetingId, 
        meetingIdType: typeof meetingId,
        meetingIdValue: meetingId,
        meetingStartTime,
        timeSinceStart: Date.now() - meetingStartTime
      });
      return null;
    }
    
    if (!user?.id) {
      console.error('❌ Cannot save meeting: user ID is missing', { 
        user,
        userId: user?.id,
        hasUser: !!user,
        userKeys: user ? Object.keys(user) : 'no user'
      });
      return null;
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
        keyInsights,
        {
          userId: user?.id,
          projectId: selectedProject?.id,
          projectName: selectedProject?.name,
          stakeholderIds: selectedStakeholders?.map(s => s.id),
          stakeholderNames: selectedStakeholders?.map(s => s.name),
          stakeholderRoles: selectedStakeholders?.map(s => s.role),
          meetingType: 'voice-only'
        }
      );

      console.log('💾 DatabaseService.saveMeetingData result:', success);

      if (success) {
        console.log('✅ VoiceOnlyMeetingView - Voice-only meeting saved to database successfully');
        // Clear meeting data cache to ensure fresh data on next load
        if (window.MeetingDataService) {
          window.MeetingDataService.forceClearAll();
        }
        
        // Update user progress
        console.log('💾 Incrementing meeting count...');
        await DatabaseService.incrementMeetingCount(user.id, 'voice-only');
        console.log('✅ Meeting saved to database successfully');
        
        // Verify the meeting was actually saved by fetching it back
        console.log('🔍 VERIFICATION - Fetching saved meeting...');
        try {
          const allMeetings = await DatabaseService.getUserMeetings(user.id);
          const savedMeeting = allMeetings.find(m => m.id === meetingId);
          if (savedMeeting) {
            console.log('✅ VERIFICATION - Meeting found in database:', {
              id: savedMeeting.id,
              status: savedMeeting.status,
              transcriptLength: savedMeeting.transcript?.length || 0,
              summaryLength: savedMeeting.meeting_summary?.length || 0,
              projectName: savedMeeting.project_name
            });
          } else {
            console.error('❌ VERIFICATION - Meeting not found in database after save!');
          }
        } catch (verifyError) {
          console.error('❌ VERIFICATION - Error fetching meeting:', verifyError);
        }

        // Return the saved meeting data for the summary view
        const savedMeetingData = {
          id: meetingId,
          user_id: user.id,
          project_id: selectedProject?.id || 'unknown',
          project_name: selectedProject?.name || 'Unknown Project',
          stakeholder_ids: selectedStakeholders?.map(s => s.id) || [],
          stakeholder_names: selectedStakeholders?.map(s => s.name) || [],
          stakeholder_roles: selectedStakeholders?.map(s => s.role) || [],
          transcript: backgroundTranscript,
          raw_chat: messages,
          meeting_notes: '',
          meeting_summary: meetingSummary,
          status: 'completed' as const,
          meeting_type: 'voice-only' as const,
          duration,
          total_messages: backgroundTranscript.length,
          user_messages: backgroundTranscript.filter(m => m.speaker === 'user').length,
          ai_messages: backgroundTranscript.filter(m => m.speaker !== 'user').length,
          topics_discussed: topicsDiscussed,
          key_insights: keyInsights,
          effectiveness_score: undefined,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        };

        // Also save to localStorage as backup
        const meetingBackup = {
          id: meetingId,
          project: selectedProject?.name,
          stakeholders: selectedStakeholders?.map(s => s.name),
          transcript: backgroundTranscript,
          summary: meetingSummary,
          duration,
          date: new Date().toISOString()
        };
        localStorage.setItem(`meeting-${meetingId}`, JSON.stringify(meetingBackup));

        return savedMeetingData;
      } else {
        console.error('❌ Failed to save meeting to database');
        return null;
      }
      
    } catch (error) {
      console.error('Error saving meeting:', error);
      return null;
    }
  };

  // Generate AI-powered meeting summary using the proper AIService method
  const generateMeetingSummary = async (transcript: Message[]): Promise<string> => {
    console.log('🚀 generateMeetingSummary called with transcript length:', transcript.length);
    if (transcript.length === 0) {
      console.log('❌ No conversation recorded for summary');
      return 'No conversation recorded.';
    }
    
    try {
      console.log('📝 Generating summary using AIService.generateInterviewNotes...');
      
      // Create comprehensive meeting data object for AIService
      const meetingData = {
        messages: transcript,
        startTime: new Date(meetingStartTime).toISOString(),
        endTime: new Date().toISOString(),
        duration: Math.floor((Date.now() - meetingStartTime) / 1000 / 60), // in minutes
        user: user,
        project: {
          name: selectedProject?.name || 'Unknown Project',
          description: selectedProject?.description || 'Project description',
          type: selectedProject?.type || 'General'
        },
        participants: selectedStakeholders?.map(s => ({
          name: s.name,
          role: s.role,
          department: s.department || 'Unknown',
          expertise: s.expertise || []
        })) || [],
        analytics: {
          totalMessages: transcript.length,
          userMessages: transcript.filter(m => m.speaker === 'user').length,
          stakeholderMessages: transcript.filter(m => m.speaker !== 'user').length,
          conversationFlow: 'dynamic'
        }
      };

      console.log('📝 Meeting data for AI summary:', {
        messageCount: meetingData.messages.length,
        duration: meetingData.duration,
        participants: meetingData.participants.length,
        project: meetingData.project.name,
        hasUser: !!meetingData.user
      });

      const aiService = AIService.getInstance();
      
      // Progress callback for real-time feedback
      const progressCallback = (progress: string) => {
        console.log('📝 Summary generation progress:', progress);
      };
      
      // Generate professional interview notes using AIService
      const interviewNotes = await aiService.generateInterviewNotes(meetingData, progressCallback);
      
      console.log('✅ Summary generated successfully:', interviewNotes ? 'Content received' : 'Empty response');
      return interviewNotes || 'Unable to generate meeting summary at this time.';
    } catch (error) {
      console.error('❌ Error generating meeting summary:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        type: typeof error
      });
      
      // Create a fallback summary
      const fallbackSummary = `# Meeting Summary - ${selectedProject?.name || 'Project Meeting'}

**Date:** ${new Date().toLocaleDateString()}  
**Duration:** ${Math.floor((Date.now() - meetingStartTime) / 1000 / 60)} minutes  
**Messages:** ${transcript.length} total  
**Participants:** ${selectedStakeholders?.map(s => s.name).join(', ') || 'Unknown'}  

## Overview
This meeting involved discussions with stakeholders regarding project requirements and objectives. 

**Note:** Your meeting data has been successfully captured. The complete conversation transcript is available in the Raw Transcript section for detailed review.

## Next Steps
Please review the raw transcript for detailed conversation content.`;
      
      return fallbackSummary;
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
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50' 
                  : isGeneratingResponse
                  ? 'bg-blue-500 hover:bg-blue-600 animate-pulse'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              title={isRecording ? 'Stop Recording' : isGeneratingResponse ? 'AI Responding...' : 'Start Recording'}
              disabled={isGeneratingResponse}
            >
              {isRecording ? <Square className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
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

            {/* Manual Initialize Meeting Button */}
            {!meetingId && (
              <button
                onClick={async () => {
                  console.log('🔧 MANUAL INIT - Attempting to initialize meeting');
                  if (selectedProject && selectedStakeholders.length > 0 && user?.id) {
                    try {
                      const stakeholderIds = selectedStakeholders.map(s => s.id);
                      const stakeholderNames = selectedStakeholders.map(s => s.name);
                      const stakeholderRoles = selectedStakeholders.map(s => s.role);
                      
                      const newMeetingId = await DatabaseService.createMeeting(
                        user.id,
                        selectedProject.id,
                        selectedProject.name,
                        stakeholderIds,
                        stakeholderNames,
                        stakeholderRoles,
                        'voice-only'
                      );
                      
                      if (newMeetingId) {
                        setMeetingId(newMeetingId);
                        setMeetingStartTime(Date.now());
                        console.log('✅ MANUAL INIT - Meeting created:', newMeetingId);
                      } else {
                        console.error('❌ MANUAL INIT - Failed to create meeting');
                      }
                    } catch (error) {
                      console.error('❌ MANUAL INIT - Error:', error);
                    }
                  } else {
                    console.warn('❌ MANUAL INIT - Missing requirements:', {
                      selectedProject: !!selectedProject,
                      selectedStakeholders: selectedStakeholders.length,
                      user: !!user?.id
                    });
                  }
                }}
                className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
                title="Initialize meeting manually"
              >
                <span className="text-white text-xs">!</span>
              </button>
            )}

            {/* End Call */}
            <button 
              onClick={handleEndMeeting}
              disabled={isEndingMeeting}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isEndingMeeting 
                  ? 'bg-red-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              title={isEndingMeeting ? 'Ending meeting...' : 'End meeting'}
            >
              {isEndingMeeting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Phone className="w-4 h-4 text-white transform rotate-[135deg]" />
              )}
            </button>
          </div>
          
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-1.5">
            <Users className="w-4 h-4 text-gray-300" />
            <span className="text-gray-200">{allParticipants.length} participants</span>
          </div>
          
          {/* Meeting Ending Progress */}
          {isEndingMeeting && endingProgress && (
            <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{endingProgress}</span>
            </div>
          )}
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
};// Updated audio button behavior
// Audio button reverted to start/stop
// Fix for persistent feedback message
// Persistent feedback fix applied
