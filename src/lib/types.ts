// types.ts - Type definitions for the AI Requirements Gathering Simulation

export interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Stakeholder {
  id: string
  name: string
  role: string
  department?: string
  expertise_area?: string
  murf_voice_id?: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  name: string
  email?: string
  created_at: string
  updated_at: string
}

export interface Meeting {
  id: string
  project_id: string
  ba_id: string // This will now reference Student.id
  meeting_type: 'group' | 'individual'
  status: 'in-progress' | 'completed' | 'paused'
  started_at: string
  ended_at?: string
  duration_minutes: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  meeting_id: string
  speaker_type: 'ba' | 'stakeholder' | 'system'
  speaker_id?: string // References either Student.id or Stakeholder.id
  content: string
  audio_url?: string
  sequence_number: number
  created_at: string
  // Additional properties for UI
  stakeholderName?: string
  stakeholderRole?: string
  speaker?: string // For backward compatibility
  timestamp?: string // For backward compatibility
}

export interface StakeholderInteraction {
  id: string
  ba_id: string // This will now reference Student.id
  stakeholder_id: string
  project_id: string
  first_interaction_at: string
  total_interactions: number
  last_interaction_at: string
}

// UI-specific types
export interface AudioPlaybackState {
  isPlaying: boolean
  isPaused: boolean
  currentMessageId: string | null
  queueLength: number
  currentPosition: number
  duration: number
}

export interface QueuedMessage {
  id: string
  content: string
  speakerId: string
  stakeholderName: string
  stakeholderRole: string
  timestamp: string
  isFromMultiSpeaker: boolean
  originalMessageId?: string
}

export interface AudioMessage {
  id: string
  content: string
  speakerId: string
  stakeholderName: string
  audioUrl?: string
}

// Application state types
export interface AppState {
  currentUser: Student | null // Changed from BusinessAnalyst
  selectedProject: Project | null
  selectedStakeholders: Stakeholder[]
  projects: Project[]
  stakeholders: Stakeholder[]
  currentMeeting: Meeting | null
  isLoading: boolean
  error: string | null
}

// API response types
export interface ApiResponse<T> {
  data: T
  error?: string
  success: boolean
}

// Environment variables type
export interface EnvironmentConfig {
  VITE_OPENAI_API_KEY: string
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
  VITE_MURF_API_KEY: string
}

// Component prop types
export interface MeetingViewProps {
  selectedProject: Project | null
  selectedStakeholders: Stakeholder[]
  currentUser: Student // Changed from BusinessAnalyst
}

export interface ProjectSelectorProps {
  projects: Project[]
  selectedProject: Project | null
  onProjectSelect: (project: Project | null) => void
  isLoading?: boolean
}

export interface StakeholderSelectorProps {
  stakeholders: Stakeholder[]
  selectedStakeholders: Stakeholder[]
  onStakeholdersChange: (stakeholders: Stakeholder[]) => void
  maxSelections?: number
  isLoading?: boolean
}

export interface AudioControlsProps {
  audioState: AudioPlaybackState
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onSkip: () => void
}

// Database operation types
export interface CreateMeetingParams {
  projectId: string
  baId: string // This will now be a Student ID
  stakeholderIds: string[]
  meetingType: 'group' | 'individual'
}

export interface SaveMessageParams {
  meetingId: string
  speakerType: 'ba' | 'stakeholder' | 'system'
  content: string
  speakerId?: string
  audioUrl?: string
}

// AI response types
export interface AIResponseParams {
  project: Project
  allStakeholders: Stakeholder[]
  messages: Message[]
  userMessage: string
  baId: string // This will now be a Student ID
  firstInteractionStatus: Record<string, boolean>
}

export interface AIResponse {
  id: string
  speaker: string
  content: string
  timestamp: string
  stakeholderName: string
  stakeholderRole: string
}

// TTS types (now using Murf)
export interface TTSRequest {
  text: string
  voiceId: string
  outputFormat?: string
}

export interface TTSResponse {
  audioUrl: string
  duration: number
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export type SpeakerType = 'ba' | 'stakeholder' | 'system'

export type MeetingStatus = 'in-progress' | 'completed' | 'paused'

export type MeetingType = 'group' | 'individual'

// Event handler types
export type MessageHandler = (message: QueuedMessage) => void

export type StateChangeHandler = (state: AudioPlaybackState) => void

export type ErrorHandler = (error: AppError) => void

// Refinement Meeting Types with Murf TTS
interface RefinementTeamMember {
  id: string;
  name: string;
  role: 'Scrum Master' | 'Senior Developer' | 'Developer' | 'QA Tester';
  voiceId: string; // Murf TTS voice ID
  nationality: string;
  personality: string;
  focusAreas: string[];
  avatar?: string;
}

interface RefinementMessage {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerRole: string;
  message: string;
  timestamp: string;
  isUser: boolean;
  audioUrl?: string; // Murf TTS generated audio
  isPlaying?: boolean;
}

interface RefinementMeetingState {
  id: string;
  stories: AgileTicket[];
  currentStoryIndex: number;
  phase: 'intro' | 'story-review' | 'discussion' | 'estimation' | 'summary' | 'completed';
  messages: RefinementMessage[];
  currentSpeaker: string | null;
  isWaitingForUser: boolean;
  startedAt: string;
  scores: {
    [storyId: string]: {
      clarity: number;
      completeness: number;
      testability: number;
      overall: number;
    };
  };
  suggestions: {
    [storyId: string]: string[];
  };
  kanbanColumns: {
    [columnId: string]: {
      id: string;
      title: string;
      stories: string[]; // story IDs
    };
  };
}

interface MurfTTSConfig {
  apiKey: string;
}

interface TTSRequest {
  text: string;
  voiceId: string;
  rate?: string;
  pitch?: string;
}

