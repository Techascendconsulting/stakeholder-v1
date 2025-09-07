// Export all types
export * from './meeting';
export * from './chat';

// AppView type definition
export type AppView = 
  | 'welcome'
  | 'get-started'
  | 'dashboard'
  | 'learn'
  | 'practice'
  | 'core-concepts'
  | 'agile-scrum'
  | 'scrum-essentials'
  | 'agile-practice'
  | 'progress-tracking'
  | 'project-workspace'
  | 'meeting-history'
  | 'portfolio'
  | 'create-project'
  | 'ba-fundamentals'
  | 'process-mapper'
  | 'process-mapper-editor'
  | 'diagram-creation'
  | 'advanced-topics'
  | 'projects'
  | 'project-setup'
  | 'meeting'
  | 'voice-only-meeting'
  | 'meeting-summary'
  | 'meeting-details'
  | 'raw-transcript'
  | 'notes'
  | 'deliverables'
  | 'profile'
  | 'analysis'
  | 'custom-project'
  | 'custom-stakeholders'
  | 'agile-hub'
  | 'elevenlabs-meeting'
  | 'individual-agent-meeting'
  | 'enhanced-training-flow'
  | 'training-hub'
  | 'training-practice'
  | 'training-assess'
  | 'training-feedback'
  | 'training-dashboard'
  | 'training-deliverables'
  | 'project-deliverables'
  | 'my-meetings'
  | 'voice-meeting'
  | 'settings'
  | 'project-brief'
  | 'stakeholders'
  | 'meeting-mode-selection'
  | 'structured-training'
  | 'pre-brief'
  | 'live-training-meeting'
  | 'post-brief';

// Re-export specific types for convenience
export type {
  Message,
  DirectMessage,
  UserProfile,
  MessageThread,
  PinnedMessage,
  TypingIndicator,
  SearchResult,
  Conversation,
  Channel,
  MessageReaction,
  SearchResponse,
  ConversationListResponse,
  UserProfileResponse
} from './chat';