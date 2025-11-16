export type StepType =
  | 'video'
  | 'image'
  | 'audio'
  | 'text'
  | 'task'
  | 'reflection'
  | 'button'
  | 'checklist'
  | 'placeholder';

export type ProgressStatus = 'locked' | 'unlocked' | 'completed';

export interface Phase {
  id: string;
  slug: string;
  title: string;
  order: number;
}

export interface Section {
  id: string;
  phaseId: string;
  slug: string;
  title: string;
  order: number;
}

export interface Step {
  id: string;
  sectionId: string;
  title: string;
  order: number;
  stepType: StepType;
  payload?: Record<string, unknown>;
}

export interface StepProgress {
  stepId: string;
  status: ProgressStatus;
}

export interface FeatureState {
  phases: Phase[];
  sections: Section[];
  steps: Step[];
  progress: Record<string, ProgressStatus>; // key: stepId
}


