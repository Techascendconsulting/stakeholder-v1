import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, Send, Users, Clock, Volume2, Play, Pause, Square, Phone, PhoneOff, Settings, MoreVertical, ChevronDown, ChevronUp, X, Edit3, Save, Trash2, Plus, GripVertical, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useVoice } from '../../contexts/VoiceContext';
import { Message } from '../../types';
import { isConfigured as elevenConfigured, synthesizeToBlob, playBlob } from '../../services/elevenLabsTTS';
import { playBrowserTTS } from '../../lib/browserTTS';
import { transcribeAudio, getSupportedAudioFormat } from '../../lib/whisper';
import AIService from '../../services/aiService';
import AgileRefinementService, { AgileTeamMemberContext } from '../../services/agileRefinementService';
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
  const { user } = useAuth();
  
  return (
    <div className="relative bg-gray-800 rounded-xl overflow-hidden group hover:bg-gray-750 transition-colors border border-gray-700 w-full h-40">
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
            <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600">
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
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: getAvatarColor(participant.name).replace('bg-', '#').replace('-500', '') }}>
          <span className="text-white text-lg font-bold">
            {getInitials(participant.name)}
          </span>
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
  const { user } = useAuth();
  const { globalAudioEnabled, setGlobalAudioEnabled } = useVoice();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Meeting state (reusing voice meeting patterns)
  const [stories, setStories] = useState<AgileTicket[]>(initialStories);
  const [meetingStartTime] = useState<number>(Date.now());
  const [transcript, setTranscript] = useState<Message[]>([]);
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
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioStates, setAudioStates] = useState<Record<string, string>>({});
  const [isMeetingActive, setIsMeetingActive] = useState(true);
  
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
  
  // Kanban columns state with drag-and-drop
  const [kanbanColumns, setKanbanColumns] = useState({
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

  // AI Refinement Service
  const aiService = AgileRefinementService.getInstance();
  const teamMembers = aiService.getTeamMembers();

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

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

    try {
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
      console.log('🔧 ElevenLabs TTS Available:', elevenConfigured());
      
      if (elevenConfigured()) {
          console.log('✅ Using ElevenLabs TTS for audio synthesis');
          const audioBlob = await synthesizeToBlob(text, { 
            stakeholderName: teamMember.name,
            voiceId: teamMember.voiceId 
          });
          
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
        }
      } else {
        console.log('⚠️ ElevenLabs TTS not available, skipping audio playback');
        setIsAudioPlaying(false);
        // Still show visual feedback that someone is "speaking"
        setTimeout(() => {
          console.log(`📝 ${teamMember.name} finished speaking (text-only mode)`);
        }, 2000); // Show speaker for 2 seconds
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
  const addAIMessage = async (teamMember: AgileTeamMemberContext, text: string) => {
    console.log(`🚀 QUEUE DEBUG: ${teamMember.name} starting addAIMessage`);
    console.log(`🚀 QUEUE DEBUG: Current speaker before: ${currentSpeaking}`);
    console.log(`🚀 QUEUE DEBUG: Current queue before: [${conversationQueue.join(', ')}]`);
    
    try {
      // Add to conversation queue to prevent simultaneous speaking - EXACT COPY
      setConversationQueue(prev => {
        const newQueue = [...prev, teamMember.id];
        console.log(`🚀 QUEUE DEBUG: ${teamMember.name} added to queue. New queue: [${newQueue.join(', ')}]`);
        return newQueue;
      });
      
      // Wait for turn if someone else is speaking - EXACT COPY
      let waitCount = 0;
      while (currentSpeaking !== null && currentSpeaking !== teamMember.id) {
        waitCount++;
        console.log(`🚀 QUEUE DEBUG: ${teamMember.name} waiting (attempt ${waitCount}). Current speaker: ${currentSpeaking}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Safety break after 200 attempts (20 seconds) - increased timeout
        if (waitCount > 200) {
          console.error(`🚨 QUEUE ERROR: ${teamMember.name} waited too long! Breaking wait loop.`);
          break;
        }
      }
      
      // Start speaking - EXACT COPY
      console.log(`🚀 QUEUE DEBUG: ${teamMember.name} now taking turn to speak`);
      setCurrentSpeaking(teamMember.id);
      
      // Small delay to ensure state update is processed
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Create message - EXACT COPY
      const message = {
        id: `msg_${Date.now()}_${Math.random()}`,
        speaker: teamMember.name,
        content: text,
        timestamp: new Date().toISOString(),
        role: teamMember.role,
        stakeholderId: teamMember.name.toLowerCase()
      };

      setTranscript(prev => {
        console.log('📋 Adding message to transcript. Current length:', prev.length);
        return [...prev, message];
      });
      
      // Play audio - EXACT COPY
      console.log('🎵 Attempting to play audio for:', teamMember.name);
      const cleanText = cleanMarkdownForTTS(text);
      await playMessageAudio(message.id, cleanText, teamMember, true);
      
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

  // Handle meeting start
  const startMeeting = async () => {
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
    const greetingMessage = `Good morning everyone. We have ${initialStories.length} ${initialStories.length === 1 ? 'story' : 'stories'} to review today. Bola, could you please present the first story for us?`;
    await addAIMessage(
      teamMembers[0], // Sarah (Scrum Master)
      greetingMessage
    );
    
    // Then BA presents the story (only if meeting is still active)
    if (!isMeetingActive) {
      console.log('🚫 Meeting no longer active, skipping BA presentation');
      return;
    }

        const currentStory = initialStories[0];
        
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

        const baPresentation = `Thank you Sarah. I'd like to present our first story for refinement today. 

Story Title: ${cleanTitle}

Description: ${cleanDescription}

User Story: As a tenant, I want to upload a photo or document related to my maintenance issue, So that the housing team has enough context to understand and resolve the problem more efficiently.

Acceptance Criteria:
${cleanAcceptanceCriteria}`;
        
        // Find BA team member (assuming it's the user, but we need a BA team member)
        const baMember = teamMembers.find(m => m.role === 'Business Analyst') || {
          id: 'bola',
          name: 'Business Analyst',
          role: 'Business Analyst',
          voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID_BOLA || 'en-US-AriaNeural',
          personality: 'Detail-oriented, user-focused',
          focusAreas: ['Requirements clarity', 'User experience', 'Business value'],
          responseStyle: 'Presents requirements clearly and answers questions'
        };
        
        // Open the story for viewing when BA starts speaking
        setEditingStory({ ...currentStory });
        setIsEditingStory(true);
        setIsViewingStory(true); // Mark as viewing mode (read-only)
        console.log('📋 Story opened for viewing as BA starts presenting');
        
        await addAIMessage(baMember, baPresentation);
        
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
        
        // Let the turn-taking system handle the conversation naturally
        // Remove setTimeout orchestration - let addAIMessage handle sequential flow
        if (!isMeetingActive) return;
        
        // Srikanth (Senior Developer) asks a simple clarification question to BA
        const srikanthResponse = "Thanks Bola, that's clear. Just one quick question - when you say 'one or more files', is there a maximum number of files a tenant can upload per request?";
        const srikanth = teamMembers.find(m => m.name === 'Srikanth');
        if (srikanth) {
          await addAIMessage(srikanth, srikanthResponse);
        }
        
        // Lisa (Developer) discusses technical implementation with team
        const lisaResponse = "Got it, thanks Bola. Srikanth, for the technical implementation, I'm thinking we can reuse our existing file upload component. We'll need to add the file type validation and size checking on the frontend before upload.";
        const lisa = teamMembers.find(m => m.name === 'Lisa');
        if (lisa) {
          await addAIMessage(lisa, lisaResponse);
        }
        
        // Srikanth responds to Lisa's technical discussion
        const srikanthResponse2 = "Good point Lisa. For the backend, we can store these in our existing S3 bucket. We'll need to implement proper error handling for failed uploads and maybe add a retry mechanism. The 5MB limit should be fine for images.";
        if (srikanth) {
          await addAIMessage(srikanth, srikanthResponse2);
        }
        
        // Tom (QA Tester) discusses testing approach with team
        const tomResponse = "From a testing perspective, we'll need to test all the edge cases - corrupted files, oversized files, wrong file types. I'll create test cases for the error messages to make sure they're user-friendly.";
        const tom = teamMembers.find(m => m.name === 'Tom');
        if (tom) {
          await addAIMessage(tom, tomResponse);
        }
        
        // Sarah (Scrum Master) facilitates and asks about sizing
        const sarahResponse = "Great discussion team. Based on what I'm hearing, this feels like a solid 5-point story. Srikanth, as our senior developer, do you agree with that estimate?";
        const sarah = teamMembers.find(m => m.name === 'Sarah');
        if (sarah) {
          await addAIMessage(sarah, sarahResponse);
        }
        
        // Srikanth confirms the story point estimate
        const srikanthResponse3 = "Yes, I agree with 5 points. The file upload functionality is straightforward, and we can reuse existing components. The main work will be in the validation logic and error handling, but that's manageable.";
        if (srikanth) {
          await addAIMessage(srikanth, srikanthResponse3);
        }
        
        // Sarah concludes the meeting and says she'll mark it as refined
        const sarahResponse2 = "Perfect! Story estimated at 5 points. I'll mark this as refined and move it to our refined backlog. Great work everyone, this story is ready for sprint planning.";
        
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
        
        if (sarah) {
          await addAIMessage(sarah, sarahResponse2);
        }
        
    // BA responds to the team's questions
    const baFollowUp = "Great questions everyone. Let me address these concerns. For the technical implementation, we can reuse our existing file upload service and add retry logic. The frontend can handle multiple files with a simple drag-and-drop interface. For testing, we'll need to create test files of various sizes and formats. Sarah, you're right about the size - this might be better as two stories: one for basic upload and another for validation and error handling. What do you all think?";
    const baMember2 = teamMembers.find(m => m.role === 'Business Analyst');
    if (baMember2) {
      await addAIMessage(baMember2, baFollowUp);
    }
  };

  // Generate dynamic AI response (using voice-only meeting pattern)
  const generateAIResponse = async (userMessage: string) => {
    // Check if meeting is still active
    if (!isMeetingActive) {
      console.log('🚫 Meeting no longer active, skipping AI response generation');
      return;
    }

    try {
      console.log('🤖 Generating dynamic AI response for:', userMessage);
      
      // Use the same dynamic AI service as voice-only meeting
      const dynamicAIService = AIService.getInstance();
      
      // Convert team members to stakeholder format for AIService
      const availableTeamMembers = teamMembers.map(member => ({
        name: member.name,
        role: member.role,
        department: 'Engineering',
        priorities: [`${member.role} responsibilities`, 'Story refinement', 'Quality delivery'],
        personality: member.personality || 'Professional and collaborative',
        expertise: member.expertise || [member.role.toLowerCase(), 'agile', 'software development']
      }));

      // Detect who should respond (like voice-only meeting)
      const mentionResult = await dynamicAIService.detectStakeholderMentions(userMessage, availableTeamMembers);
      
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
          responder = availableTeamMembers.find(m => m.role === 'Tester') || availableTeamMembers[2];
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
          conversationContext,
          'refinement_discussion'
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
          expertise: fallbackMember.expertise || [fallbackMember.role.toLowerCase()]
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
      if (error.message?.includes('VITE_OPENAI_API_KEY')) {
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
    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      speaker: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      role: 'Business Analyst',
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
      Object.keys(newColumns).forEach(columnId => {
        newColumns[columnId].stories = newColumns[columnId].stories.filter(id => id !== storyId);
      });
      
      // Add to target column
      newColumns[targetColumnId].stories.push(storyId);
      
      return newColumns;
    });

    // Update story status - Auto change to 'Refined' when moved to refined column
    const statusMap = {
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
    // Stop any current audio first
    stopCurrentAudio();
    
    try {
      // Generate meeting summary
      const summary = await aiService.generateRefinementSummary(transcript, stories);
      
      onMeetingEnd({
        transcript,
        summary,
        refinedStories: stories.filter(s => kanbanColumns.refined.stories.includes(s.id)),
        duration: Date.now() - meetingStartTime
      });
    } catch (error) {
      console.error('Error ending meeting:', error);
      onMeetingEnd({
        transcript,
        refinedStories: stories.filter(s => kanbanColumns.refined.stories.includes(s.id)),
        duration: Date.now() - meetingStartTime
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col z-50 overflow-hidden">
      {/* Header with Navigation - Dark mode like voice meetings */}
      <div className="bg-black border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Agile Hub</span>
          </button>
          
          <div className="flex items-center space-x-3">
            {meetingStarted ? (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Refinement Meeting - Live</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium">Refinement Meeting - Ready to Start</span>
              </>
            )}
          </div>
          
          {!elevenConfigured() && (
            <div className="flex items-center space-x-2 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm">Text Only</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
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
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-lg"
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
                          className={`p-2 rounded border cursor-pointer transition-all hover:shadow-sm bg-white h-20 flex flex-col ${
                            isSelected
                              ? 'border-blue-500 shadow-sm ring-1 ring-blue-200'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1">
                              <GripVertical size={12} className="text-gray-400" />
                              <span className="font-medium text-blue-600 text-xs">
                                {story.ticketNumber}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {story.storyPoints && (
                                <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs font-medium">
                                  {story.storyPoints}
                                </span>
                              )}
                              <span className={`px-1 py-0.5 rounded text-xs font-medium ${getPriorityColor(story.priority)}`}>
                                {story.priority.charAt(0)}
                              </span>
                            </div>
                          </div>
                          
                          <h4 className="font-medium text-gray-900 text-xs line-clamp-2 leading-tight mb-1 flex-1">
                            {story.title}
                          </h4>
                          
                          <div className="h-3 mb-1">
                            {story.description && (
                              <p className="text-xs text-gray-500 line-clamp-1 leading-tight">
                                {story.description.length > 40 
                                  ? `${story.description.substring(0, 40)}...` 
                                  : story.description
                                }
                              </p>
                            )}
                          </div>
                          
                          <div className="h-4 flex items-center">
                            {story.refinementScore && (
                              <div className="flex items-center space-x-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-green-600 font-medium">
                                  {story.refinementScore.overall}/10
                                </span>
                              </div>
                            )}
                          </div>
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
          <div className="flex-1 p-6 space-y-6">
            {/* First Grid - 2 participants */}
            <div className="grid grid-cols-2 gap-4">
              {/* User */}
              <ParticipantCard
                participant={{ name: user?.full_name || 'You' }}
                isCurrentSpeaker={false}
                isUser={true}
              />
              
              {/* First AI Team Member */}
              {teamMembers.slice(0, 1).map(member => (
                <ParticipantCard
                  key={member.name}
                  participant={member}
                  isCurrentSpeaker={currentSpeaking === member.name}
                  isUser={false}
                />
              ))}
            </div>

            {/* Second Grid - 2 participants */}
            {teamMembers.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {teamMembers.slice(1, 3).map(member => (
                  <ParticipantCard
                    key={member.name}
                    participant={member}
                    isCurrentSpeaker={currentSpeaking === member.name}
                    isUser={false}
                  />
                ))}
              </div>
            )}

            {/* Third Grid - 1 participant centered */}
            {teamMembers.length > 3 && (
              <div className="flex justify-center">
                <div className="w-1/2">
                  <ParticipantCard
                    key={teamMembers[3].name}
                    participant={teamMembers[3]}
                    isCurrentSpeaker={currentSpeaking === teamMembers[3].name}
                    isUser={false}
                  />
                </div>
              </div>
            )}
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
                    {transcript.map((message, index) => (
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto text-gray-900" ref={storyContentRef}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {isViewingStory ? 'Story Details' : 'Edit Story'}
              </h2>
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
    </div>
  );
};