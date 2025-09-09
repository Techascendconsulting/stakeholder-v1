import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, Send, Volume2, Play, Square, PhoneOff, ChevronDown, X, GripVertical, FileText } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext'; // Not needed for refinement simulation
import { useVoice } from '../../contexts/VoiceContext';
// import { Message } from '../../types'; // Using custom interface for refinement meeting
import { isConfigured as elevenConfigured, synthesizeToBlob } from '../../services/elevenLabsTTS';
import { playBrowserTTS } from '../../lib/browserTTS';
import { playPreGeneratedAudio, findPreGeneratedAudio, hasPreGeneratedAudio, stopAllAudio } from '../../services/preGeneratedAudioService';
import { transcribeAudio, getSupportedAudioFormat } from '../../lib/whisper';
import AIService from '../../services/aiService';
import AgileRefinementService, { AgileTeamMemberContext } from '../../services/agileRefinementService';
import { getCoachingForSegment, shouldShowCoaching, CoachingPoint } from '../../services/refinementCoachingService';
import CoachingOverlay from '../RefinementMeeting/CoachingOverlay';
import MeetingControls from '../RefinementMeeting/MeetingControls';

// Custom interface for refinement meeting messages
interface MeetingMessage {
  id: string;
  speaker: string;
  content: string;
  timestamp: string;
  role: 'Scrum Master' | 'Senior Developer' | 'Developer' | 'QA Tester' | 'Business Analyst' | 'user';
  stakeholderId: string;
}
import { getUserProfilePhoto, getUserDisplayName } from '../../utils/profileUtils';

