/**
 * Cohort Helper Functions
 * Utilities for managing cohorts, students, and sessions
 */

import { supabase } from '../lib/supabase';
import type {
  Cohort,
  CohortStudent,
  CohortSession,
  UserCohortInfo,
  CreateCohortRequest,
  UpdateCohortRequest,
  CreateCohortSessionRequest,
  UpdateCohortSessionRequest,
  AssignStudentRequest,
  CohortWithDetails
} from '../types/cohorts';

// ============================================================================
// COHORT QUERIES
// ============================================================================

/**
 * Get user's active cohort with upcoming sessions
 * @param userId - User ID to lookup
 * @returns UserCohortInfo or null if no active cohort
 */
export async function getUserCohort(userId: string): Promise<UserCohortInfo | null> {
  try {
    console.debug('🔍 getUserCohort: Looking up cohort for user:', userId);
    
    // Get user's active cohort assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('cohort_students')
      .select('cohort_id')
      .eq('user_id', userId)
      .single();

    if (assignmentError || !assignment) {
      console.debug('📭 getUserCohort: No cohort assignment found for user');
      return null;
    }

    console.debug('✅ getUserCohort: Found cohort assignment:', assignment.cohort_id);

    // Get cohort details
    const { data: cohort, error: cohortError } = await supabase
      .from('cohorts')
      .select('*')
      .eq('id', assignment.cohort_id)
      .single();

    if (cohortError || !cohort) {
      console.error('❌ getUserCohort: Error fetching cohort:', cohortError);
      return null;
    }

    console.debug('✅ getUserCohort: Found cohort:', cohort.name);

    // Get upcoming sessions for this cohort (starts_at field, not session_date)
    const { data: sessions, error: sessionsError } = await supabase
      .from('cohort_live_sessions')
      .select('*')
      .eq('cohort_id', cohort.id)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true });

    if (sessionsError) {
      console.error('⚠️ getUserCohort: Error fetching sessions:', sessionsError);
    }

    const upcomingSessions = sessions || [];
    const nextSession = upcomingSessions[0] || null;

    console.debug(`✅ getUserCohort: Found ${upcomingSessions.length} upcoming sessions`);

    return {
      cohort: cohort as Cohort,
      next_session: nextSession as CohortSession | null,
      upcoming_sessions: upcomingSessions as CohortSession[]
    };
  } catch (error) {
    console.error('❌ getUserCohort error:', error);
    return null;
  }
}

/**
 * Get all cohorts (admin view)
 * @param filters - Optional filters for status, coach, etc.
 */
