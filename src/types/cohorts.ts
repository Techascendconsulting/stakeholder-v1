/**
 * TypeScript interfaces for Cohorts feature
 * Matches the database schema defined in supabase/migrations/20250108000000_create_cohorts.sql
 */

export type CohortVisibilityScope = 'public' | 'private' | 'draft';
export type CohortStatus = 'active' | 'archived' | 'upcoming' | 'completed';
export type CohortStudentStatus = 'active' | 'inactive' | 'removed';
export type CohortSessionStatus = 'scheduled' | 'completed' | 'cancelled';

/**
 * Cohort - Main cohort/group entity
 */
export interface Cohort {
  id: string;
  name: string;
  start_date: string; // ISO date string
  end_date?: string | null; // ISO date string
  coach_user_id?: string | null;
  visibility_scope: CohortVisibilityScope;
  description?: string | null;
  max_capacity?: number | null;
  status: CohortStatus;
  created_by?: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * CohortStudent - Junction table linking students to cohorts
 */
export interface CohortStudent {
  id: string;
  cohort_id: string;
  user_id: string;
  joined_at: string; // ISO timestamp
  status: CohortStudentStatus;
  notes?: string | null;
}

/**
 * CohortSession - Individual scheduled session for a cohort
 */
export interface CohortSession {
  id: string;
  cohort_id: string;
  session_date: string; // ISO timestamp
  session_end_time?: string | null; // ISO timestamp
  meeting_link: string;
  topic?: string | null;
  description?: string | null;
  status: CohortSessionStatus;
  created_by?: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Cohort with additional computed fields (for UI)
 */
export interface CohortWithDetails extends Cohort {
  coach_name?: string;
  student_count?: number;
  next_session?: CohortSession | null;
  sessions?: CohortSession[];
}

/**
 * User's cohort info (for dashboard display)
 */
export interface UserCohortInfo {
  cohort: Cohort;
  next_session?: CohortSession | null;
  upcoming_sessions: CohortSession[];
}

/**
 * Request types for creating/updating entities
 */
export interface CreateCohortRequest {
  name: string;
  start_date: string;
  end_date?: string | null;
  coach_user_id?: string | null;
  visibility_scope?: CohortVisibilityScope;
  description?: string | null;
  max_capacity?: number | null;
  status?: CohortStatus;
}

export interface UpdateCohortRequest {
  name?: string;
  start_date?: string;
  end_date?: string | null;
  coach_user_id?: string | null;
  visibility_scope?: CohortVisibilityScope;
  description?: string | null;
  max_capacity?: number | null;
  status?: CohortStatus;
}

export interface CreateCohortSessionRequest {
  cohort_id: string;
  session_date: string;
  session_end_time?: string | null;
  meeting_link: string;
  topic?: string | null;
  description?: string | null;
  status?: CohortSessionStatus;
}

export interface UpdateCohortSessionRequest {
  session_date?: string;
  session_end_time?: string | null;
  meeting_link?: string;
  topic?: string | null;
  description?: string | null;
  status?: CohortSessionStatus;
}

export interface AssignStudentRequest {
  cohort_id: string;
  user_id: string;
  notes?: string | null;
}

