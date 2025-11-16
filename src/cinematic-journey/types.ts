export type StepType = "video" | "email" | "text" | "task";

export interface JourneyStep {
  id: string;            // e.g. "s1"
  order: number;         // 1..5
  title: string;
  type: StepType;
  summary: string;       // one-line description
  content?: string;      // placeholder for now
}

export interface JourneyPhase {
  id: string;            // "p0".."p9"
  order: number;         // 0..9
  code: string;          // "P0","P1", etc.
  title: string;
  description: string;
  steps: JourneyStep[];
}

export type JourneyPhases = JourneyPhase[];


