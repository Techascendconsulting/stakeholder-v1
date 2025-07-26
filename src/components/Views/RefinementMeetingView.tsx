import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, Send, Users, Clock, Volume2, Play, Pause, Square, Phone, PhoneOff, Settings, MoreVertical, ChevronDown, ChevronUp, X, Edit3, Save, Trash2, Plus, GripVertical } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useVoice } from '../../contexts/VoiceContext';
import { Message } from '../../types';
import { azureTTS, isAzureTTSAvailable } from '../../lib/azureTTS';
import { transcribeAudio, getSupportedAudioFormat } from '../../lib/whisper';
import AgileRefinementService, { AgileTeamMemberContext } from '../../services/agileRefinementService';
import { getUserProfilePhoto, getUserDisplayName } from '../../utils/profileUtils';

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
  status: 'Draft' | 'Ready for Refinement' | 'Refined' | 'To Do' | 'In Progress' | 'In Test' | 'Done';
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
  const [currentSpeaker, setCurrentSpeaker] = useState<any>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioStates, setAudioStates] = useState<Record<string, string>>({});
  
  // Voice input state (reusing voice meeting patterns)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [userInput, setUserInput] = useState('');
  
  // Meeting-specific state
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [editingStory, setEditingStory] = useState<AgileTicket | null>(null);
  
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

      setCurrentSpeaker(teamMember);
      setIsAudioPlaying(true);

      const voiceName = teamMember.voiceId;
      console.log('🎵 Using voice:', voiceName, 'for team member:', teamMember.name);
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
            console.log(`🚀 AUDIO DEBUG: ${teamMember.name} audio naturally ended`);
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
            console.log(`🚀 AUDIO DEBUG: ${teamMember.name} audio started playing`);
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
      }
    } catch (error) {
      console.error('Error in playMessageAudio:', error);
      setCurrentSpeaker(null);
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
      setCurrentSpeaker(null);
      setIsAudioPlaying(false);
      setPlayingMessageId(null);
      console.log('🛑 Audio stopped by user');
    }
  };

  // Add AI message with dynamic response
  const addAIMessage = async (teamMember: AgileTeamMemberContext, text: string) => {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      speaker: teamMember.name,
      content: text,
      timestamp: new Date().toISOString(),
      role: teamMember.role,
      stakeholderId: teamMember.name.toLowerCase()
    };

    setTranscript(prev => [...prev, message]);
    
    // Play audio using voice meeting logic
    await playMessageAudio(message.id, text, teamMember, true);
  };

  // Handle meeting start
  const startMeeting = () => {
    setMeetingStarted(true);
    setTimeout(() => {
      addAIMessage(
        teamMembers[0], // Sarah (Scrum Master)
        `Hello everyone! I'm Sarah, your Scrum Master for today's refinement session. We have ${initialStories.length} ${initialStories.length === 1 ? 'story' : 'stories'} to review. Let's start by having our Business Analyst present the first story.`
      );
    }, 1000);
  };

  // Generate dynamic AI response (no hardcoding)
  const generateAIResponse = async (userMessage: string) => {
    try {
      const context = {
        stories: stories.map(s => ({
          id: s.id,
          title: s.title,
          description: s.description,
          acceptanceCriteria: s.acceptanceCriteria,
          priority: s.priority,
          ticketNumber: s.ticketNumber
        })),
        conversationHistory: transcript,
        teamMembers: teamMembers
      };

      const currentStory = stories.find(s => kanbanColumns.discussing.stories.includes(s.id)) || stories[0];
      const nextSpeaker = aiService.selectNextSpeaker(teamMembers, userMessage);
      
      if (nextSpeaker) {
        const response = await aiService.generateTeamMemberResponse(
          nextSpeaker,
          userMessage,
          context,
          currentStory
        );
        
        await addAIMessage(nextSpeaker, response);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
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
    try {
      const transcribedText = await transcribeAudio(audioBlob);
      if (transcribedText.trim()) {
        setUserInput(transcribedText);
        await handleSendMessage(transcribedText);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
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
          
          {!isAzureTTSAvailable() && (
            <div className="flex items-center space-x-2 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm">Text Only</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Stop Button (to interrupt AI speakers) */}
          {isAudioPlaying && (
            <button
              onClick={stopCurrentAudio}
              className="p-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
              title="Stop current speaker"
            >
              <Square size={20} />
            </button>
          )}
          
          <button
            onClick={() => setGlobalAudioEnabled(!globalAudioEnabled)}
            className={`p-2 rounded-lg ${globalAudioEnabled ? 'bg-green-600' : 'bg-red-600'}`}
          >
            {globalAudioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          
          <button
            onClick={handleEndMeeting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>

      {/* Main Meeting Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Kanban Board */}
        <div className="flex-1 bg-white text-gray-900 p-6 overflow-auto">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Story Refinement Board
              </h2>
              
              {/* Start Meeting Button - Visible with kanban board */}
              {!meetingStarted && (
                <button
                  onClick={startMeeting}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Play size={20} />
                  <span>Start Meeting</span>
                </button>
              )}
            </div>
            
            {/* Kanban Columns */}
            <div className="flex-1 grid grid-cols-3 gap-6">
              {Object.values(kanbanColumns).map(column => (
                <div 
                  key={column.id} 
                  className="bg-gray-50 rounded-lg p-4 h-full"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      {column.title}
                    </h3>
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                      {column.stories.length}
                    </span>
                  </div>
                  
                  <div className="space-y-3 h-full overflow-y-auto">
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
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg bg-white ${
                            isSelected
                              ? 'border-blue-500 shadow-lg transform scale-105'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <GripVertical size={16} className="text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {story.ticketNumber}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(story.priority)}`}>
                                {story.priority}
                              </span>
                              {story.storyPoints && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {story.storyPoints} pts
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                            {story.title}
                          </h4>
                          
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {story.description}
                          </p>
                          
                          {story.refinementScore && (
                            <div className="mt-3 flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-green-600 font-medium">
                                Score: {story.refinementScore.overall}/10
                              </span>
                            </div>
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
                  isCurrentSpeaker={currentSpeaker?.name === member.name}
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
                    isCurrentSpeaker={currentSpeaker?.name === member.name}
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
                    isCurrentSpeaker={currentSpeaker?.name === teamMembers[3].name}
                    isUser={false}
                  />
                </div>
              </div>
            )}
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

            {/* Stop Button */}
            <button
              onClick={stopCurrentAudio}
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
              title="Stop current speaker"
            >
              <Square className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input Area - Voice-Only Style */}
      <div className="relative px-6 py-4 bg-gray-900 border-t border-gray-700">
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
            {/* Floating Transcript Button (when minimized) */}
            {!transcriptPanelOpen && (
              <button
                onClick={() => setTranscriptPanelOpen(true)}
                className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg shadow-lg transition-all duration-200 text-xs font-medium"
                title="Show transcript"
              >
                Transcript ({transcript.length})
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

      {/* Jira-Style Story Editor Modal */}
      {isEditingStory && editingStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto text-gray-900">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Edit Story</h2>
              <button
                onClick={() => setIsEditingStory(false)}
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
                    onChange={(e) => setEditingStory(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editingStory.description}
                    onChange={(e) => setEditingStory(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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