import { supabase } from '../lib/supabase';

export interface PracticeProgress {
  id?: string;
  user_id: string;
  practice_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get practice progress for a user
 */
export async function getPracticeProgress(userId: string, practiceId: string): Promise<PracticeProgress | null> {
  try {
    const { data, error } = await supabase
      .from('practice_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('practice_id', practiceId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching practice progress:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in getPracticeProgress:', error);
    return null;
  }
}

/**
 * Initialize or update practice progress
 */
export async function initializePracticeProgress(userId: string, practiceId: string): Promise<void> {
  try {
    const existing = await getPracticeProgress(userId, practiceId);
    
    if (!existing) {
      const { error } = await supabase
        .from('practice_progress')
        .insert({
          user_id: userId,
          practice_id: practiceId,
          status: 'in_progress',
        });

      if (error) {
        console.error('Error initializing practice progress:', error);
      }
    }
  } catch (error) {
    console.error('Exception in initializePracticeProgress:', error);
  }
}

/**
 * Mark practice as completed
 */
export async function markPracticeCompleted(userId: string, practiceId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('practice_progress')
      .upsert({
        user_id: userId,
        practice_id: practiceId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,practice_id'
      });

    if (error) {
      console.error('Error marking practice completed:', error);
    }
  } catch (error) {
    console.error('Exception in markPracticeCompleted:', error);
  }
}

/**
 * Mark practice as incomplete (for existing users who want to revisit)
 */
export async function markPracticeIncomplete(userId: string, practiceId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('practice_progress')
      .upsert({
        user_id: userId,
        practice_id: practiceId,
        status: 'in_progress',
        completed_at: null,
      }, {
        onConflict: 'user_id,practice_id'
      });

    if (error) {
      console.error('Error marking practice incomplete:', error);
    }
  } catch (error) {
    console.error('Exception in markPracticeIncomplete:', error);
  }
}

/**
 * Get all practice progress for a user
 */
export async function getAllPracticeProgress(userId: string): Promise<Record<string, PracticeProgress>> {
  try {
    const { data, error } = await supabase
      .from('practice_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching all practice progress:', error);
      return {};
    }

    const progressMap: Record<string, PracticeProgress> = {};
    data?.forEach(progress => {
      progressMap[progress.practice_id] = progress;
    });

    return progressMap;
  } catch (error) {
    console.error('Exception in getAllPracticeProgress:', error);
    return {};
  }
}







