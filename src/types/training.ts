// Training Hub Types - Complete System

export type TrainingStage = 'problem_exploration' | 'as_is' | 'to_be' | 'solution_design';

export interface TrainingQuestion {
  id: string;
  stage: TrainingStage;
  text: string;
  skill: string;
  tone: 'professional' | 'nigerian';
  order: number;
}

export interface MustCoverArea {
  id: string;
  title: string;
  description: string;
  keywords: string[];
}

export interface ModelQA {
  question: string;
  answer: string;
  skill: string;
}

export interface MicroDrill {
  id: string;
  type: 'closed_to_open' | 'best_followup' | 'no_early_solutioning';
  prompt: string;
  choices?: string[];
  answer: string;
  explanation: string;
}

export interface CheatCard {
  id: string;
  text: string;
  skill: string;
  tone: 'professional' | 'nigerian';
}

export interface LearnContent {
  stageId: TrainingStage;
  objective: string;
  mustCovers: MustCoverArea[];
  modelQAs: ModelQA[];
  drills: MicroDrill[];
  cheatCards: CheatCard[];
}

export interface TrainingSession {
  id: string;
  projectId: string;
  stage: TrainingStage;
  mode: 'practice' | 'assess';
  status: 'pre_brief' | 'live_meeting' | 'post_brief' | 'completed';
  startTime: Date;
  endTime?: Date;
  currentQuestionIndex: number;
  questions: TrainingQuestion[];
  messages: any[];
  coverage: Record<string, boolean>;
  hintEvents: HintEvent[];
}

export interface HintEvent {
  id: string;
  sessionId: string;
  stageId: TrainingStage;
  cardId?: string;
  eventType: 'shown' | 'clicked' | 'edited' | 'asked';
  payload: any;
  timestamp: Date;
}

export interface TrainingProgress {
  stage: TrainingStage;
  learnCompleted: boolean;
  practicePassed: boolean;
  assessPassed: boolean;
  coverageScore: number;
  independenceScore: number;
  techniqueScore: number;
  overallScore: number;
}

export interface TrainingFeedback {
  stage: TrainingStage;
  coverageAnalysis: {
    covered: string[];
    missed: string[];
    score: number;
  };
  independenceAnalysis: {
    unaided: string[];
    edited: string[];
    verbatim: string[];
    volunteered: string[];
    score: number;
  };
  techniqueAnalysis: {
    openQuestions: number;
    followUps: number;
    talkBalance: number;
    earlySolutioning: boolean;
    score: number;
  };
  nextTimeScripts: string[];
  overallScore: number;
  passed: boolean;
}

export interface StudyPack {
  stageId: TrainingStage;
  weakAreas: string[];
  miniLessons: string[];
  drills: MicroDrill[];
  retakeAvailable: boolean;
}

export interface UserCredits {
  practiceCredits: number;
  assessCredits: number;
  totalCredits: number;
}

export interface TrainingConfig {
  project: any;
  stage: TrainingStage;
  mode: 'practice' | 'assess';
}
