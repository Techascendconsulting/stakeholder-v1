

export type TrainingStage = 'problem_exploration' | 'as_is' | 'to_be' | 'solution_design';

export interface TrainingSession {
  id: string;
  stage: TrainingStage;
  projectId: string;
  mode: 'practice' | 'assess';
  status: 'pre_brief' | 'in_progress' | 'post_brief';
  startTime: Date;
  endTime?: Date;
  currentQuestionIndex: number;
  questions: TrainingQuestion[];
  messages: any[];
  coverage: Record<string, boolean>;
  hintEvents: any[];
}

export interface TrainingQuestion {
  id: string;
  text: string;
  type: string;
  stage: TrainingStage;
  order: number;
}

export interface TrainingFeedback {
  id: string;
  sessionId: string;
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  specificFeedback: string;
  recommendations: string[];
  timestamp: Date;
}

export interface CoachingCard {
  id: string;
  phase: TrainingStage;
  skill: string;
  title: string;
  description: string;
  whyItMatters: string;
  howToAsk: string;
  examplePhrases: string[];
  whatToListenFor: string[];
  digDeeperOptions: string[];
  nextStep: string;
  isActive: boolean;
}

export interface SessionState {
  currentPhase: TrainingStage;
  phaseProgress: number;
  totalPhases: number;
  completedPhases: string[];
  currentCardId: string;
  painPoints: PainPoint[];
  sessionNotes: string[];
}

export interface PainPoint {
  id: string;
  description: string;
  whoIsAffected: string;
  frequency: string;
  impact: string;
  currentWorkaround: string;
  systemsTouched: string[];
  priority: 'High' | 'Medium' | 'Low';
  confirmed: boolean;
}

export interface CoachingPanel {
  currentCard: CoachingCard | null;
  activeTab: 'guide' | 'dig-deeper' | 'interpret' | 'notes' | 'checklist';
  suggestions: string[];
  warnings: string[];
  tips: string[];
  coverage: Record<string, boolean>;
  hintEvents: any[];
  sessionNotes: string[];
  painPoints: PainPoint[];
}
