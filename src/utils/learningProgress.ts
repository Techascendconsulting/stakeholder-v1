/**
 * Learning Progress Utility
 * 
 * Handles all Supabase interactions for learning progress tracking
 */

import { supabase } from '../lib/supabase';

export interface LearningProgressRow {
  id: string;
  user_id: string;
  module_id: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  completed_lessons: string[];
  assignment_completed: boolean;
  completed_at: string | null;
  updated_at: string;
}

/**
 * Get all learning progress for a user
 */
export async function getLearningProgress(userId: string): Promise<LearningProgressRow[]> {
  const { data, error } = await supabase
    .from('learning_progress')
    .select('*')
    .eq('user_id', userId)
    .order('module_id');

  if (error) {
    console.error('❌ Failed to load learning progress:', error);
    throw error;
  }

  return data || [];
}

/**
 * Initialize progress for all modules (call once on first access)
 */
export async function initializeLearningProgress(userId: string, moduleIds: string[]): Promise<void> {
  try {
    // Check if already initialized
    const existing = await getLearningProgress(userId);
    if (existing.length > 0) {
      console.log('✅ Progress already initialized');
      return;
    }

    // Insert initial records - first module unlocked, rest locked
    const records = moduleIds.map((moduleId, index) => ({
      user_id: userId,
      module_id: moduleId,
      status: index === 0 ? 'unlocked' : 'locked',
      completed_lessons: [],
      assignment_completed: false
    }));

    const { error } = await supabase
      .from('learning_progress')
      .insert(records);

    if (error) {
      console.error('❌ Failed to initialize progress:', error);
      throw error;
    }

    console.log('✅ Learning progress initialized for', moduleIds.length, 'modules');
  } catch (error) {
    console.error('❌ initializeLearningProgress error:', error);
    throw error;
  }
}

/**
 * Mark a lesson as completed
 */
export async function markLessonCompleted(
  userId: string,
  moduleId: string,
  lessonId: string
): Promise<void> {
  try {
    // Get current progress for this module
    const { data: current } = await supabase
      .from('learning_progress')
      .select('completed_lessons, status')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (!current) {
      throw new Error('Module progress not found');
    }

    const completedLessons = current.completed_lessons || [];
    
    // Add lesson if not already completed
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }

    // Update status to in_progress if it was unlocked
    const newStatus = current.status === 'unlocked' ? 'in_progress' : current.status;

    const { error } = await supabase
      .from('learning_progress')
      .update({
        completed_lessons: completedLessons,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('module_id', moduleId);

    if (error) throw error;
    console.log(`✅ Lesson ${lessonId} marked complete in ${moduleId}`);
  } catch (error) {
    console.error('❌ markLessonCompleted error:', error);
    throw error;
  }
}

/**
 * Mark module assignment as completed and unlock next module
 */
export async function markModuleCompleted(
  userId: string,
  moduleId: string,
  nextModuleId?: string
): Promise<void> {
  try {
    // Mark current module as completed
    const { error: updateError } = await supabase
      .from('learning_progress')
      .update({
        status: 'completed',
        assignment_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('module_id', moduleId);

    if (updateError) throw updateError;
    console.log(`✅ Module ${moduleId} marked complete`);

    // Unlock next module if exists
    if (nextModuleId) {
      const { error: unlockError } = await supabase
        .from('learning_progress')
        .update({
          status: 'unlocked',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('module_id', nextModuleId);

      if (unlockError) throw unlockError;
      console.log(`✅ Next module ${nextModuleId} unlocked`);
    }
  } catch (error) {
    console.error('❌ markModuleCompleted error:', error);
    throw error;
  }
}

/**
 * Get progress for a specific module
 */
export async function getModuleProgress(
  userId: string,
  moduleId: string
): Promise<LearningProgressRow | null> {
  const { data, error } = await supabase
    .from('learning_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .single();

  if (error) {
    console.error('❌ Failed to load module progress:', error);
    return null;
  }

  return data;
}

/**
 * Check if a lesson is accessible (previous lesson must be complete)
 */
export function isLessonAccessible(
  moduleProgress: LearningProgressRow | null,
  lessonIndex: number,
  lessons: any[]
): boolean {
  if (!moduleProgress || moduleProgress.status === 'locked') return false;

  // First lesson is always accessible if module is unlocked
  if (lessonIndex === 0) return true;

  // Other lessons require previous lesson to be completed
  const previousLessonId = lessons[lessonIndex - 1]?.id;
  return moduleProgress.completed_lessons.includes(previousLessonId);
}

/**
 * Check if assignment is accessible (all lessons must be complete)
 */
export function isAssignmentAccessible(
  moduleProgress: LearningProgressRow | null,
  totalLessons: number
): boolean {
  if (!moduleProgress || moduleProgress.status === 'locked') return false;
  return moduleProgress.completed_lessons.length >= totalLessons;
}

/**
 * Calculate module completion percentage
 */
export function getModuleCompletionPercentage(
  moduleProgress: LearningProgressRow | null,
  totalLessons: number
): number {
  if (!moduleProgress) return 0;

  const lessonsCompleted = moduleProgress.completed_lessons.length;
  const assignmentWeight = moduleProgress.assignment_completed ? 1 : 0;
  const total = totalLessons + 1; // lessons + assignment

  return Math.round(((lessonsCompleted + assignmentWeight) / total) * 100);
}