// Utility function to clean markdown formatting for TTS
const cleanMarkdownForTTS = (text: string): string => {
  return text
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\*/g, '') // Remove italic markers
    .replace(/^#+\s*/gm, '') // Remove markdown headers
    .replace(/^\d+\.\s*/gm, '') // Remove numbered list formatting
    .replace(/^-\s*/gm, '') // Remove bullet points
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic formatting
    .replace(/`([^`]+)`/g, '$1') // Remove code formatting
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .trim();
};

// AgileTicket interface
interface AgileTicket {
  id: string;
  ticketNumber: string;
  projectId: string;
  projectName: string;
  type: 'Story' | 'Task' | 'Bug' | 'Spike';
  title: string;
  description: string;
  acceptanceCriteria?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Draft' | 'Ready for Refinement' | 'Refined' | 'In Sprint' | 'To Do' | 'In Progress' | 'In Test' | 'Done';
  storyPoints?: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  attachments?: any[];
  comments?: any[];
  refinementScore?: {
    clarity: number;
    completeness: number;
    testability: number;
    overall: number;
    feedback: string[];
    aiSummary: string;
  };
}

interface RefinementMeetingViewProps {
  stories: AgileTicket[];
  onMeetingEnd: (results: any) => void;
  onClose: () => void;
}

// Helper functions
const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'Low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

// Participant Card Component (like voice-only meetings)
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
  // No auth needed for refinement simulation
  const user = { full_name: 'You', id: 'user', email: 'user@example.com' };
  
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden group hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border border-gray-200 dark:border-gray-700 w-full h-40">
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
            <img
              src={getUserProfilePhoto(user?.id || '') || ''}
              alt={getUserDisplayName(user?.id || '', user?.email)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-purple-500 to-pink-500">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold mb-2">
                {getUserDisplayName(user?.id || '', user?.email)?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="text-white text-sm font-medium opacity-90">
                Business Analyst
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center relative">
          {participant.avatarUrl ? (
            <img
              src={participant.avatarUrl}
              alt={participant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                console.log('Avatar image failed to load:', participant.avatarUrl);
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div 
            className="w-full h-full flex items-center justify-center" 
            style={{ 
              backgroundColor: getAvatarColor(participant.name).replace('bg-', '#').replace('-500', ''),
              display: participant.avatarUrl ? 'none' : 'flex'
            }}
          >
            <span className="text-white text-lg font-bold">
              {getInitials(participant.name)}
            </span>
          </div>
        </div>
      )}
      
      {/* Name overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white px-1 py-0.5 text-xs text-center truncate">
        {participant.name.split(' ')[0]}
      </div>

      {/* Speaking indicator */}
      {!isUser && isCurrentSpeaker && (
        <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
      )}
    </div>
  );
};

export const RefinementMeetingView: React.FC<RefinementMeetingViewProps> = ({
  stories: initialStories,
  onMeetingEnd,
  onClose
}) => {
  // No auth needed for refinement simulation
  const user = { full_name: 'You', id: 'user', email: 'user@example.com' };
  const { globalAudioEnabled, setGlobalAudioEnabled } = useVoice();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Meeting state (reusing voice meeting patterns)
  const [stories, setStories] = useState<AgileTicket[]>(initialStories);
  const [meetingStartTime] = useState<number>(Date.now());
  const [transcript, setTranscript] = useState<MeetingMessage[]>([]);
  const [transcriptPanelOpen, setTranscriptPanelOpen] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (transcriptEndRef.current && transcriptPanelOpen) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, transcriptPanelOpen]);
  // Use the same turn-taking system as voice-only meetings
  const [currentSpeaking, setCurrentSpeaking] = useState<string | null>(null);
  const [conversationQueue, setConversationQueue] = useState<string[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [storyPointsAgreed, setStoryPointsAgreed] = useState<{[storyId: string]: boolean}>({});
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioStates, setAudioStates] = useState<Record<string, string>>({});
  const [isMeetingActive, setIsMeetingActive] = useState(true);
  
  // Coaching system state
  const [currentCoaching, setCurrentCoaching] = useState<CoachingPoint | null>(null);
  const [isCoachingVisible, setIsCoachingVisible] = useState(false);
  const [isMeetingPaused, setIsMeetingPaused] = useState(false);
  const [hasCoachingAvailable, setHasCoachingAvailable] = useState(false);
  const [coachingHistory, setCoachingHistory] = useState<CoachingPoint[]>([]);
  
  // Ref for story content auto-scrolling
  const storyContentRef = useRef<HTMLDivElement>(null);
  
  // Voice input state (reusing voice meeting patterns)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [userInput, setUserInput] = useState('');
  
  // Meeting-specific state
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [editingStory, setEditingStory] = useState<AgileTicket | null>(null);
  const [isViewingStory, setIsViewingStory] = useState(false); // For read-only viewing during BA presentation
  
  // Ref to track meeting cancellation for more aggressive cleanup
  const meetingCancelledRef = useRef(false);
  
  // Kanban columns state with drag-and-drop
  const [kanbanColumns, setKanbanColumns] = useState<{
    ready: { id: string; title: string; stories: string[] };
    discussing: { id: string; title: string; stories: string[] };
    refined: { id: string; title: string; stories: string[] };
  }>({
    'ready': {
      id: 'ready',
      title: 'Ready for Discussion',
      stories: initialStories.map(s => s.id)
    },
    'discussing': {
      id: 'discussing', 
      title: 'Currently Discussing',
      stories: []
    },
    'refined': {
      id: 'refined',
      title: 'Refined',
      stories: []
    }
  });

  // Type-safe column access
  const getColumn = (columnId: string) => {
    return kanbanColumns[columnId as keyof typeof kanbanColumns];
  };

  const updateColumn = (columnId: string, updates: Partial<{ id: string; title: string; stories: string[] }>) => {
    setKanbanColumns(prev => ({
      ...prev,
      [columnId]: { ...prev[columnId as keyof typeof prev], ...updates }
    }));
  };

  // AI Refinement Service
  const aiService = AgileRefinementService.getInstance();
  const teamMembers = aiService.getTeamMembers();

  // Use Victor as BA for the password reset story in Trial 2
  const displayTeamMembers = React.useMemo(() => {
    const firstStory = initialStories?.[0];
    if (firstStory && isPasswordResetStory(firstStory.title)) {
      return teamMembers.map(m =>
        m.role === 'Business Analyst'
          ? { ...m, id: 'victor', name: 'Victor', voiceId: 'neMPCpWtBwWZhxEC8qpe', avatarUrl: '/images/avatars/victor-avatar.png' }
          : m
      );
    }
    return teamMembers;
  }, [initialStories, teamMembers]);

  // Helper: detect if current story is the Password Reset Confirmation Email (Trial 2)
  function isPasswordResetStory(storyTitle?: string) {
    if (!storyTitle) return false;
    return storyTitle.toLowerCase().includes('password reset confirmation email');
  }

  // Helper: get BA for current story (Victor for Trial 2, otherwise Bola)
  const getBusinessAnalystMember = (storyTitle?: string) => {
    const defaultBA = teamMembers.find(m => m.role === 'Business Analyst') || {
      id: 'bola',
      name: 'Bola',
      role: 'Business Analyst' as const,
      voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID_BOLA || 'en-US-AriaNeural',
      personality: 'Detail-oriented, user-focused',
      focusAreas: ['Requirements clarity', 'User experience', 'Business value'],
      responseStyle: 'Presents requirements clearly and answers questions'
    };
    const currentStory = storyTitle || initialStories?.[0]?.title;
    if (currentStory && isPasswordResetStory(currentStory)) {
      return {
        ...defaultBA,
        id: 'victor',
        name: 'Victor',
        voiceId: 'neMPCpWtBwWZhxEC8qpe'
      };
    }
    return defaultBA;
  };

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Handle ESC key to close story modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isEditingStory) {
        setIsEditingStory(false);
        setIsViewingStory(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditingStory]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      console.log('🧹 RefinementMeetingView unmounting - cleaning up...');
      setIsMeetingActive(false);
      stopCurrentAudio();
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Set meeting as active when component mounts and pre-generate audio
  useEffect(() => {
    setIsMeetingActive(true);
    console.log('🎬 RefinementMeetingView mounted - meeting is active');
    
    // Pre-generate audio for the refinement meeting
    const preGenerateAudio = async () => {
      try {
        const { audioCacheService } = await import('../../services/audioCacheService');
        await audioCacheService.preGenerateRefinementMeetingAudio();
        console.log('🎵 AUDIO: Pre-generation completed');
      } catch (error) {
        console.warn('⚠️ AUDIO: Failed to pre-generate audio:', error);
      }
    };
    
    preGenerateAudio();
  }, []);

  // Voice Meeting Audio Control (reused from VoiceOnlyMeetingView)
  const playMessageAudio = async (messageId: string, text: string, teamMember: AgileTeamMemberContext, autoPlay: boolean = true): Promise<void> => {
    console.log('Audio playback attempt:', { messageId, teamMember: teamMember.name, globalAudioEnabled, autoPlay });
    
    if (!globalAudioEnabled) {
      console.log('Audio disabled globally');
      return Promise.resolve();
    }

    if (meetingCancelledRef.current) {
      console.log(`🚫 Meeting cancelled, skipping audio for ${teamMember.name}`);
      return Promise.resolve();
    }

    try {
      if (meetingCancelledRef.current) {
        console.log(`🚫 Meeting cancelled, skipping audio for ${teamMember.name}`);
        return Promise.resolve();
      }

      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
      }
      
      if (!autoPlay) {
        return Promise.resolve();
      }

      // Don't set currentSpeaking here - addAIMessage handles it
      setIsAudioPlaying(true);

      const voiceName = teamMember.voiceId;
      console.log('🎵 Using voice:', voiceName, 'for team member:', teamMember.name);
      console.log('🔧 Checking for pre-generated audio...');
      
      // First, try to find pre-generated audio
      const preGeneratedAudio = findPreGeneratedAudio(teamMember.name, text);
      if (preGeneratedAudio) {
        console.log('✅ Using pre-generated audio:', preGeneratedAudio.id);
        try {
          await playPreGeneratedAudio(preGeneratedAudio.id);
          console.log(`🚀 AUDIO DEBUG: ${teamMember.name} pre-generated audio completed`);
          setIsAudioPlaying(false);
          setPlayingMessageId(null);
          setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }));
          return Promise.resolve();
        } catch (error) {
          console.log('🔄 Pre-generated audio failed, falling back to ElevenLabs');
          // Continue to ElevenLabs fallback below
        }
      }
      
      // Fallback to ElevenLabs if no pre-generated audio found
      console.log('🔧 ElevenLabs TTS Available:', elevenConfigured());
      
      if (elevenConfigured()) {
          console.log('✅ Using ElevenLabs TTS for audio synthesis');
          
          // Add timeout to prevent hanging
          const synthesisPromise = synthesizeToBlob(text, { 
            stakeholderName: teamMember.name,
            voiceId: teamMember.voiceId 
          });
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Audio synthesis timeout')), 10000)
          );
          
          const audioBlob = await Promise.race([synthesisPromise, timeoutPromise]) as Blob;
          
          if (audioBlob) {
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
            // Don't clear currentSpeaking here - the addAIMessage function handles it
            setIsAudioPlaying(false);
            console.log(`🚀 AUDIO DEBUG: ${teamMember.name} audio naturally ended`);
            resolve();
          };
          
          audio.onerror = (error) => {
            console.error('Audio element error:', error);
            URL.revokeObjectURL(audioUrl);
            setCurrentAudio(null);
            setPlayingMessageId(null);
            setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }));
            // Don't clear currentSpeaking here - addAIMessage handles it
            setIsAudioPlaying(false);
            resolve();
          };
          
          audio.play().then(() => {
            console.log(`🚀 AUDIO DEBUG: ${teamMember.name} audio started playing`);
          }).catch((playError) => {
            console.error('Audio play error:', playError);
            URL.revokeObjectURL(audioUrl);
            setCurrentAudio(null);
            setPlayingMessageId(null);
            setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }));
            // Don't clear currentSpeaking here - addAIMessage handles it
            setIsAudioPlaying(false);
            resolve();
          });
        });
        } else {
          console.warn('❌ ElevenLabs TTS returned null, falling back to browser TTS');
          await playBrowserTTS(text);
          return Promise.resolve();
        }
      } else {
        console.log('⚠️ ElevenLabs TTS not available, falling back to browser TTS');
        await playBrowserTTS(text);
        console.log(`🚀 AUDIO DEBUG: ${teamMember.name} audio completed`);
        setIsAudioPlaying(false);
        setPlayingMessageId(null);
        setAudioStates(prev => ({ ...prev, [messageId]: 'stopped' }));
        return Promise.resolve();
      }
    } catch (error) {
      console.error('Error in playMessageAudio:', error);
      setIsAudioPlaying(false);
      return Promise.resolve();
    }
  };

  // Stop current audio (interrupt AI speakers)
  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setCurrentSpeaking(null);
      setIsAudioPlaying(false);
      setPlayingMessageId(null);
      console.log('🛑 Audio stopped by user');
    }
  };

  // EXACT COPY of working processDynamicStakeholderResponse from VoiceOnlyMeetingView
  const addAIMessage = async (teamMember: AgileTeamMemberContext, text: string, audioId?: string) => {
    console.log(`🚀 QUEUE DEBUG: ${teamMember.name} starting addAIMessage`);
    console.log(`🚀 QUEUE DEBUG: Current speaker before: ${currentSpeaking}`);
    console.log(`🚀 QUEUE DEBUG: Current queue before: [${conversationQueue.join(', ')}]`);
    
    try {
      // Check cancellation flag first
      if (meetingCancelledRef.current) {
        console.log(`🚫 Meeting cancelled, aborting addAIMessage for ${teamMember.name}`);
        return;
      }
      
      // Add to conversation queue to prevent simultaneous speaking - EXACT COPY
      setConversationQueue(prev => {
        const newQueue = [...prev, teamMember.id];
        console.log(`🚀 QUEUE DEBUG: ${teamMember.name} added to queue. New queue: [${newQueue.join(', ')}]`);
        return newQueue;
      });
      
      // Wait for turn if someone else is speaking - EXACT COPY
      let waitCount = 0;
      // Exit immediately if meeting ended or cancelled
      if (!isMeetingActive || meetingCancelledRef.current) {
        console.log(`🚫 Meeting inactive or cancelled, aborting queue wait for ${teamMember.name}`);
        return;
      }

      while (currentSpeaking !== null && currentSpeaking !== teamMember.name) {
        if (!isMeetingActive || meetingCancelledRef.current) {
          console.log(`🚫 Meeting inactive or cancelled, aborting speak wait for ${teamMember.name}`);
          return;
        }
        waitCount++;
        console.log(`🚀 QUEUE DEBUG: ${teamMember.name} waiting (attempt ${waitCount}). Current speaker: ${currentSpeaking}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Safety break after 20 attempts (2 seconds) to avoid long hangs
        if (waitCount > 20) {
          console.error(`🚨 QUEUE ERROR: ${teamMember.name} waited too long! Breaking wait loop.`);
          break;
        }
      }
      
      // Start speaking - EXACT COPY
      console.log(`🚀 QUEUE DEBUG: ${teamMember.name} now taking turn to speak`);
      setCurrentSpeaking(teamMember.name);
      
      // Small delay to ensure state update is processed
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Create message - EXACT COPY
      const message: MeetingMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      speaker: teamMember.name,
      content: text,
      timestamp: new Date().toISOString(),
      role: teamMember.role,
        stakeholderId: teamMember.id
    };

    setTranscript(prev => {
      console.log('📋 Adding message to transcript. Current length:', prev.length);
      return [...prev, message];
    });
    
    // Check for coaching points - show automatically but non-intrusively
    // Extract trial ID from story ID (e.g., 'trial-1-story-1' -> 'trial-1')
    const trialId = selectedStoryId ? selectedStoryId.split('-').slice(0, 2).join('-') : 'trial-1';
    const coaching = getCoachingForSegment(audioId || '', trialId);
    if (coaching && shouldShowCoaching(text, coaching, text)) {
      setCoachingHistory(prev => [...prev, coaching]);
      setCurrentCoaching(coaching);
      setHasCoachingAvailable(true);
      setIsCoachingVisible(true); // Show automatically
      console.log('🎓 Coaching point shown:', coaching.title);
      
      // Auto-hide after 12 seconds to give more time to read
      setTimeout(() => {
        setIsCoachingVisible(false);
      }, 12000);
    }
    
      // Play audio - with immediate exit support on end
    console.log('🎵 Attempting to play audio for:', teamMember.name);
      const cleanText = cleanMarkdownForTTS(text);
      
      // Check for pre-generated audio first
      if (audioId && hasPreGeneratedAudio(audioId)) {
        console.log('✅ Using pre-generated audio:', audioId);
        if (!isMeetingActive || meetingCancelledRef.current) {
          console.log(`🚫 Meeting inactive or cancelled, skipping audio for ${teamMember.name}`);
        } else {
          try {
            await playPreGeneratedAudio(audioId);
            console.log('🎵 Pre-generated audio completed for:', audioId);
          } catch (error) {
            console.error('❌ Pre-generated audio failed, falling back to ElevenLabs:', error);
            if (!meetingCancelledRef.current) {
              await playMessageAudio(message.id, cleanText, teamMember, true);
            }
          }
        }
      } else {
        console.log('🎵 Using ElevenLabs TTS (pre-generated audio not available for:', audioId);
        if (!isMeetingActive || meetingCancelledRef.current) {
          console.log(`🚫 Meeting inactive or cancelled, skipping audio for ${teamMember.name}`);
        } else {
          await playMessageAudio(message.id, cleanText, teamMember, true);
        }
      }
      
      // Finish speaking - EXACT COPY
      console.log(`🚀 QUEUE DEBUG: ${teamMember.name} finished speaking, clearing currentSpeaking`);
      setCurrentSpeaking(null);
      setConversationQueue(prev => {
        const newQueue = prev.filter(id => id !== teamMember.id);
        console.log(`🚀 QUEUE DEBUG: ${teamMember.name} removed from queue. New queue: [${newQueue.join(', ')}]`);
        return newQueue;
      });
      
    } catch (error) {
      console.error(`🚨 QUEUE ERROR: Error in ${teamMember.name} response:`, error);
      
      // Clean up conversation state on error - EXACT COPY
      console.log(`🚀 QUEUE DEBUG: ${teamMember.name} error cleanup - clearing currentSpeaking`);
      setCurrentSpeaking(null);
      setConversationQueue(prev => {
        const newQueue = prev.filter(id => id !== teamMember.id);
        console.log(`🚀 QUEUE DEBUG: ${teamMember.name} error cleanup - removed from queue. New queue: [${newQueue.join(', ')}]`);
        return newQueue;
      });
    }
  };

  // Coaching control functions
  const handlePauseMeeting = () => {
    setIsMeetingPaused(true);
    // Pause current audio if playing
    if (currentAudio) {
      currentAudio.pause();
    }
    console.log('⏸️ Meeting paused for coaching reading');
  };

  const handleResumeMeeting = () => {
    setIsMeetingPaused(false);
    setIsCoachingVisible(false);
    setCurrentCoaching(null);
    // Resume audio if it was playing
    if (currentAudio && currentAudio.paused) {
      currentAudio.play();
    }
    console.log('▶️ Meeting resumed');
  };

  const handleCloseCoaching = () => {
    setIsCoachingVisible(false);
    setCurrentCoaching(null);
  };

  const handleShowCoaching = () => {
    if (currentCoaching) {
      setIsCoachingVisible(true);
      console.log('🎓 Showing coaching:', currentCoaching.title);
    }
  };

  const handleRestartMeeting = () => {
    // Reset cancellation flag
    meetingCancelledRef.current = false;
    
    // Reset all meeting state
    setMeetingStarted(false);
    setTranscript([]);
    setCurrentSpeaking(null);
    setConversationQueue([]);
    setIsAudioPlaying(false);
    setCurrentCoaching(null);
    setIsCoachingVisible(false);
    setIsMeetingPaused(false);
    setHasCoachingAvailable(false);
    
    // Stop any playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    
    console.log('🔄 Meeting restarted');
  };

  const handleCloseMeeting = () => {
    // Set cancellation flag immediately to stop all ongoing operations
    meetingCancelledRef.current = true;
    
    // Clean up meeting state when user navigates away
    setIsMeetingActive(false);
    setMeetingStarted(false);
    setCurrentSpeaking(null);
    setConversationQueue([]);
    setIsAudioPlaying(false);
    setCurrentCoaching(null);
    setIsCoachingVisible(false);
    setIsMeetingPaused(false);
    setHasCoachingAvailable(false);
    
    // Stop any playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    
    console.log('🚪 Meeting closed and cleaned up');
    onClose();
  };

  // Handle meeting start
  const startMeeting = async () => {
    // Reset cancellation flag when starting a new meeting
    meetingCancelledRef.current = false;
    setMeetingStarted(true);
    
    // Don't automatically move story or open it - let Scrum Master control the flow
    console.log('📋 Meeting started - waiting for Scrum Master to begin');
    
    // Ensure audio is enabled for the meeting
    if (!globalAudioEnabled) {
      setGlobalAudioEnabled(true);
    }
    
    // Start the meeting flow immediately - no setTimeout orchestration
    console.log('🎬 Starting refinement meeting...');
    
    // First, Scrum Master opens the meeting and asks BA to present
    const currentStory = initialStories[0];
    const baForStory = getBusinessAnalystMember(currentStory?.title);
    console.log('🔍 DEBUG: Current story title:', currentStory?.title);
    console.log('🔍 DEBUG: BA for story:', baForStory.name, baForStory.id);
    console.log('🔍 DEBUG: Is password reset story?', isPasswordResetStory(currentStory?.title));
    const greetingMessage = `Good morning everyone. We have ${initialStories.length} ${initialStories.length === 1 ? 'story' : 'stories'} to review today. ${baForStory.name}, could you please present the first story for us?`;
      await addAIMessage(
        teamMembers[0], // Sarah (Scrum Master)
      greetingMessage,
      isPasswordResetStory(currentStory?.title) ? 'sarah-opening-2' : 'sarah-opening'
    );
    
    // Then BA presents the story (only if meeting is still active)
    if (!isMeetingActive || meetingCancelledRef.current) {
      console.log('🚫 Meeting no longer active or cancelled, skipping BA presentation');
      return;
    }

        // Clean markdown formatting from the story content
        const cleanTitle = cleanMarkdownForTTS(currentStory.title);
        const cleanDescription = cleanMarkdownForTTS(currentStory.description);
        const cleanAcceptanceCriteria = cleanMarkdownForTTS(currentStory.acceptanceCriteria || '');
        
        // Move story to "Currently Discussing" when BA starts presenting
        const firstStoryId = initialStories[0].id;
        setKanbanColumns(prev => ({
          ...prev,
          'ready': {
            ...prev.ready,
            stories: prev.ready.stories.filter(id => id !== firstStoryId)
          },
          'discussing': {
            ...prev.discussing,
            stories: [...prev.discussing.stories, firstStoryId]
          }
        }));
        setSelectedStoryId(firstStoryId);
        console.log('📋 Story moved to "Currently Discussing" as BA presents');

        // BA Presentation: do not inject a static user story line; read description (which may include a User Story section), then AC once
        // Conversational BA presentation without field labels; read description (which embeds the user story) and AC once
        const baPresentation = isPasswordResetStory(currentStory.title)
          ? `Thanks Sarah. This one's about the password reset flow. Right now, customers see an on‑screen success but don't get a follow‑up email. We want to send a confirmation email after a successful reset so customers know their account was updated and can spot anything suspicious. The user story is: As a customer, I want to receive a confirmation email after resetting my password so that I know my account has been updated successfully and can spot any suspicious activity.

Here's what needs to be true:
${cleanAcceptanceCriteria.replace(/contact support if it wasn't them\./g, 'contact support if it wasn\'t them.')}`
          : `Thanks Sarah. Let me walk through this quickly. ${cleanDescription}

Here’s what needs to be true:
${cleanAcceptanceCriteria}`;
        
        // Find BA team member (assuming it's the user, but we need a BA team member)
        const baMember = getBusinessAnalystMember(currentStory.title);
        
        // Open the story for viewing when BA starts speaking
        setEditingStory({ ...currentStory });
        setIsEditingStory(true);
        setIsViewingStory(true); // Mark as viewing mode (read-only)
        console.log('📋 Story opened for viewing as BA starts presenting');
        
        await addAIMessage(baMember, baPresentation, isPasswordResetStory(currentStory.title) ? 'victor-presentation-2' : 'bola-presentation');
        
        // Auto-scroll the story content as BA reads
        if (storyContentRef.current) {
          storyContentRef.current.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          
          // Scroll through the content as BA reads
          setTimeout(() => {
            if (storyContentRef.current) {
              storyContentRef.current.scrollTo({
                top: storyContentRef.current.scrollHeight / 3,
                behavior: 'smooth'
              });
            }
          }, 2000);
          
          setTimeout(() => {
            if (storyContentRef.current) {
              storyContentRef.current.scrollTo({
                top: storyContentRef.current.scrollHeight,
                behavior: 'smooth'
              });
            }
          }, 4000);
        }
        
        // Branch meeting flow based on story
        // Let the turn-taking system handle the conversation naturally; no external orchestration
        if (!isMeetingActive || meetingCancelledRef.current) return;

        const srikanth = displayTeamMembers.find(m => m.name === 'Srikanth');
        const lisa = displayTeamMembers.find(m => m.name === 'Lisa');
        const tom = displayTeamMembers.find(m => m.name === 'Tom');
        const sarah = displayTeamMembers.find(m => m.name === 'Sarah');
        const baMember2 = getBusinessAnalystMember(currentStory.title);

        if (isPasswordResetStory(currentStory.title)) {
          // Trial 2: Password Reset Confirmation Email
          await new Promise(r => setTimeout(r, 300));
          if (srikanth) await addAIMessage(srikanth, "Just to check, Victor — this only triggers after a successful password change, right? Not after a failed attempt?", 'srikanth-check-2');

          await new Promise(r => setTimeout(r, 250));
          await addAIMessage(baMember2, "That’s right, only when the reset has been completed successfully.", 'victor-confirm-2');

          await new Promise(r => setTimeout(r, 300));
          if (lisa) await addAIMessage(lisa, "Okay. We can plug into our existing email service. We’ll just need a new template. Do we already have wording for that?", 'lisa-email-2');

          // Brief typing indicator phase for Victor drafting template
          console.log('⌨️ Victor is typing the email template...');
          await new Promise(r => setTimeout(r, 400));
          await addAIMessage(baMember2, "Yes — subject’s ‘Your Password Has Been Reset’, and the body confirms the change and asks customers to contact support if it wasn’t them.", 'victor-template-2');

          await new Promise(r => setTimeout(r, 300));
          if (tom) await addAIMessage(tom, "I’ll need to verify a few things: Email is only sent on successful reset. Subject and body match the template. No password data is exposed. Email goes to the registered address. Do we also need a log entry to show support that the email was sent?", 'tom-tests-2');

          await new Promise(r => setTimeout(r, 250));
          await addAIMessage(baMember2, "Yes, good point — a log entry should be created. Let’s add that as a note.", 'victor-log-2');

          await new Promise(r => setTimeout(r, 300));
          if (lisa) await addAIMessage(lisa, "If the email fails to send, should we retry or just log it?", 'lisa-retry-ask-2');

          await new Promise(r => setTimeout(r, 250));
          if (srikanth) await addAIMessage(srikanth, "Let’s retry once, then log. That keeps it consistent with our other emails.", 'srikanth-retry-2');

          await new Promise(r => setTimeout(r, 400));
          if (sarah) await addAIMessage(sarah, "Great, seems we’ve clarified the story. Let’s size it. Remember, effort not hours. Ready? 3…2…1 — show.", 'sarah-size-2');

          await new Promise(r => setTimeout(r, 500));
          if (srikanth) await addAIMessage(srikanth, "2 points.", 'srikanth-2pts-2');
          await new Promise(r => setTimeout(r, 300));
          if (lisa) await addAIMessage(lisa, "2 points as well.", 'lisa-2pts-2');
          await new Promise(r => setTimeout(r, 300));
          if (tom) await addAIMessage(tom, "2 points.", 'tom-2pts-2');

          await new Promise(r => setTimeout(r, 700));
          if (sarah) await addAIMessage(sarah, "Perfect, consensus at 2 points. This story is refined and ready for Sprint Planning.", 'sarah-conclude-2');
          
          // Mark story points as agreed for Trial 2
          setStoryPointsAgreed(prev => ({ ...prev, [initialStories[0].id]: true }));
        } else {
          // Trial 1 (existing) flow
          await new Promise(resolve => setTimeout(resolve, 1000));
          const srikanthResponse = "Thanks Bola, that's clear. Just one quick question - when you say 'one or more files', is there a maximum number of files a tenant can upload per request?";
          if (srikanth) await addAIMessage(srikanth, srikanthResponse, 'srikanth-question');

          await new Promise(resolve => setTimeout(resolve, 1000));
          const baResponse = "Good question Srikanth. Yes, users should be able to upload multiple files at once - up to 5 attachments per maintenance request. So a tenant could upload, for example, 3 photos of the issue, a PDF document with additional details, and a video showing the problem. This gives them flexibility to provide comprehensive evidence for their maintenance request.";
          await addAIMessage(baMember2, baResponse, 'bola-answer');

          await new Promise(resolve => setTimeout(resolve, 1000));
          const srikanthResponse2 = "OK Bola, that's clear. it means you will need to include PDF in your acceptance criteria";
          if (srikanth) await addAIMessage(srikanth, srikanthResponse2, 'srikanth-question-2');

          await new Promise(resolve => setTimeout(resolve, 1000));
          const baResponse2 = "Good should Srikanth, I will update the acceptance criteria to include PDF, thanks for that";
          await addAIMessage(baMember2, baResponse2, 'bola-answer-2');

          await new Promise(resolve => setTimeout(resolve, 1000));
          const lisaResponse = "Got it, thanks Bola. Srikanth, for the technical implementation, I'm thinking we can reuse our existing file upload component. We'll need to add the file type validation and size checking on the frontend before upload.";
          if (lisa) await addAIMessage(lisa, lisaResponse, 'lisa-technical');

          await new Promise(resolve => setTimeout(resolve, 1000));
          const srikanthResponse3 = "Good point Lisa. For the backend, we can store these in our existing S3 bucket. We'll need to implement proper error handling for failed uploads and maybe add a retry mechanism. The 5MB limit should be fine for images.";
          if (srikanth) await addAIMessage(srikanth, srikanthResponse3, 'srikanth-response');

          await new Promise(resolve => setTimeout(resolve, 1000));
          const tomResponse = "From a testing perspective, we'll need to test all the edge cases - corrupted files, oversized files, wrong file types. I'll create test cases for the error messages to make sure they're user-friendly.";
          if (tom) await addAIMessage(tom, tomResponse, 'tom-testing');

          await new Promise(resolve => setTimeout(resolve, 1000));
          const sarahResponse = "Great discussion team. Based on what I'm hearing, this feels like a solid 5-point story. Srikanth, as our senior developer, do you agree with that estimate?";
          if (sarah) await addAIMessage(sarah, sarahResponse, 'sarah-sizing');

          await new Promise(resolve => setTimeout(resolve, 1000));
          const srikanthResponse4 = "Yes, I agree with 5 points. The file upload functionality is straightforward, and we can reuse existing components. The main work will be in the validation logic and error handling, but that's manageable.";
          if (srikanth) await addAIMessage(srikanth, srikanthResponse4, 'srikanth-confirm');

          await new Promise(resolve => setTimeout(resolve, 1000));
          const sarahResponse2 = "Perfect! Story estimated at 5 points. I'll mark this as refined and move it to our refined backlog. Great work everyone, this story is ready for sprint planning.";
          if (sarah) await addAIMessage(sarah, sarahResponse2, 'sarah-conclude');
          
          // Mark story points as agreed for Trial 1
          setStoryPointsAgreed(prev => ({ ...prev, [initialStories[0].id]: true }));
        }
    
    // Move story to "Refined" column
    if (initialStories.length > 0) {
      const firstStoryId = initialStories[0].id;
      setKanbanColumns(prev => ({
        ...prev,
        'discussing': {
          ...prev.discussing,
          stories: prev.discussing.stories.filter(id => id !== firstStoryId)
        },
        'refined': {
          ...prev.refined,
          stories: [...prev.refined.stories, firstStoryId]
        }
      }));
      console.log('📋 Story moved to "Refined"');
    }
    
    // Conclude politely if this is the end
    if (sarah) {
      const goodbye = isPasswordResetStory(initialStories[0]?.title)
        ? 'Thanks everyone, that wraps up this item. Great work – we’ll see you in Sprint Planning.'
        : 'Great work team. That concludes refinement for this story.';
      await addAIMessage(sarah, goodbye, 'sarah-goodbye');
    }
    
  };

  // Generate dynamic AI response (using voice-only meeting pattern)
  const generateAIResponse = async (userMessage: string) => {
    // Check if meeting is still active or cancelled
    if (!isMeetingActive || meetingCancelledRef.current) {
      console.log('🚫 Meeting no longer active or cancelled, skipping AI response generation');
      return;
    }

    // Use the same dynamic AI service as voice-only meeting
    const dynamicAIService = AIService.getInstance();
    
    try {
      console.log('🤖 Generating dynamic AI response for:', userMessage);
      
      // Convert team members to stakeholder format for AIService
      const availableTeamMembers = teamMembers.map(member => ({
        name: member.name,
        role: member.role,
        department: 'Engineering',
        priorities: [`${member.role} responsibilities`, 'Story refinement', 'Quality delivery'],
        personality: member.personality || 'Professional and collaborative',
        expertise: [member.role.toLowerCase(), 'agile', 'software development']
      }));

      // Detect who should respond (like voice-only meeting)
      const mentionResult = await dynamicAIService.detectStakeholderMentions(userMessage, availableTeamMembers, 'refinement_discussion');
      
      let responder;
      if (mentionResult.mentionedStakeholders.length > 0 && mentionResult.confidence >= AIService.getMentionConfidenceThreshold()) {
        // Someone was specifically mentioned
        responder = mentionResult.mentionedStakeholders[0];
        console.log('🎯 Specific team member mentioned:', responder.name);
      } else {
        // Smart context-based selection
        const currentStory = stories.find(s => kanbanColumns.discussing.stories.includes(s.id)) || stories[0];
        
        // Context-based selection logic
        if (userMessage.toLowerCase().includes('test') || userMessage.toLowerCase().includes('quality')) {
          responder = availableTeamMembers.find(m => m.role === 'QA Tester') || availableTeamMembers[2];
        } else if (userMessage.toLowerCase().includes('technical') || userMessage.toLowerCase().includes('develop')) {
          responder = availableTeamMembers.find(m => m.role === 'Developer') || availableTeamMembers[1];
        } else if (userMessage.toLowerCase().includes('process') || userMessage.toLowerCase().includes('sprint')) {
          responder = availableTeamMembers.find(m => m.role === 'Scrum Master') || availableTeamMembers[0];
        } else {
          // Round-robin or random selection
          const randomIndex = Math.floor(Math.random() * availableTeamMembers.length);
          responder = availableTeamMembers[randomIndex];
        }
        console.log('🎲 Context-based selection:', responder.name, 'for message about:', userMessage.substring(0, 50));
      }

      if (responder) {
        // Create conversation context (like voice-only meeting)
        const conversationContext = {
          project: {
            name: 'Story Refinement Session',
            description: 'Agile story refinement and planning session',
            type: 'Refinement Meeting'
          },
          conversationHistory: transcript,
          stakeholders: availableTeamMembers,
          currentContext: {
            currentStory: stories.find(s => kanbanColumns.discussing.stories.includes(s.id)),
            storiesInDiscussion: kanbanColumns.discussing.stories,
            totalStories: stories.length,
            refinedStories: kanbanColumns.refined.stories.length
          }
        };

        // Generate dynamic response using AIService (like voice-only meeting)
        const response = await dynamicAIService.generateStakeholderResponse(
          userMessage,
          responder,
          conversationContext
        );
        
        // Find the corresponding team member for audio
        const teamMember = teamMembers.find(m => m.name === responder.name) || teamMembers[0];
        await addAIMessage(teamMember, response);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback to AI-generated response
      const fallbackMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];
      const fallbackResponse = await dynamicAIService.generateStakeholderResponse(
        "Continue with story refinement",
        {
          name: fallbackMember.name,
          role: fallbackMember.role,
          department: 'Engineering',
          priorities: ['Story refinement', 'Quality delivery'],
          personality: fallbackMember.personality || 'Professional',
          expertise: [fallbackMember.role.toLowerCase()]
        },
        { project: { name: 'Story Refinement Session' } }
      );
      await addAIMessage(fallbackMember, fallbackResponse);
    }
  };

  // Voice Input (reused from voice meeting)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: getSupportedAudioFormat()
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceInput = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    console.log('🎤 Voice input received, audio blob size:', audioBlob.size);
    
    try {
      const transcribedText = await transcribeAudio(audioBlob);
      console.log('🎤 Transcription result:', transcribedText);
      
      if (transcribedText && transcribedText.trim()) {
        console.log('✅ Setting transcribed text to input field:', transcribedText);
        // First populate the input field (like voice-only meeting)
        setUserInput(transcribedText);
        
        // Wait a moment for user to see the transcribed text
        setTimeout(async () => {
          console.log('📤 Auto-sending transcribed message');
          await handleSendMessage(transcribedText);
        }, 1000); // Increased to 1 second so user can see the text
      } else {
        console.warn('❌ No transcription received or transcription was empty');
        setUserInput(''); // Clear input if transcription failed
      }
    } catch (error) {
      console.error('❌ Error transcribing audio:', error);
      // Show user-friendly error
      setUserInput(''); // Clear input on error
      if (error instanceof Error && error.message?.includes('VITE_OPENAI_API_KEY')) {
        console.error('💡 Hint: Add VITE_OPENAI_API_KEY to .env file for voice transcription');
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  // Send message (voice or text)
  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || userInput;
    if (!text.trim()) return;

    // Stop any current AI audio
    stopCurrentAudio();

    // Add user message
    const userMessage: MeetingMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      speaker: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      role: 'user',
      stakeholderId: 'user'
    };

    setTranscript(prev => [...prev, userMessage]);
    setUserInput('');

    // Generate AI response
    setTimeout(() => {
      generateAIResponse(text);
    }, 1000);
  };

  // Story card editing (Jira-style)
  const openStoryEditor = (story: AgileTicket) => {
    setEditingStory({ ...story });
    setIsEditingStory(true);
    setSelectedStoryId(story.id);
  };

  const saveStoryChanges = () => {
    if (!editingStory) return;
    
    setStories(prev => prev.map(s => 
      s.id === editingStory.id ? editingStory : s
    ));
    setIsEditingStory(false);
    setEditingStory(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, storyId: string) => {
    e.dataTransfer.setData('text/plain', storyId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const storyId = e.dataTransfer.getData('text/plain');
    
    setKanbanColumns(prev => {
      const newColumns = { ...prev };
      
      // Remove from all columns
      (Object.keys(newColumns) as Array<keyof typeof newColumns>).forEach(columnId => {
        newColumns[columnId].stories = newColumns[columnId].stories.filter(id => id !== storyId);
      });
      
      // Add to target column
      const targetColumn = newColumns[targetColumnId as keyof typeof newColumns];
      if (targetColumn) {
        targetColumn.stories.push(storyId);
      }
      
      return newColumns;
    });

    // Update story status - Auto change to 'Refined' when moved to refined column
    const statusMap: Record<string, string> = {
      'ready': 'Ready for Refinement',
      'discussing': 'Ready for Refinement', // Still in refinement
      'refined': 'Refined' // Auto change to Refined status
    };
    
    setStories(prev => prev.map(s => 
      s.id === storyId 
        ? { ...s, status: statusMap[targetColumnId] as any }
        : s
    ));
  };

  // End meeting
  const handleEndMeeting = async () => {
    console.log('🔚 END MEETING BUTTON CLICKED!');
    // IMMEDIATELY stop all audio and reset meeting state
    meetingCancelledRef.current = true;
    setIsMeetingActive(false);

    // Stop any current audio first
    stopCurrentAudio();
    stopAllAudio();
    
    // Clear conversation queue and speaking state
    setConversationQueue([]);
    setCurrentSpeaking(null);

    // End immediately without waiting on AI summary generation
    // (We can compute summary later in background if needed)
      onMeetingEnd({
        transcript,
        refinedStories: stories.filter(s => kanbanColumns.refined.stories.includes(s.id)),
        duration: Date.now() - meetingStartTime
      });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col z-50 overflow-hidden">
      {/* Header with Navigation - Dark mode like voice meetings */}
      <div className="bg-black border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCloseMeeting}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
          >
            <ArrowLeft size={20} />
            <span>Back to Backlog Refinement Simulation</span>
          </button>
          
          <div className="flex items-center space-x-3">
            {meetingStarted ? (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-white">Refinement Meeting - Live</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-white">Refinement Meeting - Ready to Start</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm">Browser TTS</span>
            </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCloseMeeting}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      {/* Main Meeting Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Kanban Board */}
        <div className="flex-1 bg-gray-50 text-gray-900 p-6 overflow-auto border-r border-gray-200">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Story Refinement Board
              </h2>
              
              {/* Start Meeting Button - Visible with kanban board */}
              {!meetingStarted && (
                <button
                  onClick={startMeeting}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg"
                >
                  <Play size={20} />
                  <span>Start Meeting</span>
                </button>
              )}
            </div>
            
            {/* Kanban Columns */}
            <div className="flex-1 grid grid-cols-3 gap-4">
              {Object.values(kanbanColumns).map(column => (
                <div 
                  key={column.id} 
                  className="bg-gray-100 rounded-lg p-4 h-full border border-gray-200 shadow-sm"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                      {column.title}
                    </h3>
                    <span className="bg-gray-300 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">
                      {column.stories.length}
                    </span>
                  </div>
                  
                  <div className="space-y-2 h-full overflow-y-auto">
                    {column.stories.map(storyId => {
                      const story = stories.find(s => s.id === storyId);
                      if (!story) return null;
                      
                      const isSelected = selectedStoryId === storyId;
                      
                      return (
                        <div 
                          key={storyId}
                          draggable
                          onDragStart={(e) => handleDragStart(e, storyId)}
                          onClick={() => openStoryEditor(story)}
                          className={`group p-3 rounded-xl border cursor-pointer transition-all bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                            isSelected
                              ? 'border-blue-500 ring-2 ring-blue-100'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* Meta row */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                              <GripVertical size={12} className="text-gray-300 group-hover:text-gray-400" />
                              <span>{story.ticketNumber}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {story.storyPoints != null && storyPointsAgreed[story.id] && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                                  {story.storyPoints} pts
                                </span>
                              )}
                              <span className={`w-2 h-2 rounded-full ${
                                story.priority === 'High' ? 'bg-red-500' : story.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`} title={`Priority: ${story.priority}`}></span>
                            </div>
                          </div>
                          
                          {/* Title */}
                          <h4 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
                            {story.title}
                          </h4>
                          
                          {/* Subtext */}
                            {story.description && (
                            <p className="text-[11px] text-gray-500 line-clamp-2">
                              {story.description}
                              </p>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
                        </div>
          </div>
        </div>

        {/* Right Side - Participants Panel */}
        <div className="w-96 bg-gray-900 border-l border-gray-700 flex flex-col overflow-hidden">
          {/* Participants Header */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-medium text-white mb-2">Meeting Participants</h3>
            <div className="text-sm text-gray-400">{teamMembers.length + 1} people in this meeting</div>
          </div>

                    {/* Participant Video Grid (3 grids: 2+2+1 Layout) - Now Bigger */}
          <div className="flex-1 p-6">
            {/* Proper 2x3 grid layout for 6 participants */}
            <div className="grid grid-cols-3 grid-rows-2 gap-4 h-full">
              {/* Row 1: Sarah, Victor, Srikanth */}
              <ParticipantCard
                participant={displayTeamMembers.find(m => m.name === 'Sarah') || displayTeamMembers[0]}
                isCurrentSpeaker={currentSpeaking === 'Sarah' || currentSpeaking === 'sarah'}
                isUser={false}
              />
              <ParticipantCard
                participant={displayTeamMembers.find(m => m.name === 'Victor') || displayTeamMembers.find(m => m.name === 'Bola') || displayTeamMembers[1]}
                isCurrentSpeaker={currentSpeaking === 'Victor' || currentSpeaking === 'Bola' || currentSpeaking === 'victor' || currentSpeaking === 'bola'}
                isUser={false}
              />
              <ParticipantCard
                participant={displayTeamMembers.find(m => m.name === 'Srikanth') || displayTeamMembers[2]}
                isCurrentSpeaker={currentSpeaking === 'Srikanth' || currentSpeaking === 'srikanth'}
                isUser={false}
              />
              
              {/* Row 2: Lisa, Tom, User */}
              <ParticipantCard
                participant={displayTeamMembers.find(m => m.name === 'Lisa') || displayTeamMembers[3]}
                isCurrentSpeaker={currentSpeaking === 'Lisa' || currentSpeaking === 'lisa'}
                isUser={false}
              />
              <ParticipantCard
                participant={displayTeamMembers.find(m => m.name === 'Tom') || displayTeamMembers[4]}
                isCurrentSpeaker={currentSpeaking === 'Tom' || currentSpeaking === 'tom'}
                isUser={false}
              />
              <ParticipantCard
                participant={{ name: user?.full_name || 'You' }}
                isCurrentSpeaker={false}
                isUser={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Controls - Voice-Only Style */}
      {meetingStarted && (
        <div className="px-6 py-3 bg-gray-900 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            {/* Mic Button */}
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isRecording 
                  ? 'bg-purple-600 hover:bg-purple-700 animate-pulse shadow-lg shadow-purple-500/50' 
                  : isTranscribing
                  ? 'bg-blue-500 hover:bg-blue-600 animate-pulse'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isRecording ? 'Release to Send' : isTranscribing ? 'Processing...' : 'Hold to Record'}
            >
              {isRecording ? <Square className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
            </button>

            {/* Transcribe Toggle Button */}
            <button
              onClick={() => setTranscriptPanelOpen(!transcriptPanelOpen)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                transcriptPanelOpen
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={transcriptPanelOpen ? 'Hide Transcript' : 'Show Transcript'}
            >
              <FileText className="w-4 h-4 text-white" />
            </button>

            {/* Audio Toggle Button */}
            <button
              onClick={() => setGlobalAudioEnabled(!globalAudioEnabled)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                globalAudioEnabled
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              title={globalAudioEnabled ? 'Disable Audio' : 'Enable Audio'}
            >
              {globalAudioEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-white" />}
            </button>

            {/* End Meeting Button */}
            <button
              onClick={handleEndMeeting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <PhoneOff size={16} />
              <span className="text-sm">End</span>
            </button>
          </div>
        </div>
      )}

      {/* Message Input Area - Matches Kanban Board Width */}
      <div className="flex relative">
        {/* Left Side - Input Area (matches kanban board width) */}
        <div className="flex-1 px-6 py-4 bg-gray-900 border-t border-gray-700 relative">
          {/* Dynamic Feedback Display */}
          {meetingStarted && (isRecording || isTranscribing) && (
            <div className="mb-3 bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-sm rounded-lg px-3 py-2 text-center border border-purple-500/30 shadow-lg">
              <span className="text-white text-sm font-medium">
                {isRecording ? '🎤 Recording your message... Release to send' : 
                 isTranscribing ? '🔄 Processing and transcribing your message...' : ''}
              </span>
            </div>
          )}
          
          <div className="flex space-x-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message"
              disabled={!meetingStarted}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-400 disabled:opacity-50"
            />
            
            {/* Speak Button - Voice-Only Style */}
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={!meetingStarted}
              className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording 
                  ? 'bg-purple-600 hover:bg-purple-700 animate-pulse shadow-lg shadow-purple-500/50' 
                  : isTranscribing
                  ? 'bg-blue-500 hover:bg-blue-600 animate-pulse'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isRecording ? 'Release to Send' : isTranscribing ? 'Processing...' : 'Hold to Record & Send'}
            >
              {isRecording ? <Square className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
            </button>
            
            <button
              onClick={() => handleSendMessage()}
              disabled={!userInput.trim() || !meetingStarted}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Sliding Transcript Panel - Voice-Only Style */}
          {meetingStarted && (
            <>

            {/* Transcript Panel - slides up from text area, matches input width */}
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
                  <span className="text-gray-400 text-xs">({transcript.length})</span>
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
                    onClick={() => setTranscript([])}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                    title="Clear transcript"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Transcript Content */}
              <div className="overflow-y-auto p-3 space-y-2" style={{ height: '80px' }}>
                {transcript.length === 0 ? (
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
                  <>
                    {transcript.map((message) => (
                      <div key={message.id} className="flex space-x-2">
                        <div className="flex-shrink-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            message.role === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-purple-600 text-white'
                          }`}>
                            {message.role === 'user' 
                              ? 'U' 
                              : message.speaker?.charAt(0) || 'A'
                            }
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1 mb-1">
                            <span className="text-white font-medium text-xs">
                              {message.role === 'user' ? 'You' : message.speaker}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-200 text-xs leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={transcriptEndRef} />
                  </>
                )}
              </div>
            </div>
          </>
        )}
        </div>
        
        {/* Right Side Spacer - Matches Participants Panel Width */}
        <div className="w-96 bg-gray-900 border-t border-gray-700"></div>
      </div>

      {/* Jira-Style Story Editor Modal */}
      {isEditingStory && editingStory && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            // Close modal when clicking outside the content area
            if (e.target === e.currentTarget) {
              setIsEditingStory(false);
              setIsViewingStory(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto text-gray-900" 
            ref={storyContentRef}
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {isViewingStory ? 'Story Details' : 'Edit Story'}
                </h2>
                {isViewingStory && (
                  <p className="text-sm text-gray-500 mt-1">
                    Click outside or press ESC to close and access meeting controls
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setIsEditingStory(false);
                  setIsViewingStory(false);
                }}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={editingStory.title}
                    onChange={(e) => !isViewingStory && setEditingStory(prev => prev ? { ...prev, title: e.target.value } : null)}
                    readOnly={isViewingStory}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isViewingStory ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editingStory.description}
                    onChange={(e) => !isViewingStory && setEditingStory(prev => prev ? { ...prev, description: e.target.value } : null)}
                    readOnly={isViewingStory}
                    rows={4}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isViewingStory ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Acceptance Criteria</label>
                  <textarea
                    value={editingStory.acceptanceCriteria || ''}
                    onChange={(e) => setEditingStory(prev => prev ? { ...prev, acceptanceCriteria: e.target.value } : null)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Given... When... Then..."
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ticket Number</label>
                  <input
                    type="text"
                    value={editingStory.ticketNumber}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={editingStory.type}
                    onChange={(e) => setEditingStory(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Story">Story</option>
                    <option value="Task">Task</option>
                    <option value="Bug">Bug</option>
                    <option value="Spike">Spike</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={editingStory.priority}
                    onChange={(e) => setEditingStory(prev => prev ? { ...prev, priority: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {storyPointsAgreed[editingStory.id] && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Story Points</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingStory.storyPoints || ''}
                      onChange={(e) => setEditingStory(prev => prev ? { ...prev, storyPoints: e.target.value ? parseInt(e.target.value) : undefined } : null)}
                      placeholder="Enter story points"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={editingStory.status}
                    onChange={(e) => setEditingStory(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Ready for Refinement">Ready for Refinement</option>
                    <option value="Refined">Refined</option>
                    <option value="In Sprint">In Sprint</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Test">In Test</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setIsEditingStory(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveStoryChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coaching Overlay */}
      {currentCoaching && (
        <CoachingOverlay
          coaching={currentCoaching}
          onClose={handleCloseCoaching}
          isVisible={isCoachingVisible}
        />
      )}

      {/* Meeting Controls */}
      {meetingStarted && (
        <MeetingControls
          isPlaying={isAudioPlaying}
          isPaused={isMeetingPaused}
          onPlay={handleResumeMeeting}
          onPause={handlePauseMeeting}
          onRestart={handleRestartMeeting}
          hasCoaching={hasCoachingAvailable}
        />
      )}
    </div>
  );
};