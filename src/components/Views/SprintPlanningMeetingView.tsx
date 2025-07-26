import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, PhoneOff, FileText, Square, Mic, Send, Volume2, MicOff, Play, GripVertical, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { transcribeAudio, getSupportedAudioFormat } from '../../lib/whisper';
import { azureTTS, isAzureTTSAvailable } from '../../lib/azureTTS';
import AIService from '../../services/aiService';

// Types - Same as refinement meeting but focused on sprint planning
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
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  speaker: string;
  timestamp: Date;
}

interface SprintPlanningResults {
  transcript: Message[];
  summary?: string;
  acceptedStories: AgileTicket[];
  rejectedStories: AgileTicket[];
  duration: number;
}

interface SprintPlanningMeetingViewProps {
  stories: AgileTicket[];
  onMeetingEnd: (results: SprintPlanningResults) => void;
  onClose: () => void;
}

const teamMembers: SprintPlanningMember[] = [
  {
    name: 'Sarah',
    role: 'Scrum Master',
    avatar: '👩‍💼',
    isAI: true
  },
  {
    name: 'Srikanth',
    role: 'Senior Developer',
    avatar: '👨‍💻',
    isAI: true
  },
  {
    name: 'Lisa',
    role: 'Developer',
    avatar: '👩‍💻',
    isAI: true
  },
  {
    name: 'Tom',
    role: 'QA Tester',
    avatar: '👨‍🔬',
    isAI: true
  }
];

// Initialize AI Service (will be done in the component)

