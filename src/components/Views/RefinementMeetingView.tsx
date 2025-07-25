import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { AgileTicket, RefinementMeetingState, RefinementMessage, RefinementTeamMember } from '../../lib/types';
import { azureTTSService } from '../../services/azureTTSService';
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
  BookOpen
} from 'lucide-react';

interface RefinementMeetingViewProps {
  stories: AgileTicket[];
  onMeetingEnd: (results: any) => void;
  onClose: () => void;
}

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

  // Team members
  const teamMembers = azureTTSService.getTeamMembers();
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

    // Generate TTS audio
    if (!isMuted) {
      try {
        const audioUrl = await azureTTSService.synthesizeSpeech({
          text,
          voiceId: member.voiceId,
          rate: 'medium'
        });

        if (audioUrl) {
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
          };
        }
      } catch (error) {
        console.error('TTS Error:', error);
        setMeetingState(prev => ({
          ...prev,
          currentSpeaker: null
        }));
      }
    } else {
      // If muted, just clear current speaker after a delay
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
        
        {/* Meeting Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Team Refinement Meeting
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock size={16} />
              <span>Story {meetingState.currentStoryIndex + 1} of {stories.length}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Kanban Board */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Story Board</h3>
            
            <div className="space-y-4">
              {Object.values(meetingState.kanbanColumns).map(column => (
                <div key={column.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {column.title} ({column.stories.length})
                  </h4>
                  
                  <div className="space-y-2">
                    {column.stories.map(storyId => {
                      const story = stories.find(s => s.id === storyId);
                      if (!story) return null;
                      
                      const isActive = storyId === currentStory?.id;
                      
                      return (
                        <div 
                          key={storyId}
                          className={`p-2 rounded border text-xs ${
                            isActive 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            <BookOpen size={12} className="text-blue-600" />
                            <span className="font-medium">#{story.ticketNumber}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                            {story.title}
                          </p>
                          {meetingState.scores[storyId] && (
                            <div className="mt-1 flex items-center space-x-1">
                              <CheckCircle size={10} className="text-green-600" />
                              <span className="text-green-600">
                                Score: {meetingState.scores[storyId].overall}/10
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

          {/* Meeting Chat */}
          <div className="flex-1 flex flex-col">
            
            {/* Team Members Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">You (Business Analyst)</span>
                </div>
                
                {teamMembersList.map(member => (
                  <div 
                    key={member.id}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                      meetingState.currentSpeaker === member.id 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{member.avatar}</span>
                    <span className="text-sm">{member.name}</span>
                    <span className="text-xs">({member.role})</span>
                    {meetingState.currentSpeaker === member.id && (
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse delay-75"></div>
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse delay-150"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {meetingState.messages.map(message => (
                <div 
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3xl p-3 rounded-lg ${
                      message.isUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.speakerName}
                      </span>
                      <span className="text-xs opacity-70">
                        ({message.speakerRole})
                      </span>
                      {message.audioUrl && (
                        <button
                          onClick={() => {
                            const audio = new Audio(message.audioUrl);
                            audio.play();
                          }}
                          className="text-xs opacity-70 hover:opacity-100"
                        >
                          <Play size={12} />
                        </button>
                      )}
                      {message.isPlaying && (
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-75"></div>
                          <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-150"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {meetingState.phase === 'completed' ? (
                <div className="text-center">
                  <p className="text-green-600 font-medium mb-2">Meeting Completed!</p>
                  <p className="text-sm text-gray-500">Generating final scores and feedback...</p>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={meetingState.isWaitingForUser ? "Present your story or respond to questions..." : "Type your response..."}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={meetingState.currentSpeaker !== null}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || meetingState.currentSpeaker !== null}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};