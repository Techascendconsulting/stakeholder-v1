// Training System Types - Shared between frontend and backend

export type StageId = 'problem_exploration'|'as_is'|'to_be'|'solution_design';

export interface StagePack { 
  id: StageId; 
  name: string; 
  objective: string; 
  must_cover: string[]; 
}

export interface QuestionCard { 
  id: string; 
  stage_id: StageId; 
  skill: string; 
  text: string; 
  tone_tags: ('professional'|'nigerian')[]; 
}

export interface CoverageFlags { 
  [key: string]: boolean | number; 
}

export interface TechniqueStats { 
  open_ratio: number; 
  follow_up: number; 
  talk_balance: number; 
  early_solutioning: boolean; 
}

export interface Debrief { 
  coverage_scores: CoverageFlags; 
  technique: TechniqueStats; 
  passed: boolean; 
  next_time_scripts: string[]; 
}

export interface MeetingSession {
  id: string;
  series_id: string;
  coach_mode: 'high' | 'medium' | 'off';
  minutes_cap: number;
  turns_cap: number;
  turns_used: number;
  started_at: string;
  ended_at?: string;
  coverage_flags: CoverageFlags;
  transcript_ref?: string;
  cost_stats: Record<string, any>;
}

export interface MeetingSeries {
  id: string;
  user_id: string;
  stage_id: StageId;
  pass_threshold: number;
  created_at: string;
}

export interface CoachNudge {
  reason: 'silence' | 'closed_qs' | 'solutioning' | 'miss';
  cards: QuestionCard[];
  message: string;
}

export interface MeetingEvent {
  type: 'utterance' | 'tick' | 'end';
  text?: string;
  minute?: number;
  silenceMs?: number;
  closedStreak?: number;
}

export interface MeetingReply {
  user_text: string;
}

export interface MeetingReplyResponse {
  stakeholder_text: string;
  audio_url?: string;
  updated_turns_used: number;
}

export interface DebriefRequest {
  sessionId: string;
}

export interface DebriefResponse {
  debrief: Debrief;
  session: MeetingSession;
}
