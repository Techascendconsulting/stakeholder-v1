import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { RefinementMeetingState, RefinementMessage, RefinementTeamMember } from '../../lib/types';

// AgileTicket interface (should match the one in AgileHubView)
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
import { azureTTS, isAzureTTSAvailable } from '../../lib/azureTTS';
import { 
  Users, 
  MessageCircle, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Mic,
  MicOff,
  PhoneOff,
  MoreVertical,
  User,
  Target,
  Lightbulb,
  BookOpen,
  X,
  Edit3,
  Save
} from 'lucide-react';

interface RefinementMeetingViewProps {
  stories: AgileTicket[];
  onMeetingEnd: (results: any) => void;
  onClose: () => void;
}

// Helper function to get initials from name
const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Helper function to get avatar background color based on name
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const RefinementMeetingView: React.FC<RefinementMeetingViewProps> = ({
  stories,
  onMeetingEnd,
  onClose
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [editingStoryData, setEditingStoryData] = useState<AgileTicket | null>(null);

  // Priority color helper function
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

  // Team members - using the same voice assignments as the working voice meetings
  const teamMembers = {
    sarah: {
      id: 'sarah',
      name: 'Sarah',
      role: 'Scrum Master' as const,
      voiceId: 'en-GB-LibbyNeural',
      nationality: 'British',
      personality: 'Collaborative, process-focused, keeps meetings on track',
      focusAreas: ['Story sizing', 'Sprint readiness', 'Delivery risks', 'Team coordination']
    },
    srikanth: {
      id: 'srikanth',
      name: 'Srikanth',
      role: 'Senior Developer' as const,
      voiceId: 'en-GB-RyanNeural', // Using UK voice for consistency
      nationality: 'Indian',
      personality: 'Technical depth, architectural thinking, system perspective',
      focusAreas: ['System limitations', 'Scalability', 'Architecture', 'Technical complexity']
    },
    lisa: {
      id: 'lisa',
      name: 'Lisa',
      role: 'Developer' as const,
      voiceId: 'en-GB-MaisieNeural',
      nationality: 'Polish',
      personality: 'Implementation-focused, detail-oriented, integration expert',
      focusAreas: ['Task clarity', 'Integration questions', 'Implementation details']
    },
    tom: {
      id: 'tom',
      name: 'Tom',
      role: 'QA Tester' as const,
      voiceId: 'en-GB-ThomasNeural',
      nationality: 'British',
      personality: 'Quality-focused, edge case finder, testability advocate',
      focusAreas: ['Testability', 'Edge cases', 'Acceptance criteria gaps', 'Quality assurance']
    }
  };
  const teamMembersList = Object.values(teamMembers);

  // Meeting state
  const [meetingState, setMeetingState] = useState<RefinementMeetingState>({
    id: `meeting_${Date.now()}`,
    stories,
    currentStoryIndex: 0,
    phase: 'intro',
    messages: [],
    currentSpeaker: null,
    isWaitingForUser: false,
    startedAt: new Date().toISOString(),
    scores: {},
    suggestions: {},
    kanbanColumns: {
      'ready': {
        id: 'ready',
        title: 'Ready for Discussion',
        stories: stories.map(s => s.id)
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
    }
  });

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [meetingState.messages]);

  // Start meeting with intro
  useEffect(() => {
    if (meetingState.phase === 'intro') {
      setTimeout(() => {
        addAIMessage(
          teamMembers.sarah,
          `Hello everyone! I'm Sarah, your Scrum Master for today's refinement session. We have ${stories.length} ${stories.length === 1 ? 'story' : 'stories'} to review. Let's start by having our Business Analyst present the first story.`
        );
        
        // Move to story review phase
        setMeetingState(prev => ({
          ...prev,
          phase: 'story-review',
          isWaitingForUser: true,
          kanbanColumns: {
            ...prev.kanbanColumns,
            discussing: {
              ...prev.kanbanColumns.discussing,
              stories: [stories[0].id]
            },
            ready: {
              ...prev.kanbanColumns.ready,
              stories: prev.kanbanColumns.ready.stories.filter(id => id !== stories[0].id)
            }
          }
        }));
      }, 1000);
    }
  }, []);

  const addAIMessage = async (member: RefinementTeamMember, text: string) => {
    const message: RefinementMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      speakerId: member.id,
      speakerName: member.name,
      speakerRole: member.role,
      message: text,
      timestamp: new Date().toISOString(),
      isUser: false,
      isPlaying: false
    };

    // Add message immediately
    setMeetingState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      currentSpeaker: member.id
    }));

        // Generate TTS audio using the same system as voice meetings
    if (!isMuted && isAzureTTSAvailable()) {
      try {
        console.log(`🎵 Using voice: ${member.voiceId} for team member: ${member.name}`);
        console.log('🔧 Azure TTS Available:', isAzureTTSAvailable());
        
        const audioBlob = await azureTTS.synthesizeSpeech(text, member.voiceId);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Update message with audio URL
        setMeetingState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === message.id 
              ? { ...msg, audioUrl, isPlaying: true }
              : msg
          )
        }));

        audio.play();
        
        audio.onended = () => {
          setMeetingState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === message.id 
                ? { ...msg, isPlaying: false }
                : msg
            ),
            currentSpeaker: null
          }));
          // Clean up the blob URL
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          console.warn('Audio playback error');
          setMeetingState(prev => ({
            ...prev,
            currentSpeaker: null
          }));
          URL.revokeObjectURL(audioUrl);
        };
      } catch (error) {
        console.warn('TTS Error:', error, 'Continuing with text-only meeting.');
        setTtsAvailable(false);
        // Clear current speaker after a delay even if TTS fails
        setTimeout(() => {
          setMeetingState(prev => ({
            ...prev,
            currentSpeaker: null
          }));
        }, 2000);
      }
    } else {
      // If muted or TTS unavailable, just clear current speaker after a delay
      setTimeout(() => {
        setMeetingState(prev => ({
          ...prev,
          currentSpeaker: null
        }));
      }, 2000);
    }
  };

  const addUserMessage = (text: string) => {
    const message: RefinementMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      speakerId: 'user',
      speakerName: user?.full_name || 'Business Analyst',
      speakerRole: 'Business Analyst',
      message: text,
      timestamp: new Date().toISOString(),
      isUser: true
    };

    setMeetingState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      isWaitingForUser: false
    }));

    // Trigger AI responses based on meeting phase
    setTimeout(() => {
      handleAIResponse(text);
    }, 1000);
  };

  const handleAIResponse = (userMessage: string) => {
    const currentStory = stories[meetingState.currentStoryIndex];
    
    // Generate contextual responses based on story content and phase
    if (meetingState.phase === 'story-review') {
      // Rotate through team members with relevant questions
      const responses = [
        {
          member: teamMembers.srikanth,
          text: `Thanks for the overview. Looking at the technical requirements, I'm concerned about scalability. How many concurrent users are we expecting? And what's our fallback if the system becomes overwhelmed?`
        },
        {
          member: teamMembers.lisa,
          text: `I need clarity on the integration points. Are we connecting to existing APIs or building new ones? Also, what's the expected response time for this feature?`
        },
        {
          member: teamMembers.tom,
          text: `From a testing perspective, I'm seeing some gaps in the acceptance criteria. What should happen when the user provides invalid input? Can we test this in our staging environment?`
        }
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addAIMessage(randomResponse.member, randomResponse.text);
      
      // Move to discussion phase after a few exchanges
      if (meetingState.messages.length > 6) {
        setTimeout(() => {
          setMeetingState(prev => ({ ...prev, phase: 'discussion' }));
          addAIMessage(
            teamMembers.sarah,
            `Great discussion so far. Let's dig deeper into the implementation details and edge cases.`
          );
        }, 3000);
      }
    } else if (meetingState.phase === 'discussion') {
      // More detailed technical discussion
      const detailedResponses = [
        {
          member: teamMembers.srikanth,
          text: `I think we should break this story down. The current scope feels too large for one sprint. Could we separate the data validation from the UI components?`
        },
        {
          member: teamMembers.tom,
          text: `I agree with Srikanth. Also, we need more specific error handling scenarios in the acceptance criteria. What happens if the service is down?`
        }
      ];

      const response = detailedResponses[Math.floor(Math.random() * detailedResponses.length)];
      addAIMessage(response.member, response.text);

      // Move to estimation after discussion
      if (meetingState.messages.length > 12) {
        setTimeout(() => {
          setMeetingState(prev => ({ ...prev, phase: 'estimation' }));
          addAIMessage(
            teamMembers.sarah,
            `Alright team, based on our discussion, what's your confidence level on delivering this story? Any blockers or dependencies we need to consider?`
          );
        }, 3000);
      }
    } else if (meetingState.phase === 'estimation') {
      // Wrap up current story
      setTimeout(() => {
        completeCurrentStory();
      }, 2000);
    }
  };

  const completeCurrentStory = () => {
    const currentStory = stories[meetingState.currentStoryIndex];
    
    // Generate scores for the story
    const scores = {
      clarity: Math.floor(Math.random() * 3) + 7, // 7-10
      completeness: Math.floor(Math.random() * 3) + 6, // 6-9
      testability: Math.floor(Math.random() * 3) + 6, // 6-9
      overall: 0
    };
    scores.overall = Math.round((scores.clarity + scores.completeness + scores.testability) / 3);

    // Generate suggestions
    const suggestions = [
      "Consider breaking this story into smaller, more focused pieces",
      "Add more specific error handling scenarios to acceptance criteria", 
      "Include performance requirements in the definition of done",
      "Clarify integration touchpoints with existing systems"
    ];

    setMeetingState(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [currentStory.id]: scores
      },
      suggestions: {
        ...prev.suggestions,
        [currentStory.id]: suggestions.slice(0, 2) // Random 2 suggestions
      },
      kanbanColumns: {
        ...prev.kanbanColumns,
        discussing: {
          ...prev.kanbanColumns.discussing,
          stories: []
        },
        refined: {
          ...prev.kanbanColumns.refined,
          stories: [...prev.kanbanColumns.refined.stories, currentStory.id]
        }
      }
    }));

    // Move to next story or complete meeting
    if (meetingState.currentStoryIndex < stories.length - 1) {
      const nextIndex = meetingState.currentStoryIndex + 1;
      const nextStory = stories[nextIndex];
      
      setMeetingState(prev => ({
        ...prev,
        currentStoryIndex: nextIndex,
        phase: 'story-review',
        isWaitingForUser: true,
        kanbanColumns: {
          ...prev.kanbanColumns,
          discussing: {
            ...prev.kanbanColumns.discussing,
            stories: [nextStory.id]
          },
          ready: {
            ...prev.kanbanColumns.ready,
            stories: prev.kanbanColumns.ready.stories.filter(id => id !== nextStory.id)
          }
        }
      }));

      addAIMessage(
        teamMembers.sarah,
        `Thanks everyone. Let's move on to the next story. Business Analyst, please present story ${nextIndex + 1}.`
      );
    } else {
      // Complete the meeting
      setMeetingState(prev => ({ ...prev, phase: 'completed' }));
      addAIMessage(
        teamMembers.sarah,
        `Excellent work team! We've refined all stories. I'll update the tickets with our feedback and scoring. Great collaboration everyone!`
      );
      
      setTimeout(() => {
        onMeetingEnd({
          scores: meetingState.scores,
          suggestions: meetingState.suggestions,
          duration: Math.round((Date.now() - new Date(meetingState.startedAt).getTime()) / 60000),
          transcript: meetingState.messages
        });
      }, 3000);
    }
  };

  const handleSendMessage = () => {
    if (userInput.trim()) {
      addUserMessage(userInput.trim());
      setUserInput('');
    }
  };

  const currentStory = stories[meetingState.currentStoryIndex];

  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const selectedStoryForDetail = stories.find(s => s.id === selectedStoryId);

  const handleStoryClick = (storyId: string) => {
    setSelectedStoryId(storyId);
    // Add message about story selection
    const story = stories.find(s => s.id === storyId);
    if (story) {
      addUserMessage(`Let's discuss story ${story.ticketNumber}: "${story.title}"`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {/* Teams-style Meeting Header */}
      <div className="bg-black text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="w-5 h-5 text-blue-400" />
          <span className="font-medium">Team Refinement Meeting</span>
          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Recording</span>
            </div>
            {!isAzureTTSAvailable() && (
              <div className="flex items-center space-x-2 text-yellow-400">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Text Only</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-300">
            Story {meetingState.currentStoryIndex + 1} of {stories.length}
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-red-600 hover:bg-red-700 rounded"
          >
            <PhoneOff size={16} />
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-60px)]">
        
        {/* Main Shared Screen - Kanban Board */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-6 relative">
          <div className="h-full flex flex-col">
            
            {/* Board Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Sprint Refinement Board
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Click on any story card to discuss with the team
              </p>
            </div>

            {/* Kanban Columns */}
            <div className="flex-1 grid grid-cols-3 gap-6">
              {Object.values(meetingState.kanbanColumns).map(column => (
                <div key={column.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {column.title}
                    </h3>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-sm">
                      {column.stories.length}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {column.stories.map(storyId => {
                      const story = stories.find(s => s.id === storyId);
                      if (!story) return null;
                      
                      const isActive = storyId === currentStory?.id;
                      const isSelected = selectedStoryId === storyId;
                      
                      return (
                        <div 
                          key={storyId}
                          onClick={() => handleStoryClick(storyId)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg transform scale-105'
                              : isActive 
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <BookOpen size={16} className="text-blue-600" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {story.ticketNumber}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(story.priority)}`}>
                              {story.priority}
                            </span>
                          </div>
                          
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {story.title}
                          </h4>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                            {story.description}
                          </p>
                          
                          {meetingState.scores[storyId] && (
                            <div className="mt-3 flex items-center space-x-2">
                              <CheckCircle size={14} className="text-green-600" />
                              <span className="text-sm text-green-600 font-medium">
                                Refined - Score: {meetingState.scores[storyId].overall}/10
                              </span>
                            </div>
                          )}
                          
                          {isActive && (
                            <div className="mt-2 flex items-center space-x-1 text-orange-600">
                              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                              <span className="text-xs font-medium">Currently Discussing</span>
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

          {/* Story Detail Overlay */}
          {selectedStoryForDetail && (
            <div className="absolute top-6 right-6 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Story Details</h3>
                <button
                  onClick={() => setSelectedStoryId(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <BookOpen size={14} className="text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedStoryForDetail.ticketNumber}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(selectedStoryForDetail.priority)}`}>
                      {selectedStoryForDetail.priority}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {selectedStoryForDetail.title}
                  </h4>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedStoryForDetail.description}
                  </p>
                </div>
                
                {selectedStoryForDetail.acceptanceCriteria && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Acceptance Criteria</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedStoryForDetail.acceptanceCriteria}
                    </p>
                  </div>
                )}

                {meetingState.scores[selectedStoryForDetail.id] && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                    <h5 className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">Refinement Scores</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Clarity: {meetingState.scores[selectedStoryForDetail.id].clarity}/10</div>
                      <div>Complete: {meetingState.scores[selectedStoryForDetail.id].completeness}/10</div>
                      <div>Testable: {meetingState.scores[selectedStoryForDetail.id].testability}/10</div>
                      <div className="font-medium">Overall: {meetingState.scores[selectedStoryForDetail.id].overall}/10</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Teams-style Right Sidebar - Participants */}
        <div className="w-80 bg-gray-100 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          
          {/* Participants Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Meeting Participants</h3>
            <div className="text-sm text-gray-500">5 people in this meeting</div>
          </div>

          {/* You (Business Analyst) */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {user?.full_name || 'You'}
                </div>
                <div className="text-sm text-gray-500">Business Analyst • Presenter</div>
              </div>
            </div>
          </div>

          {/* AI Team Members */}
          <div className="flex-1 overflow-y-auto">
            {teamMembersList.map(member => (
              <div 
                key={member.id}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 transition-colors ${
                  meetingState.currentSpeaker === member.id 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    meetingState.currentSpeaker === member.id 
                      ? `ring-2 ring-green-500 ${getAvatarColor(member.name)}` 
                      : getAvatarColor(member.name)
                  }`}>
                    {getInitials(member.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </span>
                      {meetingState.currentSpeaker === member.id && (
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{member.role} • {member.nationality}</div>
                    {meetingState.currentSpeaker === member.id && (
                      <div className="text-xs text-green-600 mt-1">Speaking...</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat/Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {meetingState.phase === 'completed' ? (
              <div className="text-center">
                <p className="text-green-600 font-medium mb-2">Meeting Completed!</p>
                <p className="text-sm text-gray-500">Generating final scores...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message to the team..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  disabled={meetingState.currentSpeaker !== null}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || meetingState.currentSpeaker !== null}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Send Message
                </button>
              </div>
            )}
          </div>

          {/* Recent Messages */}
          <div className="max-h-40 overflow-y-auto p-4 pt-0">
            <div className="space-y-2">
              {meetingState.messages.slice(-3).map(message => (
                <div key={message.id} className="bg-white dark:bg-gray-800 p-2 rounded text-xs">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {message.speakerName}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {message.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};