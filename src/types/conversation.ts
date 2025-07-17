export interface ConversationState {
  currentPhase: 'discovery' | 'as_is' | 'solution';
  conversationHistory: ConversationTurn[];
  activeQuestions: PendingQuestion[];
  stakeholderStates: Map<string, StakeholderState>;
  meetingContext: MeetingContext;
  lastSpeaker: string | null;
  turnPriority: TurnPriority[];
}

export interface ConversationTurn {
  id: string;
  speaker: string;
  message: string;
  timestamp: Date;
  type: 'question' | 'answer' | 'statement' | 'clarification';
  references: string[]; // IDs of previous turns this references
  isComplete: boolean;
}

export interface PendingQuestion {
  id: string;
  asker: string;
  question: string;
  target?: string; // who the question was directed to
  context: string;
  timestamp: Date;
  isAnswered: boolean;
  followUpNeeded: boolean;
}

export interface StakeholderState {
  id: string;
  name: string;
  role: string;
  personality: PersonalityProfile;
  expertise: string[];
  conversationStyle: ConversationStyle;
  currentFocus: string;
  recentContributions: string[];
  engagementLevel: number;
}

export interface PersonalityProfile {
  communicationStyle: 'direct' | 'collaborative' | 'analytical' | 'supportive';
  questioningStyle: 'detailed' | 'high-level' | 'probing' | 'clarifying';
  responseLength: 'brief' | 'moderate' | 'detailed';
  decisionMaking: 'quick' | 'thoughtful' | 'data-driven' | 'consensus-seeking';
  conflictHandling: 'avoid' | 'address' | 'mediate' | 'direct';
}

export interface ConversationStyle {
  preferredTopics: string[];
  avoidedTopics: string[];
  typicalPhrases: string[];
  responsePatterns: string[];
  engagementTriggers: string[];
}

export interface MeetingContext {
  projectName: string;
  projectDescription: string;
  uploadedDocuments: string[];
  meetingObjectives: string[];
  timeRemaining: number;
  stakeholderRoles: string[];
}

export interface TurnPriority {
  stakeholder: string;
  priority: number;
  reason: string;
  decayRate: number;
}

export interface InputAnalysis {
  type: 'question' | 'answer' | 'statement' | 'instruction' | 'frustration';
  sentiment: 'positive' | 'neutral' | 'negative';
  targetStakeholder?: string;
  referencedTopics: string[];
  answeredQuestionId?: string;
  containsNewQuestion: boolean;
  urgency: 'low' | 'medium' | 'high';
}

export interface ResponseConstraints {
  maxLength: number;
  requiredElements: string[];
  forbiddenElements: string[];
  mustReference: string[];
  tone: 'professional' | 'casual' | 'urgent' | 'supportive';
}

export interface ConversationResponse {
  selectedSpeaker: string;
  response: string;
  reasoning: string;
  updatedState: ConversationState;
  phaseTransition?: string;
  actionItems: string[];
}