export async function getAllCohorts(filters?: {
  status?: string;
  coach_user_id?: string;
}): Promise<Cohort[]> {
  try {
    let query = supabase
      .from('cohorts')
      .select('*')
      .order('start_date', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.coach_user_id) {
      query = query.eq('coach_user_id', filters.coach_user_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching cohorts:', error);
      return [];
    }

    return data as Cohort[];
  } catch (error) {
    console.error('getAllCohorts error:', error);
    return [];
  }
}

/**
 * Get cohort by ID with details
 */
export async function getCohortById(cohortId: string): Promise<CohortWithDetails | null> {
  try {
    const { data: cohort, error: cohortError } = await supabase
      .from('cohorts')
      .select('*')
      .eq('id', cohortId)
      .single();

    if (cohortError || !cohort) {
      console.error('Error fetching cohort:', cohortError);
      return null;
    }

    // Get student count
    const { count: studentCount } = await supabase
      .from('cohort_students')
      .select('*', { count: 'exact', head: true })
      .eq('cohort_id', cohortId)
      .eq('status', 'active');

    // Get sessions
    const { data: sessions } = await supabase
      .from('cohort_live_sessions')
      .select('*')
      .eq('cohort_id', cohortId)
      .order('starts_at', { ascending: true });

    return {
      ...cohort,
      student_count: studentCount || 0,
      sessions: sessions || []
    } as CohortWithDetails;
  } catch (error) {
    console.error('getCohortById error:', error);
    return null;
  }
}

/**
 * Create a new cohort
 */
export async function createCohort(
  cohortData: CreateCohortRequest,
  createdBy: string
): Promise<Cohort | null> {
  try {
    const { data, error } = await supabase
      .from('cohorts')
      .insert({
        ...cohortData,
        created_by: createdBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating cohort:', error);
      return null;
    }

    return data as Cohort;
  } catch (error) {
    console.error('createCohort error:', error);
    return null;
  }
}

/**
 * Update an existing cohort
 */
export async function updateCohort(
  cohortId: string,
  updates: UpdateCohortRequest
): Promise<Cohort | null> {
  try {
    const { data, error } = await supabase
      .from('cohorts')
      .update(updates)
      .eq('id', cohortId)
      .select()
      .single();

    if (error) {
      console.error('Error updating cohort:', error);
      return null;
    }

    return data as Cohort;
  } catch (error) {
    console.error('updateCohort error:', error);
    return null;
  }
}

/**
 * Delete a cohort (also cascades to students and sessions)
 */
export async function deleteCohort(cohortId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cohorts')
      .delete()
      .eq('id', cohortId);

    if (error) {
      console.error('Error deleting cohort:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('deleteCohort error:', error);
    return false;
  }
}

// ============================================================================
// STUDENT ASSIGNMENT
// ============================================================================

/**
 * Assign a student to a cohort
 */
export async function assignStudentToCohort(
  assignment: AssignStudentRequest
): Promise<CohortStudent | null> {
  try {
    const { data, error } = await supabase
      .from('cohort_students')
      .insert(assignment)
      .select()
      .single();

    if (error) {
      console.error('Error assigning student:', error);
      return null;
    }

    return data as CohortStudent;
  } catch (error) {
    console.error('assignStudentToCohort error:', error);
    return null;
  }
}

/**
 * Remove a student from a cohort
 */
export async function removeStudentFromCohort(
  cohortId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cohort_students')
      .update({ status: 'removed' })
      .eq('cohort_id', cohortId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing student:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('removeStudentFromCohort error:', error);
    return false;
  }
}

/**
 * Get all students in a cohort
 */
export async function getCohortStudents(
  cohortId: string
): Promise<CohortStudent[]> {
  try {
    const { data, error } = await supabase
      .from('cohort_students')
      .select('*')
      .eq('cohort_id', cohortId)
      .eq('status', 'active')
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching cohort students:', error);
      return [];
    }

    return data as CohortStudent[];
  } catch (error) {
    console.error('getCohortStudents error:', error);
    return [];
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get all sessions for a cohort
 * @param cohortId - Cohort ID
 * @param includeCompleted - Whether to include completed/cancelled sessions
 */
export async function getCohortSessions(
  cohortId: string,
  includeCompleted: boolean = true
): Promise<CohortSession[]> {
  try {
    let query = supabase
      .from('cohort_live_sessions')
      .select('*')
      .eq('cohort_id', cohortId)
      .order('starts_at', { ascending: true });

    if (!includeCompleted) {
      query = query.eq('status', 'scheduled');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching cohort sessions:', error);
      return [];
    }

    return data as CohortSession[];
  } catch (error) {
    console.error('getCohortSessions error:', error);
    return [];
  }
}

/**
 * Schedule a new cohort session
 */
export async function scheduleCohortSession(
  sessionData: CreateCohortSessionRequest,
  createdBy: string
): Promise<CohortSession | null> {
  try {
    const { data, error } = await supabase
      .from('cohort_live_sessions')
      .insert({
        ...sessionData,
        created_by: createdBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error scheduling session:', error);
      return null;
    }

    return data as CohortSession;
  } catch (error) {
    console.error('scheduleCohortSession error:', error);
    return null;
  }
}

/**
 * Update an existing cohort session
 */
export async function updateCohortSession(
  sessionId: string,
  changes: UpdateCohortSessionRequest
): Promise<CohortSession | null> {
  try {
    const { data, error } = await supabase
      .from('cohort_live_sessions')
      .update(changes)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      return null;
    }

    return data as CohortSession;
  } catch (error) {
    console.error('updateCohortSession error:', error);
    return null;
  }
}

/**
 * Delete a cohort session
 */
export async function deleteCohortSession(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cohort_live_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting session:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('deleteCohortSession error:', error);
    return false;
  }
}

/**
 * Get next upcoming session for a cohort
 */
export async function getNextCohortSession(
  cohortId: string
): Promise<CohortSession | null> {
  try {
    const { data, error } = await supabase
      .from('cohort_live_sessions')
      .select('*')
      .eq('cohort_id', cohortId)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      // No upcoming session is not an error
      return null;
    }

    return data as CohortSession;
  } catch (error) {
    console.error('getNextCohortSession error:', error);
    return null;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user is a coach for a specific cohort
 */
export async function isUserCoachForCohort(
  userId: string,
  cohortId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('cohorts')
      .select('coach_user_id')
      .eq('id', cohortId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.coach_user_id === userId;
  } catch (error) {
    console.error('isUserCoachForCohort error:', error);
    return false;
  }
}

/**
 * Format session date/time for display
 */
export function formatSessionDateTime(
  sessionDate: string,
  timezone: string = 'Europe/London'
): string {
  const date = new Date(sessionDate);
  return date.toLocaleString('en-GB', {
    timeZone: timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Check if a session is happening soon (within next 30 minutes)
 */
export function isSessionStartingSoon(sessionDate: string): boolean {
  const now = new Date();
  const sessionTime = new Date(sessionDate);
  const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

  return sessionTime <= thirtyMinutesFromNow && sessionTime >= now;
}