export const SprintPlanningMeetingView: React.FC<SprintPlanningMeetingViewProps> = ({
  stories,
  onMeetingEnd,
  onClose
}) => {
  const { user } = useAuth();
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<SprintPlanningMember | null>(null);
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(false);
  const [transcriptPanelOpen, setTranscriptPanelOpen] = useState(false);
  const [meetingStartTime, setMeetingStartTime] = useState(0);
  
  // Sprint planning specific state - Jira style with persistence
  const [backlogStories, setBacklogStories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedBacklog = localStorage.getItem('sprint_planning_backlog');
      if (savedBacklog) {
        try {
          const parsed = JSON.parse(savedBacklog);
          // Filter to only include stories that still exist
          const validStories = parsed.filter((id: string) => stories.some(s => s.id === id));
          // Add any new stories that weren't in the saved state
          const allStoryIds = stories.map(s => s.id);
          const savedSprint = localStorage.getItem('sprint_planning_sprint');
          const sprintIds = savedSprint ? JSON.parse(savedSprint) : [];
          const newStories = allStoryIds.filter(id => !validStories.includes(id) && !sprintIds.includes(id));
          return [...validStories, ...newStories];
        } catch (error) {
          console.error('Error loading backlog from localStorage:', error);
        }
      }
    }
    return stories.map(s => s.id);
  });

  const [sprintStories, setSprintStories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedSprint = localStorage.getItem('sprint_planning_sprint');
      if (savedSprint) {
        try {
          const parsed = JSON.parse(savedSprint);
          // Filter to only include stories that still exist
          return parsed.filter((id: string) => stories.some(s => s.id === id));
        } catch (error) {
          console.error('Error loading sprint from localStorage:', error);
        }
      }
    }
    return [];
  });

  const [sprintCapacity] = useState(40); // Story points capacity
  const [currentSprintPoints, setCurrentSprintPoints] = useState(0);
  
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [editingStory, setEditingStory] = useState<AgileTicket | null>(null);

  // Refs for audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  // Calculate current sprint points when sprint stories change
  useEffect(() => {
    const totalPoints = sprintStories.reduce((sum, storyId) => {
      const story = stories.find(s => s.id === storyId);
      return sum + (story?.storyPoints || 0);
    }, 0);
    setCurrentSprintPoints(totalPoints);
  }, [sprintStories, stories]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDragStart = (e: React.DragEvent, storyId: string) => {
    e.dataTransfer.setData('text/plain', storyId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetArea: 'backlog' | 'sprint') => {
    e.preventDefault();
    const storyId = e.dataTransfer.getData('text/plain');
    const story = stories.find(s => s.id === storyId);
    
    if (targetArea === 'sprint') {
      // Moving to sprint
      if (!sprintStories.includes(storyId)) {
        const storyPoints = story?.storyPoints || 0;
        if (currentSprintPoints + storyPoints <= sprintCapacity) {
          const newBacklog = backlogStories.filter(id => id !== storyId);
          const newSprint = [...sprintStories, storyId];
          setBacklogStories(newBacklog);
          setSprintStories(newSprint);
          setCurrentSprintPoints(prev => prev + storyPoints);
          
          // Save to localStorage
          localStorage.setItem('sprint_planning_backlog', JSON.stringify(newBacklog));
          localStorage.setItem('sprint_planning_sprint', JSON.stringify(newSprint));
        }
      }
    } else {
      // Moving back to backlog
      if (!backlogStories.includes(storyId)) {
        const storyPoints = story?.storyPoints || 0;
        const newSprint = sprintStories.filter(id => id !== storyId);
        const newBacklog = [...backlogStories, storyId];
        setSprintStories(newSprint);
        setBacklogStories(newBacklog);
        setCurrentSprintPoints(prev => prev - storyPoints);
        
        // Save to localStorage
        localStorage.setItem('sprint_planning_backlog', JSON.stringify(newBacklog));
        localStorage.setItem('sprint_planning_sprint', JSON.stringify(newSprint));
      }
    }
  };

  const openStoryEditor = (story: AgileTicket) => {
    setEditingStory(story);
    setIsEditingStory(true);
  };

  const saveStoryChanges = () => {
    if (editingStory) {
      // In a real app, this would save to the database
      console.log('Saving story changes:', editingStory);
      setIsEditingStory(false);
      setEditingStory(null);
    }
  };

  const startMeeting = async () => {
    setMeetingStarted(true);
    setMeetingStartTime(Date.now());
    setGlobalAudioEnabled(true); // Enable audio when meeting starts
    
    // Scrum Master greeting with delay for audio context
    setTimeout(async () => {
      const scrumMaster = teamMembers.find(m => m.role === 'Scrum Master') || teamMembers[0];
      const greeting = `Alright team, let's start our sprint planning. We have ${stories.length} refined ${stories.length === 1 ? 'story' : 'stories'} to review today. I'll keep us moving through each one. Who wants to kick off with the first story?`;
      await addAIMessage(scrumMaster, greeting);
    }, 1500); // Increased delay for audio context initialization
  };

  const addAIMessage = async (speaker: SprintPlanningMember, content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'ai',
      content,
      speaker: speaker.name,
      timestamp: new Date()
    };

    setTranscript(prev => [...prev, message]);
    setCurrentSpeaker(speaker);

    // Play audio if available
    try {
      await playMessageAudio(content, speaker);
    } catch (error) {
      console.error('Error playing audio:', error);
    }

    setCurrentSpeaker(null);
  };

  const playMessageAudio = async (text: string, speaker: SprintPlanningMember): Promise<void> => {
    return new Promise(async (resolve) => {
      if (!globalAudioEnabled) {
        console.log('🔇 Audio disabled, skipping TTS');
        resolve();
        return;
      }

      if (isAzureTTSAvailable()) {
        try {
          console.log(`🎵 Playing audio for ${speaker.name}: "${text.substring(0, 50)}..."`);
          // Use a default voice (we can map speakers to specific voices later)
          const voiceName = 'en-GB-RyanNeural'; // Default voice for sprint planning
          const audioBlob = await azureTTS.synthesizeSpeech(text, voiceName);
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            console.error('Error playing audio');
            resolve();
          };
          
          await audio.play();
        } catch (error) {
          console.error('Error synthesizing audio:', error);
          resolve();
        }
      } else {
        console.warn('Azure TTS not configured. Please add VITE_AZURE_TTS_KEY to your environment variables.');
        // Visual feedback when audio is not available
        setTimeout(() => resolve(), 2000);
      }
    });
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || userInput.trim();
    if (!text || !meetingStarted) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      speaker: user?.full_name || 'You',
      timestamp: new Date()
    };

    setTranscript(prev => [...prev, userMessage]);
    setUserInput('');

    // Generate AI response using dynamic AI service
    setTimeout(() => generateAIResponse(text), 1000);
  };

  const generateAIResponse = async (userMessage: string) => {
    try {
      // Use the same dynamic AI service as refinement meeting
      const dynamicAIService = AIService.getInstance();
      
      // Convert team members to stakeholder format with specific role behaviors
      const availableTeamMembers = teamMembers.map(member => {
        switch (member.role) {
          case 'Scrum Master':
            return {
              name: member.name,
              role: member.role,
              department: 'Agile Delivery',
              priorities: ['Meeting facilitation', 'Process clarity', 'Team decisions', 'Sprint commitment'],
              personality: 'Guides the meeting and moves the team through the agenda. Asks questions when clarity is missing. Keeps the team focused and ensures decisions are made.',
              expertise: ['scrum', 'agile facilitation', 'sprint planning', 'team dynamics']
            };
          case 'Senior Developer':
            return {
              name: member.name,
              role: member.role,
              department: 'Engineering',
              priorities: ['System architecture', 'Technical feasibility', 'Complexity assessment', 'Dependencies'],
              personality: 'Thinks about architecture, system dependencies, feasibility. Raises concerns about complexity, estimation, or unknowns. May challenge unclear requirements or suggest edge cases.',
              expertise: ['system design', 'architecture', 'technical estimation', 'code complexity']
            };
          case 'Developer':
            return {
              name: member.name,
              role: member.role,
              department: 'Engineering',
              priorities: ['Implementation details', 'Frontend/backend needs', 'Technical blockers', 'Development approach'],
              personality: 'Focuses on building the story. Points out front-end/backend needs. Flags tech blockers or questions not covered by grooming.',
              expertise: ['frontend development', 'backend development', 'implementation', 'technical requirements']
            };
          case 'QA Tester':
            return {
              name: member.name,
              role: member.role,
              department: 'Quality Assurance',
              priorities: ['Testing strategy', 'Test coverage', 'Acceptance criteria', 'Quality risks'],
              personality: 'Thinks about testing strategy and coverage. Highlights missing acceptance criteria, edge cases, testability. Can raise risks related to regression or flaky behavior.',
              expertise: ['test strategy', 'quality assurance', 'edge cases', 'regression testing']
            };
          default:
            return {
              name: member.name,
              role: member.role,
              department: 'Development',
              priorities: ['Story delivery'],
              personality: 'Collaborative team member',
              expertise: ['agile delivery']
            };
        }
      });

      // Detect who should respond (like refinement meeting)
      const mentionResult = await dynamicAIService.detectStakeholderMentions(userMessage, availableTeamMembers);
      
      let responder;
      if (mentionResult.mentionedStakeholders.length > 0 && mentionResult.confidence >= AIService.getMentionConfidenceThreshold()) {
        // Someone was specifically mentioned
        responder = mentionResult.mentionedStakeholders[0];
        console.log('🎯 Specific team member mentioned:', responder.name);
      } else {
        // Select based on context or randomly
        const contextualResponder = await dynamicAIService.selectResponderByContext(
          userMessage,
          availableTeamMembers,
          transcript.map(t => ({ speaker: t.speaker, content: t.content }))
        );
        responder = contextualResponder || availableTeamMembers[Math.floor(Math.random() * availableTeamMembers.length)];
        console.log('🎲 Contextual/Random selection:', responder.name);
      }

      if (responder) {
        // Create conversation context for sprint planning with role-specific behavior
        const currentStory = stories.find(s => sprintStories.includes(s.id) || backlogStories.includes(s.id));
        const conversationContext = {
          project: {
            name: 'Sprint Planning Session',
            description: `You are part of an Agile delivery team participating in a live Sprint Planning meeting.

Each person has a unique role and voice. They respond naturally based on the current ticket, their responsibilities, and team dynamics.

Meeting Participants:
- Sarah (Scrum Master): Guides the meeting and moves the team through the agenda. Asks questions when clarity is missing. Keeps the team focused and ensures decisions are made.
- Srikanth (Senior Developer): Thinks about architecture, system dependencies, feasibility. Raises concerns about complexity, estimation, or unknowns. May challenge unclear requirements or suggest edge cases.
- Lisa (Developer): Focuses on building the story. Points out front-end/backend needs. Flags tech blockers or questions not covered by grooming.
- Tom (QA Tester): Thinks about testing strategy and coverage. Highlights missing acceptance criteria, edge cases, testability. Can raise risks related to regression or flaky behavior.
- [User] (Business Analyst): Provides clarity when others ask for it. Answers questions about story intent. Can elaborate on business logic if needed.

Your job as AI is to make them respond IN CHARACTER. They must:
- React to the current user story (${currentStory?.title || 'the story being discussed'})
- Raise concerns or approvals based on their role
- Keep responses short (max 3 sentences)
- Speak in natural team tone, not like a tutorial
- Be silent unless it's their turn
- Never break character or explain Agile

Current Story: ${currentStory ? `${currentStory.ticketNumber}: ${currentStory.title}` : 'No specific story selected'}`,
            type: 'Sprint Planning Meeting'
          },
          conversationHistory: transcript.map(t => ({ speaker: t.speaker, content: t.content })),
          stakeholders: availableTeamMembers,
          currentContext: {
            backlogStories: backlogStories,
            sprintStories: sprintStories,
            sprintCapacity: sprintCapacity,
            currentSprintPoints: currentSprintPoints,
            totalStories: stories.length,
            sprintGoal: 'Plan and commit to stories for the upcoming sprint',
            currentStory: currentStory ? {
              id: currentStory.id,
              title: currentStory.title,
              description: currentStory.description,
              acceptanceCriteria: currentStory.acceptanceCriteria,
              storyPoints: currentStory.storyPoints,
              priority: currentStory.priority
            } : null
          }
        };

        // Generate dynamic response using AIService with sprint planning context
        const response = await dynamicAIService.generateStakeholderResponse(
          userMessage,
          responder,
          conversationContext,
          'sprint_planning_meeting'
        );
        
        // Find the corresponding team member for audio
        const teamMember = teamMembers.find(m => m.name === responder.name) || teamMembers[0];
        await addAIMessage(teamMember, response);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback to simple response
      const fallbackMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];
      await addAIMessage(fallbackMember, "I understand. Let's continue planning our sprint with these stories.");
    }
  };

  // Voice Input (similar to refinement meeting)
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
        // First populate the input field
        setUserInput(transcribedText);
        
        // Wait a moment for user to see the transcribed text
        setTimeout(async () => {
          console.log('📤 Auto-sending transcribed message');
          await handleSendMessage(transcribedText);
        }, 1000);
      } else {
        console.warn('❌ No transcription received or transcription was empty');
        setUserInput('');
      }
    } catch (error) {
      console.error('❌ Error transcribing audio:', error);
      setUserInput('');
      if (error instanceof Error && error.message.includes('API key')) {
        console.warn('💡 Hint: Make sure VITE_OPENAI_API_KEY is set in your .env file');
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleEndMeeting = async () => {
    if (!meetingStarted) return;

    try {
      // Calculate accepted and rejected stories based on Jira-style planning
      const acceptedStories = stories.filter(s => sprintStories.includes(s.id));
      const rejectedStories = stories.filter(s => backlogStories.includes(s.id));

      const results: SprintPlanningResults = {
        transcript,
        acceptedStories,
        rejectedStories,
        duration: Date.now() - meetingStartTime
      };

      onMeetingEnd(results);
    } catch (error) {
      console.error('Error ending sprint planning meeting:', error);
      onMeetingEnd({
        transcript,
        acceptedStories: stories.filter(s => sprintStories.includes(s.id)),
        rejectedStories: stories.filter(s => backlogStories.includes(s.id)),
        duration: Date.now() - meetingStartTime
      });
    }
  };

  // Participant Card Component
  const ParticipantCard: React.FC<{
    participant: { name: string };
    isCurrentSpeaker: boolean;
    isUser: boolean;
  }> = ({ participant, isCurrentSpeaker, isUser }) => (
    <div className={`relative bg-gray-800 rounded-lg p-4 border-2 transition-all duration-300 ${
      isCurrentSpeaker ? 'border-green-500 ring-2 ring-green-500/30' : 'border-gray-600'
    }`}>
      <div className="flex flex-col items-center space-y-2">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
          isCurrentSpeaker ? 'bg-green-600' : 'bg-gray-700'
        }`}>
          {isUser ? '👤' : teamMembers.find(m => m.name === participant.name)?.avatar || '🤖'}
        </div>
        
        <div className="text-center">
          <div className="text-white font-medium text-sm">{participant.name}</div>
          {!isUser && (
            <div className="text-gray-400 text-xs">
              {teamMembers.find(m => m.name === participant.name)?.role}
            </div>
          )}
        </div>
        
        {isCurrentSpeaker && (
          <div className="absolute -top-1 -right-1">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <Volume2 className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col z-50 overflow-hidden">
      {/* Header */}
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
                <span className="font-medium">Sprint Planning - Live</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Sprint Planning - Ready to Start</span>
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
        {/* Left Side - Modern Jira-style Sprint Planning */}
        <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 text-gray-900 overflow-hidden border-r border-slate-200">
          <div className="h-full flex flex-col">
            {/* Modern Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">Sprint Planning</h1>
                    <p className="text-blue-100 text-sm">Plan your next sprint with AI-powered team collaboration</p>
                  </div>
                  {!meetingStarted && (
                    <button
                      onClick={startMeeting}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl border border-white/20"
                    >
                      <Play size={20} />
                      <span>Start Planning Session</span>
                    </button>
                  )}
                </div>
                
                {/* Enhanced Sprint Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Sprint Capacity</p>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl font-bold">{currentSprintPoints}</span>
                          <span className="text-blue-200">/ {sprintCapacity}</span>
                        </div>
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        currentSprintPoints > sprintCapacity ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'
                      }`}>
                        {currentSprintPoints > sprintCapacity ? '⚠️' : '✓'}
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          currentSprintPoints > sprintCapacity ? 'bg-red-400' : 'bg-green-400'
                        }`}
                        style={{ width: `${Math.min((currentSprintPoints / sprintCapacity) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Issues in Sprint</p>
                        <p className="text-2xl font-bold">{sprintStories.length}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-200 flex items-center justify-center text-xl">
                        🎯
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Backlog</p>
                        <p className="text-2xl font-bold">{backlogStories.length}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-200 flex items-center justify-center text-xl">
                        📋
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Vertical Layout - Sprint & Backlog */}
            <div className="flex-1 flex flex-col bg-white/50 backdrop-blur-sm">
              {/* Sprint Section - Top */}
              <div className="border-b border-slate-200 flex flex-col shadow-sm">
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-200/50 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
                      S1
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-800 text-lg">Sprint 1</h3>
                      <p className="text-emerald-600 text-sm font-medium">
                        {sprintStories.length} {sprintStories.length === 1 ? 'issue' : 'issues'} • {currentSprintPoints} of {sprintCapacity} story points
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {currentSprintPoints > sprintCapacity && (
                      <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium border border-red-200">
                        ⚠️ Over capacity by {currentSprintPoints - sprintCapacity} points
                      </div>
                    )}
                    <div className="text-emerald-600 text-sm font-medium bg-emerald-100/50 px-3 py-1 rounded-full border border-emerald-200">
                      📋 → 🎯 Drop zone
                    </div>
                  </div>
                </div>
                
                <div 
                  className="min-h-[250px] max-h-[350px] overflow-y-auto bg-white/80 backdrop-blur-sm"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'sprint')}
                >
                  {sprintStories.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-slate-500 bg-gradient-to-br from-emerald-25 to-blue-25">
                      <div className="text-center p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-emerald-200/50 shadow-lg">
                        <div className="text-4xl mb-4">🎯</div>
                        <h4 className="font-semibold text-slate-700 mb-2">Start Planning Your Sprint</h4>
                        <p className="text-sm text-slate-600 mb-4">Drag refined issues from the backlog below to commit them to this sprint</p>
                        <div className="flex items-center justify-center space-x-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          <span>💡</span>
                          <span>Capacity: {sprintCapacity} story points available</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2">
                      <table className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <thead className="bg-gradient-to-r from-emerald-50 to-blue-50">
                          <tr>
                            <th className="text-left py-4 px-6 text-xs font-bold text-emerald-700 uppercase tracking-wider">Issue</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-emerald-700 uppercase tracking-wider">Summary</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-emerald-700 uppercase tracking-wider">Priority</th>
                            <th className="text-center py-4 px-6 text-xs font-bold text-emerald-700 uppercase tracking-wider">Points</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-emerald-700 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sprintStories.map((storyId, index) => {
                            const story = stories.find(s => s.id === storyId);
                            if (!story) return null;
                            
                            return (
                              <tr 
                                key={storyId}
                                draggable
                                onDragStart={(e) => handleDragStart(e, storyId)}
                                className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 cursor-move transition-all duration-200 group"
                                onClick={() => openStoryEditor(story)}
                              >
                                <td className="py-4 px-6">
                                  <div className="flex items-center space-x-3">
                                    <GripVertical size={14} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                    <div className="flex items-center space-x-2">
                                      <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold flex items-center justify-center">
                                        {index + 1}
                                      </div>
                                      <span className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">{story.ticketNumber}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="max-w-md">
                                    <p className="font-semibold text-slate-900 text-sm mb-1 group-hover:text-emerald-700 transition-colors">{story.title}</p>
                                    {story.description && (
                                      <p className="text-xs text-slate-600 line-clamp-1">{story.description}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(story.priority)} shadow-sm`}>
                                    {story.priority}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700">
                                    {story.storyPoints || '?'}
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 shadow-sm">
                                    ✅ In Sprint
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Backlog Section - Bottom */}
              <div className="flex-1 flex flex-col">
                <div className="bg-gradient-to-r from-slate-100 to-purple-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                      📋
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Product Backlog</h3>
                      <p className="text-slate-600 text-sm font-medium">
                        {backlogStories.length} refined {backlogStories.length === 1 ? 'issue' : 'issues'} ready for planning
                      </p>
                    </div>
                  </div>
                  <div className="text-purple-600 text-sm font-medium bg-purple-100/50 px-3 py-1 rounded-full border border-purple-200">
                    🎯 ← Drag to sprint
                  </div>
                </div>
                
                <div 
                  className="flex-1 overflow-y-auto bg-white/80 backdrop-blur-sm"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'backlog')}
                >
                  {backlogStories.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-slate-500">
                      <div className="text-center p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-purple-200/50 shadow-lg">
                        <div className="text-4xl mb-4">🎉</div>
                        <h4 className="font-semibold text-slate-700 mb-2">Sprint Fully Planned!</h4>
                        <p className="text-sm text-slate-600">All refined issues have been committed to the sprint</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2">
                      <table className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <thead className="bg-gradient-to-r from-slate-50 to-purple-50 sticky top-0">
                          <tr>
                            <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Issue</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Summary</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Priority</th>
                            <th className="text-center py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Points</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {backlogStories.map(storyId => {
                            const story = stories.find(s => s.id === storyId);
                            if (!story) return null;
                            
                            return (
                              <tr 
                                key={storyId}
                                draggable
                                onDragStart={(e) => handleDragStart(e, storyId)}
                                className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50 cursor-move transition-all duration-200 group"
                                onClick={() => openStoryEditor(story)}
                              >
                                <td className="py-4 px-6">
                                  <div className="flex items-center space-x-3">
                                    <GripVertical size={14} className="text-slate-400 group-hover:text-purple-500 transition-colors" />
                                    <div className="flex items-center space-x-2">
                                      <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center">
                                        📋
                                      </div>
                                      <span className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">{story.ticketNumber}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="max-w-md">
                                    <p className="font-semibold text-slate-900 text-sm mb-1 group-hover:text-purple-700 transition-colors">{story.title}</p>
                                    {story.description && (
                                      <p className="text-xs text-slate-600 line-clamp-1">{story.description}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(story.priority)} shadow-sm`}>
                                    {story.priority}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700">
                                    {story.storyPoints || '?'}
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center space-x-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 shadow-sm">
                                      ✨ Refined
                                    </span>
                                    {story.refinementScore && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                        {story.refinementScore.overall}/10
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Participants Panel */}
        <div className="w-96 bg-gray-900 border-l border-gray-700 flex flex-col overflow-hidden">
          {/* Participants Header */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-medium text-white mb-2">Sprint Planning Team</h3>
            <div className="text-sm text-gray-400">{teamMembers.length + 1} people in this meeting</div>
          </div>

          {/* Participant Video Grid */}
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

      {/* Meeting Controls */}
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

      {/* Message Input Area */}
      <div className="flex relative">
        {/* Left Side - Input Area */}
        <div className="flex-1 px-6 py-4 bg-gray-900 border-t border-gray-700 relative">
          {/* Dynamic Feedback Display */}
          {meetingStarted && (isRecording || isTranscribing) && (
            <div className="mb-3 bg-gradient-to-r from-blue-900/80 to-green-900/80 backdrop-blur-sm rounded-lg px-3 py-2 text-center border border-blue-500/30 shadow-lg">
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
            
            {/* Speak Button */}
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

          {/* Sliding Transcript Panel */}
          {meetingStarted && (
            <div 
              className={`absolute bottom-full left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-600 transition-all duration-300 ease-in-out overflow-hidden ${
                transcriptPanelOpen ? 'max-h-32' : 'max-h-0'
              }`}
            >
              {/* Transcript Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <h3 className="text-white font-medium text-sm">Sprint Planning Transcript</h3>
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
                              : 'bg-green-600 text-white'
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
          )}
        </div>
        
        {/* Right Side Spacer */}
        <div className="w-96 bg-gray-900 border-t border-gray-700"></div>
      </div>

      {/* Story Editor Modal (same as refinement meeting) */}
      {isEditingStory && editingStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto text-gray-900">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Story Details</h2>
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
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {editingStory.title}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[100px]">
                    {editingStory.description}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Acceptance Criteria</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[100px]">
                    {editingStory.acceptanceCriteria || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ticket Number</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {editingStory.ticketNumber}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {editingStory.priority}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Story Points</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {editingStory.storyPoints || 'Not estimated'}
                  </div>
                </div>

                {editingStory.refinementScore && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Refinement Score</label>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-center mb-2">
                        <span className="text-2xl font-bold text-green-600">
                          {editingStory.refinementScore.overall}/10
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-gray-600">Clarity</div>
                          <div className="font-medium">{editingStory.refinementScore.clarity}/10</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">Complete</div>
                          <div className="font-medium">{editingStory.refinementScore.completeness}/10</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">Testable</div>
                          <div className="font-medium">{editingStory.refinementScore.testability}/10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setIsEditingStory(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};