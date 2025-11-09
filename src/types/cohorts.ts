/**
 * TypeScript interfaces for Cohorts feature
 * Matches the database schema defined in supabase/migrations/20250108000001_cohorts_complete_setup.sql
 */

export type CohortStatus = 'draft' | 'active' | 'archived';
export type CohortStudentRole = 'student' | 'coach';

/**
 * Cohort - Main cohort/group entity
 */
export interface Cohort {
  id: string;
  name: string;
  description?: string | null;
  coach_user_id?: string | null;
  status: CohortStatus;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * CohortStudent - Junction table linking students to cohorts
 */
export interface CohortStudent {
  cohort_id: string;
  user_id: string;
  role: CohortStudentRole;
  joined_at: string; // ISO timestamp
}

/**
 * CohortSession - Individual scheduled session for a cohort
 */
export interface CohortSession {
  id: string;
  cohort_id: string;
  starts_at: string; // ISO timestamp
  duration_minutes?: number | null;
  meeting_link?: string | null;
  topic?: string | null;
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
  description?: string | null;
  coach_user_id?: string | null;
  status?: CohortStatus;
}

export interface UpdateCohortRequest {
  name?: string;
  description?: string | null;
  coach_user_id?: string | null;
  status?: CohortStatus;
}

export interface CreateCohortSessionRequest {
  cohort_id: string;
  starts_at: string;
  duration_minutes?: number | null;
  meeting_link?: string | null;
  topic?: string | null;
}

export interface UpdateCohortSessionRequest {
  starts_at?: string;
  duration_minutes?: number | null;
  meeting_link?: string | null;
  topic?: string | null;
}

export interface AssignStudentRequest {
  cohort_id: string;
  user_id: string;
  role?: CohortStudentRole;
}

