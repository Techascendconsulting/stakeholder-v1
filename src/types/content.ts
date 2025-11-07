export type UnitType = 'module' | 'lesson' | 'topic';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'stale';

export interface ContentUnitRef {
  unitType: UnitType;
  stableKey: string;
  contentVersion: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  unit_type: UnitType;
  stable_key: string;
  content_version: number;
  status: ProgressStatus;
  percent: number;            // 0..100
  last_position: any;         // JSON (video time, page index, etc.)
  completed_at: string | null;
  updated_at: string;
}

export interface Module {
  id: string;
  stable_key: string;
  title: string;
  content: any;
  content_version: number;
  position: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  stable_key: string;
  title: string;
  content: any;
  content_version: number;
  position: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  lesson_id: string;
  stable_key: string;
  title: string;
  content: any;
  content_version: number;
  position: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

