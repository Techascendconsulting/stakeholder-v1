import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, Send, Volume2, Play, Square, PhoneOff, ChevronDown, X, GripVertical, FileText } from 'lucide-react';
import { useVoice } from '../../contexts/VoiceContext';
import { getUserProfilePhoto, getUserDisplayName } from '../../utils/profileUtils';

// Custom interface for sprint planning meeting messages
interface MeetingMessage {
  id: string;
  speaker: string;
  content: string;
  timestamp: string;
  role: 'Scrum Master' | 'Senior Developer' | 'Developer' | 'QA Tester' | 'Business Analyst' | 'user';
  stakeholderId: string;
}

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

interface SprintPlanningMember {
  name: string;
  role: string;
  avatar: string;
  isAI: boolean;
  voiceId?: string;
  avatarUrl?: string;
}

interface SprintPlanningMeetingViewProps {
  stories: AgileTicket[];
  sprintGoal: string;
  teamCapacity: number;
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

// Participant Card Component
const ParticipantCard: React.FC<{
  participant: { name: string; avatarUrl?: string };
  isCurrentSpeaker: boolean;
  isUser: boolean;
}> = ({ participant, isCurrentSpeaker, isUser }) => {
  // Mock user for sprint planning simulation
  const user = { full_name: 'You', id: 'user', email: 'user@example.com' };
  
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
                {getInitials(participant.name)}
              </div>
              <span className="text-white text-sm font-medium">{participant.name}</span>
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
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-blue-500 to-purple-600">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold mb-2">
                {getInitials(participant.name)}
              </div>
              <span className="text-white text-sm font-medium">{participant.name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SprintPlanningMeetingView: React.FC<SprintPlanningMeetingViewProps> = ({
  stories,
  sprintGoal,
  teamCapacity,
  onMeetingEnd,
  onClose
}) => {
  // Mock user for sprint planning simulation
  const user = { full_name: 'You', id: 'user', email: 'user@example.com' };
  
  // Team members for sprint planning
  const teamMembers: SprintPlanningMember[] = [
    {
      name: 'Sarah',
      role: 'Scrum Master',
      avatar: '👩‍💼',
      isAI: true,
      voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
      avatarUrl: '/images/avatars/sarah-avatar.png'
    },
    {
      name: 'Victor',
      role: 'Senior Developer',
      avatar: '👨‍💻',
      isAI: true,
      voiceId: 'xeBpkkuzgxa0IwKt7NTP',
      avatarUrl: '/images/avatars/victor-avatar.png'
    },
    {
      name: 'Srikanth',
      role: 'Developer',
      avatar: '👨‍💻',
      isAI: true,
      voiceId: 'wD6AxxDQzhi2E9kMbk9t',
      avatarUrl: '/images/avatars/srikanth-avatar.png'
    },
    {
      name: 'Lisa',
      role: 'Business Analyst',
      avatar: '👩‍💼',
      isAI: true,
      voiceId: '8N2ng9i2uiUWqstgmWlH',
      avatarUrl: '/images/avatars/lisa-avatar.png'
    },
    {
      name: 'Tom',
      role: 'QA Tester',
      avatar: '👨‍🔬',
      isAI: true,
      voiceId: 'qqBeXuJvzxtQfbsW2f40',
      avatarUrl: '/images/avatars/tom-avatar.png'
    }
  ];

  // Basic state management
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [currentSpeaking, setCurrentSpeaking] = useState<string | null>(null);
  const [productBacklog, setProductBacklog] = useState<AgileTicket[]>([]);
  const [sprintBacklog, setSprintBacklog] = useState<AgileTicket[]>([]);

  // Helper functions for styling
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Refined':
        return 'bg-green-100 text-green-800';
      case 'Ready for Refinement':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'Refined':
        return '✅';
      case 'Ready for Refinement':
        return '📋';
      case 'Draft':
        return '📝';
      default:
        return '📋';
    }
  };

  // Initialize product backlog with refined stories at the top
  useEffect(() => {
    const refinedStories = stories.filter(story => story.status === 'Refined');
    const otherStories = stories.filter(story => story.status !== 'Refined');
    
    // Ensure refined stories are at the top
    const sortedStories = [...refinedStories, ...otherStories];
    setProductBacklog(sortedStories);
  }, [stories]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, storyId: string) => {
    e.dataTransfer.setData('text/plain', storyId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, target: 'sprint' | 'backlog') => {
    e.preventDefault();
    const storyId = e.dataTransfer.getData('text/plain');
    
    if (target === 'sprint') {
      // Move from product backlog to sprint backlog
      const story = productBacklog.find(s => s.id === storyId);
      if (story) {
        setProductBacklog(prev => prev.filter(s => s.id !== storyId));
        setSprintBacklog(prev => [...prev, { ...story, status: 'To Do' }]);
        console.log(`📋 Story ${story.title} moved to sprint backlog`);
      }
    } else {
      // Move from sprint backlog to product backlog
      const story = sprintBacklog.find(s => s.id === storyId);
      if (story) {
        setSprintBacklog(prev => prev.filter(s => s.id !== storyId));
        setProductBacklog(prev => [...prev, { ...story, status: 'Refined' }]);
        console.log(`📋 Story ${story.title} moved back to product backlog`);
      }
    }
  };

  // Start meeting
  const startMeeting = async () => {
    setMeetingStarted(true);
    console.log('🚀 Sprint Planning meeting started!');
  };

  // End meeting
  const handleEndMeeting = () => {
    onMeetingEnd({
      messages: [],
      meetingDuration: 0
    });
  };

  // Close meeting
  const handleCloseMeeting = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col z-50 overflow-hidden">
      {/* Header with Navigation - Dark mode like voice meetings */}
      <div className="bg-black border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCloseMeeting}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Sprint Planning</span>
          </button>
          
          <div className="flex items-center space-x-3">
            {meetingStarted ? (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Sprint Planning Meeting - Live</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium">Sprint Planning Meeting - Ready to Start</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm">Audio Ready</span>
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
        {/* Left Side - Placeholder for Sprint Planning Board */}
        <div className="flex-1 bg-gray-50 text-gray-900 p-6 overflow-auto border-r border-gray-200">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Sprint Planning Board
              </h2>
              
              {/* Start Meeting Button */}
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
            
            {/* Sprint Backlog Section - Top - Jira Style */}
            <div className="mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Sprint Backlog ({sprintBacklog.length} stories)</h3>
                  </div>
                </div>
                
                <div 
                  className="min-h-[200px]"
                  onDragOver={meetingStarted ? handleDragOver : undefined}
                  onDrop={meetingStarted ? (e) => handleDrop(e, 'sprint') : undefined}
                >
                  {sprintBacklog.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                      <div className="text-center">
                        <div className="grid grid-cols-3 gap-1 mb-4 w-8 h-8 mx-auto">
                          <div className="w-2 h-2 bg-gray-300 rounded"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded"></div>
                        </div>
                        <p className="text-sm">
                          Drag stories from Product Backlog to start building your sprint
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-hidden">
                      {/* Jira-style table header */}
                      <div className="bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-6 gap-4 px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                          <div className="col-span-1">KEY</div>
                          <div className="col-span-2">SUMMARY</div>
                          <div className="col-span-1">TYPE</div>
                          <div className="col-span-1">PRIORITY</div>
                          <div className="col-span-1">STORY POINTS</div>
                          <div className="col-span-1">STATUS</div>
                        </div>
                      </div>
                      
                      {/* Jira-style table rows */}
                      <div className="divide-y divide-gray-100">
                        {sprintBacklog.map(story => (
                          <div
                            key={story.id}
                            draggable={meetingStarted}
                            onDragStart={meetingStarted ? (e) => handleDragStart(e, story.id) : undefined}
                            className="grid grid-cols-6 gap-4 px-4 py-3 hover:bg-blue-50 transition-colors cursor-move border-l-4 border-l-transparent hover:border-l-blue-500"
                          >
                            {/* Key */}
                            <div className="col-span-1 flex items-center">
                              <span className="text-sm font-medium text-blue-600">{story.ticketNumber}</span>
                            </div>
                            
                            {/* Summary */}
                            <div className="col-span-2 flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">{story.title}</div>
                                {story.description && (
                                  <div className="text-xs text-gray-500 line-clamp-1 mt-1">{story.description}</div>
                                )}
                              </div>
                            </div>
                            
                            {/* Type */}
                            <div className="col-span-1 flex items-center">
                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                Story
                              </span>
                            </div>
                            
                            {/* Priority */}
                            <div className="col-span-1 flex items-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                story.priority === 'High' ? 'bg-yellow-100 text-yellow-800' :
                                story.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {story.priority}
                              </span>
                            </div>
                            
                            {/* Story Points */}
                            <div className="col-span-1 flex items-center">
                              {story.storyPoints ? (
                                <span className="text-sm font-medium text-gray-900">
                                  {story.storyPoints}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </div>
                            
                            {/* Status */}
                            <div className="col-span-1 flex items-center">
                              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                To Do
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Backlog Section - Bottom - Jira Style */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Product Backlog ({productBacklog.length} stories)</h3>
                </div>
                
                <div className="overflow-hidden">
                  {/* Jira-style table header */}
                  <div className="bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-6 gap-4 px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      <div className="col-span-1">KEY</div>
                      <div className="col-span-2">SUMMARY</div>
                      <div className="col-span-1">TYPE</div>
                      <div className="col-span-1">PRIORITY</div>
                      <div className="col-span-1">STORY POINTS</div>
                      <div className="col-span-1">STATUS</div>
                    </div>
                  </div>
                  
                  {/* Jira-style table rows */}
                  <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    {productBacklog.map(story => (
                      <div
                        key={story.id}
                        draggable={meetingStarted}
                        onDragStart={meetingStarted ? (e) => handleDragStart(e, story.id) : undefined}
                        className={`grid grid-cols-6 gap-4 px-4 py-3 transition-colors border-l-4 border-l-transparent hover:border-l-blue-500 ${
                          meetingStarted ? 'cursor-move hover:bg-blue-50' : 'cursor-pointer hover:bg-gray-50'
                        }`}
                      >
                        {/* Key */}
                        <div className="col-span-1 flex items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                              <div className="flex flex-col gap-0.5">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-blue-600">{story.ticketNumber}</span>
                          </div>
                        </div>
                        
                        {/* Summary */}
                        <div className="col-span-2 flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">{story.title}</div>
                            {story.description && (
                              <div className="text-xs text-gray-500 line-clamp-1 mt-1">{story.description}</div>
                            )}
                          </div>
                        </div>
                        
                        {/* Type */}
                        <div className="col-span-1 flex items-center">
                          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Story
                          </span>
                        </div>
                        
                        {/* Priority */}
                        <div className="col-span-1 flex items-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            story.priority === 'High' ? 'bg-yellow-100 text-yellow-800' :
                            story.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {story.priority}
                          </span>
                        </div>
                        
                        {/* Story Points */}
                        <div className="col-span-1 flex items-center">
                          {story.storyPoints ? (
                            <span className="text-sm font-medium text-gray-900">
                              {story.storyPoints}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </div>
                        
                        {/* Status */}
                        <div className="col-span-1 flex items-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}>
                            {getStatusEmoji(story.status)} {story.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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

          {/* Participant Video Grid (3 grids: 2+2+1 Layout) */}
          <div className="flex-1 p-6">
            {/* Proper 2x3 grid layout for 6 participants */}
            <div className="grid grid-cols-3 grid-rows-2 gap-4 h-full">
              {/* Row 1: Sarah, Victor, Srikanth */}
              <ParticipantCard
                participant={teamMembers.find(m => m.name === 'Sarah') || teamMembers[0]}
                isCurrentSpeaker={currentSpeaking === 'Sarah' || currentSpeaking === 'sarah'}
                isUser={false}
              />
              <ParticipantCard
                participant={teamMembers.find(m => m.name === 'Victor') || teamMembers[1]}
                isCurrentSpeaker={currentSpeaking === 'Victor' || currentSpeaking === 'victor'}
                isUser={false}
              />
              <ParticipantCard
                participant={teamMembers.find(m => m.name === 'Srikanth') || teamMembers[2]}
                isCurrentSpeaker={currentSpeaking === 'Srikanth' || currentSpeaking === 'srikanth'}
                isUser={false}
              />
              
              {/* Row 2: Lisa, Tom, User */}
              <ParticipantCard
                participant={teamMembers.find(m => m.name === 'Lisa') || teamMembers[3]}
                isCurrentSpeaker={currentSpeaking === 'Lisa' || currentSpeaking === 'lisa'}
                isUser={false}
              />
              <ParticipantCard
                participant={teamMembers.find(m => m.name === 'Tom') || teamMembers[4]}
                isCurrentSpeaker={currentSpeaking === 'Tom' || currentSpeaking === 'tom'}
                isUser={false}
              />
              <ParticipantCard
                participant={{ name: user?.email || 'You' }}
                isCurrentSpeaker={false}
                isUser={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Controls - Basic */}
      {meetingStarted && (
        <div className="px-6 py-3 bg-gray-900 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            {/* End Meeting Button */}
            <button
              onClick={handleEndMeeting}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 transition-colors"
              title="End Meeting"
            >
              <PhoneOff className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input Area - Basic */}
      <div className="flex relative">
        {/* Left Side - Input Area */}
        <div className="flex-1 px-6 py-4 bg-gray-900 border-t border-gray-700 relative">
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Type a message"
              disabled={!meetingStarted}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-400 disabled:opacity-50"
            />
            
            <button
              disabled={!meetingStarted}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Right Side - Spacer to match participants panel width */}
        <div className="w-96"></div>
      </div>
    </div>
  );
};

export default SprintPlanningMeetingView;