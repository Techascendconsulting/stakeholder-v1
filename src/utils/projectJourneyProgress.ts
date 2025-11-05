/**
 * Project Journey Progress Tracking
 * Manages progress for the project journey stages
 */

import { supabase } from '../lib/supabase';

export type ProjectJourneyProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'locked';

export interface ProjectJourneyProgress {
  user_id: string;
  stage_id: string;
  status: ProjectJourneyProgressStatus;
  started_at?: string;
  completed_at?: string;
  last_accessed_at?: string;
}

const TABLE_NAME = 'project_journey_progress';

/**
 * Get all progress for a user
 */
export async function getAllProjectJourneyProgress(userId: string): Promise<Record<string, ProjectJourneyProgress>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching project journey progress:', error);
      return {};
    }

    const progressMap: Record<string, ProjectJourneyProgress> = {};
    data?.forEach((row) => {
      progressMap[row.stage_id] = row;
    });

    return progressMap;
  } catch (error) {
    console.error('Failed to get project journey progress:', error);
    return {};
  }
}

/**
 * Initialize progress for a stage
 */
export async function initializeProjectJourneyProgress(userId: string, stageId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        user_id: userId,
        stage_id: stageId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,stage_id'
      });

    if (error) {
      console.error('Error initializing project journey progress:', error);
    }
  } catch (error) {
    console.error('Failed to initialize project journey progress:', error);
  }
}

/**
 * Mark a stage as completed
 */
export async function markProjectJourneyStageCompleted(userId: string, stageId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        user_id: userId,
        stage_id: stageId,
        status: 'completed',
        completed_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,stage_id'
      });

    if (error) {
      console.error('Error marking project journey stage as completed:', error);
    }
  } catch (error) {
    console.error('Failed to mark project journey stage as completed:', error);
  }
}

/**
 * Update last accessed timestamp
 */
export async function updateProjectJourneyLastAccessed(userId: string, stageId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({
        last_accessed_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('stage_id', stageId);

    if (error) {
      console.error('Error updating project journey last accessed:', error);
    }
  } catch (error) {
    console.error('Failed to update project journey last accessed:', error);
  }
}








