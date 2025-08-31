// Export all types
export * from './meeting';
export * from './chat';

// AppView type definition
export type AppView = 
  | 'welcome'
  | 'get-started'
  | 'dashboard'
  | 'core-concepts'
  | 'agile-scrum'
  | 'practice-lab'
  | 'progress-tracking'
  | 'certifications'
  | 'project-workspace'
  | 'meeting-history'
  | 'portfolio'
  | 'create-project'
  | 'ba-fundamentals'
  | 'process-mapper'
  | 'process-mapper-editor'
  | 'advanced-topics'
  | 'guided-practice-hub'
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
  | 'project-practice'
  | 'stakeholder-interview';

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