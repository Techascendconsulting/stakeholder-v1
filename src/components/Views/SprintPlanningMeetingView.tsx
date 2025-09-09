import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, PhoneOff, GripVertical, FileText, ChevronDown, X } from 'lucide-react';
import { isConfigured as elevenConfigured, synthesizeToBlob } from '../../services/elevenLabsTTS';
import { playBrowserTTS } from '../../lib/browserTTS';
import { playPreGeneratedAudio, findPreGeneratedAudio, stopAllAudio } from '../../services/preGeneratedAudioService';

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
  onMeetingEnd: (results: any) => void;
  onClose: () => void;
}



// Helper functions
const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};


const ParticipantCard: React.FC<{
  participant: { name: string; avatarUrl?: string };
  isCurrentSpeaker: boolean;
  isUser: boolean;
}> = ({ participant, isCurrentSpeaker, isUser }) => {

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
          <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold mb-2">
              {getInitials(participant.name)}
            </div>
            <span className="text-white text-sm font-medium">{participant.name}</span>
          </div>
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
  onMeetingEnd,
  onClose
}) => {
  
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
    role: 'Business Analyst',
    avatar: '👨‍💼',
      isAI: true,
      voiceId: 'neMPCpWtBwWZhxEC8qpe',
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
    role: 'Developer',
    avatar: '👩‍💻',
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
  const [productBacklog, setProductBacklog] = useState<AgileTicket[]>([]);
  const [sprintBacklog, setSprintBacklog] = useState<AgileTicket[]>([]);

  // Audio and meeting state management
  const [currentSpeaking, setCurrentSpeaking] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isMeetingActive] = useState(true);
  const [meetingTranscript, setMeetingTranscript] = useState<MeetingMessage[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isMeetingRunning, setIsMeetingRunning] = useState(false);
  const [transcriptPanelOpen, setTranscriptPanelOpen] = useState(false);
  const [isMeetingPaused, setIsMeetingPaused] = useState(false);
  const [currentlyDiscussing, setCurrentlyDiscussing] = useState<string | null>(null);
  
  // Refs for meeting control
  const meetingCancelledRef = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Sprint Planning audio segments with drag actions
  const sprintPlanningSegments = [
    { id: 'sarah-opening-planning', speaker: 'Sarah', text: "Welcome everyone. This is our Sprint Planning session. Our aim today is to agree on a Sprint Goal and decide which backlog items we can commit to for the sprint. Victor, can you walk us through the Sprint Goal?", dragAction: null },
    { id: 'victor-goal', speaker: 'Victor', text: "Thanks Sarah. The Sprint Goal I'd like to propose is: Strengthen account security and verification—send confirmation after password resets and deliver the basic ID upload step. We have three refined backlog items on top: the tenant maintenance attachments, the password reset confirmation email, and the ID upload verification feature.", dragAction: null },
    { id: 'sarah-capacity', speaker: 'Sarah', text: "Great. Before we start pulling stories, let's quickly confirm capacity. Srikanth, how's the dev side looking this sprint?", dragAction: null },
    { id: 'srikanth-capacity', speaker: 'Srikanth', text: "On the dev side, we have our full team except for Lisa taking a day off. That means about 80% of our usual capacity. I'd say around 20 story points.", dragAction: null },
    { id: 'lisa-capacity', speaker: 'Lisa', text: "Yes, that's about right. I think we can take 2 medium stories and one larger one if we slice it properly.", dragAction: null },
    { id: 'tom-capacity', speaker: 'Tom', text: "From QA, I can handle the full regression and story testing, but if we take on too much edge-case work, it may spill over.", dragAction: null },
    { id: 'sarah-transition', speaker: 'Sarah', text: "Alright, let's look at the first item together.", dragAction: 'move-maintenance-to-discussing' },
    { id: 'victor-attachments', speaker: 'Victor', text: "The first item is Tenant can upload attachments to support maintenance requests. The user story: As a tenant, I want to upload a photo or document related to my maintenance issue, so that the housing team has enough context to resolve the problem efficiently. It's already refined with file size and type rules.", dragAction: 'open-maintenance-story' },
    { id: 'srikanth-attachments', speaker: 'Srikanth', text: "From dev, we can reuse our file upload component. Backend will go into S3, so this is straightforward.", dragAction: null },
    { id: 'tom-attachments', speaker: 'Tom', text: "For QA, I'll cover oversized files, wrong formats, and multiple uploads. Should fit fine.", dragAction: null },
    { id: 'sarah-attachments', speaker: 'Sarah', text: "Great. Sounds like we're aligned. Let's commit this story to the sprint.", dragAction: 'move-maintenance-to-sprint' },
    { id: 'victor-password', speaker: 'Victor', text: "Next is Password Reset Confirmation Email. User story: As a customer, I want to receive a confirmation email after resetting my password so that I know my account has been updated successfully and can spot suspicious activity. This was sized at 2 points.", dragAction: 'open-password-story' },
    { id: 'lisa-password', speaker: 'Lisa', text: "Very small effort. We just add a template to our existing email service.", dragAction: null },
    { id: 'tom-password', speaker: 'Tom', text: "Low test effort too. I just need to check subject, body, no password leakage, and logging.", dragAction: null },
    { id: 'sarah-password', speaker: 'Sarah', text: "Excellent. Let's move this into the sprint backlog as well.", dragAction: 'move-password-to-sprint' },
    { id: 'victor-idupload', speaker: 'Victor', text: "The last one is ID Upload Verification. The user story: As a customer, I want to upload my ID online so that I can complete my account verification. This is more advanced — it involves fraud detection and business rules.", dragAction: 'open-idupload-story' },
    { id: 'srikanth-idupload', speaker: 'Srikanth', text: "This could be too big for one sprint. Fraud checks and integrations are complex implementations for the sprint considering capacity and testing", dragAction: null },
    { id: 'tom-idupload', speaker: 'Tom', text: "True, Testing all fraud scenarios in one sprint isn't realistic. We risk rolling over.", dragAction: null },
    { id: 'sarah-slice', speaker: 'Sarah', text: "Good point. Let's slice this. Maybe take only the basic upload form this sprint, and defer fraud detection rules.", dragAction: 'slice-idupload' },
    { id: 'victor-slice', speaker: 'Victor', text: "Yes, that makes sense. Let's commit the base ID upload capability, Sarah please go ahead and add the story to the sprint backlog, I will amend the acceptance criteri, and create a follow-up story for fraud checks.", dragAction: null },
    { id: 'lisa-slice', speaker: 'Lisa', text: "That's much more manageable. We can do the form, validation, and storage within this sprint.", dragAction: null },
    { id: 'sarah-idcommit', speaker: 'Sarah', text: "Perfect. We'll commit the sliced version to this sprint.", dragAction: 'move-idupload-slice-to-sprint' },
    { id: 'sarah-recap', speaker: 'Sarah', text: "To recap: our Sprint Goal is to improve verification and account processes. We've committed three items — the attachment feature, the password reset confirmation email, and a sliced version of ID upload. Together, these fit our capacity and align with the goal.", dragAction: null },
    { id: 'victor-close', speaker: 'Victor', text: "Thanks everyone. I'm confident this sprint will deliver real improvements for both customers and the housing team.", dragAction: null },
    { id: 'sarah-close', speaker: 'Sarah', text: "Great collaboration. This sprint is now planned. Let's get ready to start tomorrow with confidence.", dragAction: null }
  ];


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

  // Audio playback functions
  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setCurrentSpeaking(null);
    
    // Stop all audio elements globally
    stopAllAudio();
  };

  const playMessageAudio = async (text: string, teamMember: SprintPlanningMember, autoPlay: boolean = true): Promise<void> => {
    if (!autoPlay) {
      return Promise.resolve();
    }

    try {
      stopCurrentAudio();
      
      if (meetingCancelledRef.current) {
        console.log(`🚫 Meeting cancelled, skipping audio for ${teamMember.name}`);
        return Promise.resolve();
      }

      setCurrentSpeaking(teamMember.name);

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
          setCurrentSpeaking(null);
          return Promise.resolve();
        } catch (error) {
          console.error('❌ Pre-generated audio failed, falling back to ElevenLabs:', error);
        }
      }

      // Fallback to ElevenLabs or Browser TTS
      let audioElement: HTMLAudioElement | null = null;

      if (elevenConfigured()) {
        try {
          console.log(`✅ Using ElevenLabs for team member: ${teamMember.name}`);
          const audioBlob = await synthesizeToBlob(text, { stakeholderName: teamMember.name }).catch(() => null as any);
          if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob);
            audioElement = new Audio(audioUrl);
          } else {
            console.warn('❌ ElevenLabs returned null, falling back to browser TTS');
          }
        } catch (err) {
          console.warn('❌ ElevenLabs failed, falling back to browser TTS:', err);
          audioElement = await playBrowserTTS(text) as unknown as HTMLAudioElement;
        }
      } else {
        console.log(`⚠️ ElevenLabs not available, using browser TTS`);
        audioElement = await playBrowserTTS(text) as unknown as HTMLAudioElement;
      }

      if (audioElement) {
        setCurrentAudio(audioElement);
        
        audioElement.onended = () => {
          console.log(`🚀 AUDIO DEBUG: ${teamMember.name} audio completed`);
          setCurrentSpeaking(null);
        };
        
        audioElement.onerror = (error) => {
          console.error(`❌ Audio error for ${teamMember.name}:`, error);
          setCurrentSpeaking(null);
        };
        
        await audioElement.play();
      }
    } catch (error) {
      console.error(`❌ Error playing audio for ${teamMember.name}:`, error);
      setCurrentSpeaking(null);
    }
  };

  // Execute drag action based on segment
  const executeDragAction = (dragAction: string | null) => {
    if (!dragAction) return;

    switch (dragAction) {
      case 'open-maintenance-story':
        // Open Maintenance Request Attachments story
        setCurrentlyDiscussing('STORY-1001');
        console.log('🎯 Drag action: Opened Maintenance Attachments story (STORY-1001)');
        console.log('🎯 Currently discussing set to:', 'STORY-1001');
        break;
      case 'open-password-story':
        // Open Password Reset story
        setCurrentlyDiscussing('STORY-1002');
        console.log('🎯 Drag action: Opened Password Reset story (STORY-1002)');
        console.log('🎯 Currently discussing set to:', 'STORY-1002');
        break;
      case 'open-idupload-story':
        // Open ID Upload story
        setCurrentlyDiscussing('STORY-1003');
        console.log('🎯 Drag action: Opened ID Upload story (STORY-1003)');
        console.log('🎯 Currently discussing set to:', 'STORY-1003');
        break;
      case 'move-maintenance-to-discussing':
        // Move Maintenance Request Attachments to currently discussing (visual highlight)
        console.log('🎯 Drag action: Move Maintenance Attachments to discussing');
        break;
      case 'move-maintenance-to-sprint':
        // Move Maintenance Request Attachments to Sprint Backlog and close story
        const maintenanceStory = productBacklog.find(story => story.ticketNumber === 'STORY-1001');
        if (maintenanceStory) {
          setProductBacklog(prev => prev.filter(story => story.id !== maintenanceStory.id));
          setSprintBacklog(prev => [...prev, { ...maintenanceStory, status: 'To Do' }]);
          setCurrentlyDiscussing(null); // Close the story
          console.log('🎯 Drag action: Moved Maintenance Attachments to Sprint Backlog and closed story');
        }
        break;
      case 'move-password-to-discussing':
        // Move Password Reset to currently discussing (visual highlight)
        console.log('🎯 Drag action: Move Password Reset to discussing');
        break;
      case 'move-password-to-sprint':
        // Move Password Reset to Sprint Backlog and close story
        const passwordStory = productBacklog.find(story => story.ticketNumber === 'STORY-1002');
        if (passwordStory) {
          setProductBacklog(prev => prev.filter(story => story.id !== passwordStory.id));
          setSprintBacklog(prev => [...prev, { ...passwordStory, status: 'To Do' }]);
          setCurrentlyDiscussing(null); // Close the story
          console.log('🎯 Drag action: Moved Password Reset to Sprint Backlog and closed story');
        }
        break;
      case 'move-idupload-to-discussing':
        // Move ID Upload to currently discussing (visual highlight)
        console.log('🎯 Drag action: Move ID Upload to discussing');
        break;
      case 'slice-idupload':
        // Slice the ID Upload story
        console.log('🎯 Drag action: Slicing ID Upload story');
        break;
      case 'move-idupload-slice-to-sprint':
        // Move sliced ID Upload to Sprint Backlog and close story
        const idUploadStory = productBacklog.find(story => story.ticketNumber === 'STORY-1003');
        if (idUploadStory) {
          setProductBacklog(prev => prev.filter(story => story.id !== idUploadStory.id));
          setSprintBacklog(prev => [...prev, { ...idUploadStory, status: 'To Do', title: 'ID Upload Verification (Basic Form)' }]);
          setCurrentlyDiscussing(null); // Close the story
          console.log('🎯 Drag action: Moved sliced ID Upload to Sprint Backlog and closed story');
        }
        break;
    }
  };

  // Run the Sprint Planning meeting
  const runSprintPlanningMeeting = async () => {
    if (isMeetingRunning) return;
    
    setIsMeetingRunning(true);
    setMeetingStarted(true);
    setCurrentSegmentIndex(0);
    setMeetingTranscript([]);
    
    console.log('🎬 Starting Sprint Planning meeting...');
    
    for (let i = 0; i < sprintPlanningSegments.length; i++) {
      if (meetingCancelledRef.current) {
        console.log('🚫 Meeting cancelled, stopping');
        break;
      }
      
      // Wait if meeting is paused
      while (isMeetingPaused && !meetingCancelledRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (meetingCancelledRef.current) {
        console.log('🚫 Meeting cancelled during pause, stopping');
        break;
      }
      
      const segment = sprintPlanningSegments[i];
      const teamMember = teamMembers.find(member => member.name === segment.speaker);
      
      if (!teamMember) {
        console.error(`❌ Team member not found: ${segment.speaker}`);
        continue;
      }
      
      setCurrentSegmentIndex(i);
      
      // Add message to transcript
      const message: MeetingMessage = {
        id: `segment-${i}`,
        speaker: segment.speaker,
        content: segment.text,
        timestamp: new Date().toISOString(),
        role: teamMember.role as any,
        stakeholderId: teamMember.name.toLowerCase()
      };
      
      setMeetingTranscript(prev => [...prev, message]);
      
      // Play audio
      await playMessageAudio(segment.text, teamMember, true);
      
      // Execute drag action if present
      if (segment.dragAction) {
        executeDragAction(segment.dragAction);
      }
      
      // Small delay between segments
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('🎉 Sprint Planning meeting completed!');
    setIsMeetingRunning(false);
  };

  // Initialize product backlog with refined stories at the top
  useEffect(() => {
    const refinedStories = stories.filter(story => story.status === 'Refined');
    const otherStories = stories.filter(story => story.status !== 'Refined');
    
    // Ensure refined stories are at the top
    const sortedStories = [...refinedStories, ...otherStories];
    setProductBacklog(sortedStories);
  }, [stories]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (transcriptEndRef.current && transcriptPanelOpen && meetingTranscript.length > 0) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [meetingTranscript, currentSegmentIndex, transcriptPanelOpen]);

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
    console.log('🚀 Sprint Planning meeting started!');
    await runSprintPlanningMeeting();
  };

  // Pause meeting
  const handlePauseMeeting = () => {
    setIsMeetingPaused(true);
    // Pause current audio if playing
    if (currentAudio) {
      currentAudio.pause();
    }
    console.log('⏸️ Sprint Planning meeting paused');
  };

  // Resume meeting
  const handleResumeMeeting = () => {
    setIsMeetingPaused(false);
    // Resume audio if it was playing
    if (currentAudio && currentAudio.paused) {
      currentAudio.play();
    }
    console.log('▶️ Sprint Planning meeting resumed');
  };

  // End meeting
  const handleEndMeeting = () => {
    // IMMEDIATELY stop all audio and reset meeting state
    meetingCancelledRef.current = true;
    stopCurrentAudio();
    setIsMeetingRunning(false);
    setIsMeetingPaused(false);
    setCurrentSpeaking(null);
    setMeetingTranscript([]);
    setCurrentSegmentIndex(0);
    setCurrentlyDiscussing(null);
    
    onMeetingEnd({
      messages: [],
      meetingDuration: 0
    });
  };

  // Close meeting
  const handleCloseMeeting = () => {
    // IMMEDIATELY stop all audio and reset meeting state
    meetingCancelledRef.current = true;
    stopCurrentAudio();
    setIsMeetingRunning(false);
    setIsMeetingPaused(false);
    setCurrentSpeaking(null);
    setCurrentlyDiscussing(null);
    
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
                Sprint Board
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

              {/* Start Sprint Button - Only shown after meeting has started */}
                  {meetingStarted && (
                    <button
                      onClick={() => {
                        console.log('🚀 Starting Sprint!');
                        // TODO: Implement sprint start functionality
                      }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-lg"
                    >
                      <Play size={20} />
                  <span>Start Sprint</span>
                    </button>
                  )}
            </div>

            {/* Sprint Backlog Section - Top - Jira Style */}
            <div className="mb-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Sprint Backlog ({sprintBacklog.length} stories)</h3>
                  </div>
                </div>
                
                <div 
                  className="min-h-[120px]"
                  onDragOver={meetingStarted ? handleDragOver : undefined}
                  onDrop={meetingStarted ? (e) => handleDrop(e, 'sprint') : undefined}
                >
                  {sprintBacklog.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-gray-500">
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
                        <p className="text-sm text-gray-500">
                          Drag stories from Product Backlog to start building your sprint
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-hidden">
                    {/* Jira-style table header */}
                    <div className="bg-gray-50 border-b border-gray-200">
                      <div className="grid grid-cols-7 gap-4 px-4 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide h-8">
                        <div className="col-span-1">KEY</div>
                        <div className="col-span-2">SUMMARY</div>
                        <div className="col-span-1">TYPE</div>
                        <div className="col-span-1">STORY POINTS</div>
                        <div className="col-span-1">PRIORITY</div>
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
                            className="grid grid-cols-7 gap-4 px-4 py-1 hover:bg-blue-50 transition-colors cursor-move border-l-4 border-l-transparent hover:border-l-blue-500 h-10"
                          >
                            {/* Key */}
                            <div className="col-span-1 flex items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 flex items-center justify-center text-gray-400 cursor-move">
                                  <GripVertical className="w-3 h-3" />
                                  </div>
                                <span className="text-sm font-medium text-blue-600">{story.ticketNumber}</span>
                          </div>
                        </div>

                            {/* Summary */}
                            <div className="col-span-2 flex items-center">
                              <div className="truncate">
                                <div className="text-sm font-medium text-gray-900 truncate">{story.title}</div>
                          </div>
                        </div>

                            {/* Type */}
                            <div className="col-span-1 flex items-center">
                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                Story
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
                    <div className="grid grid-cols-7 gap-4 px-4 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide h-8">
                      <div className="col-span-1">KEY</div>
                      <div className="col-span-2">SUMMARY</div>
                      <div className="col-span-1">TYPE</div>
                      <div className="col-span-1">STORY POINTS</div>
                      <div className="col-span-1">PRIORITY</div>
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
                        className={`grid grid-cols-7 gap-4 px-4 py-1 transition-colors border-l-4 h-10 ${
                          currentlyDiscussing === story.ticketNumber 
                            ? 'border-l-green-500 bg-green-50' 
                            : 'border-l-transparent hover:border-l-blue-500'
                        } ${
                          meetingStarted ? 'cursor-move hover:bg-blue-50' : 'cursor-pointer hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          console.log('🔍 Story clicked:', story.ticketNumber);
                          console.log('🔍 Currently discussing:', currentlyDiscussing);
                          console.log('🔍 Match:', currentlyDiscussing === story.ticketNumber);
                        }}
                      >
                        {/* Key */}
                        <div className="col-span-1 flex items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 flex items-center justify-center text-gray-400 cursor-move">
                              <GripVertical className="w-3 h-3" />
                                         </div>
                            <span className="text-sm font-medium text-blue-600">{story.ticketNumber}</span>
                                       </div>
                                     </div>
                        
                        {/* Summary */}
                        <div className="col-span-2 flex items-center">
                          <div className="truncate">
                            <div className="text-sm font-medium text-gray-900 truncate">{story.title}</div>
                          </div>
                        </div>
                        
                        {/* Type */}
                        <div className="col-span-1 flex items-center">
                          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Story
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
                isCurrentSpeaker={currentSpeaking === 'Sarah'}
                isUser={false}
              />
                <ParticipantCard
                participant={teamMembers.find(m => m.name === 'Victor') || teamMembers[1]}
                isCurrentSpeaker={currentSpeaking === 'Victor'}
                  isUser={false}
                />
                  <ParticipantCard
                participant={teamMembers.find(m => m.name === 'Srikanth') || teamMembers[2]}
                isCurrentSpeaker={currentSpeaking === 'Srikanth'}
                    isUser={false}
                  />

              {/* Row 2: Lisa, Tom, User */}
                  <ParticipantCard
                participant={teamMembers.find(m => m.name === 'Lisa') || teamMembers[3]}
                isCurrentSpeaker={currentSpeaking === 'Lisa'}
                    isUser={false}
                  />
              <ParticipantCard
                participant={teamMembers.find(m => m.name === 'Tom') || teamMembers[4]}
                isCurrentSpeaker={currentSpeaking === 'Tom'}
                isUser={false}
              />
              <ParticipantCard
                participant={{ name: 'You' }}
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
            {/* Pause/Resume Button */}
            <button
              onClick={isMeetingPaused ? handleResumeMeeting : handlePauseMeeting}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isMeetingPaused 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
              title={isMeetingPaused ? 'Resume Meeting' : 'Pause Meeting'}
            >
              {isMeetingPaused ? (
                <Play className="w-4 h-4 text-white" />
              ) : (
                <Pause className="w-4 h-4 text-white" />
              )}
            </button>

            {/* End Meeting Button */}
            <button
              onClick={handleEndMeeting}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 transition-colors"
              title="End Meeting"
            >
              <PhoneOff className="w-4 h-4 text-white" />
            </button>

            {/* Transcript Toggle Button */}
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
          </div>
        </div>
      )}

      {/* Message Input Area - Basic */}
      <div className="flex relative">
        {/* Left Side - Input Area */}
        <div className="flex-1 px-6 py-4 bg-gray-900 border-t border-gray-700 relative">
          {/* Transcript Panel - slides up from input area */}
            <div 
              className={`absolute bottom-full left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-600 transition-all duration-300 ease-in-out overflow-hidden ${
                transcriptPanelOpen ? 'max-h-32' : 'max-h-0'
              }`}
            >
              {/* Transcript Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-600">
                <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <h3 className="text-white font-medium text-sm">Transcript</h3>
                <span className="text-gray-400 text-xs">({meetingTranscript.length})</span>
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
                  onClick={() => setMeetingTranscript([])}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                    title="Clear transcript"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Transcript Content */}
              <div className="overflow-y-auto p-3 space-y-2" style={{ height: '80px' }}>
              {meetingTranscript.length === 0 ? (
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
                  {meetingTranscript.map((message) => (
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
              <Play className="w-4 h-4 text-white" />
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