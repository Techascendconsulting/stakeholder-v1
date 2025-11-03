import { supabase } from '../lib/supabase';

export interface ProjectProgress {
  id?: string;
  user_id: string;
  project_module_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get project module progress for a user
 */
export async function getProjectProgress(userId: string, projectModuleId: string): Promise<ProjectProgress | null> {
  try {
    const { data, error } = await supabase
      .from('project_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('project_module_id', projectModuleId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching project progress:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in getProjectProgress:', error);
    return null;
  }
}

/**
 * Initialize or update project module progress
 */
export async function initializeProjectProgress(userId: string, projectModuleId: string): Promise<void> {
  try {
    const existing = await getProjectProgress(userId, projectModuleId);
    
    if (!existing) {
      const { error } = await supabase
        .from('project_progress')
        .insert({
          user_id: userId,
          project_module_id: projectModuleId,
          status: 'in_progress',
        });

      if (error) {
        console.error('Error initializing project progress:', error);
      }
    }
  } catch (error) {
    console.error('Exception in initializeProjectProgress:', error);
  }
}

/**
 * Mark project module as completed
 */
export async function markProjectModuleCompleted(userId: string, projectModuleId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('project_progress')
      .upsert({
        user_id: userId,
        project_module_id: projectModuleId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,project_module_id'
      });

    if (error) {
      console.error('Error marking project module completed:', error);
    }
  } catch (error) {
    console.error('Exception in markProjectModuleCompleted:', error);
  }
}

/**
 * Mark project module as incomplete
 */
export async function markProjectModuleIncomplete(userId: string, projectModuleId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('project_progress')
      .upsert({
        user_id: userId,
        project_module_id: projectModuleId,
        status: 'in_progress',
        completed_at: null,
      }, {
        onConflict: 'user_id,project_module_id'
      });

    if (error) {
      console.error('Error marking project module incomplete:', error);
    }
  } catch (error) {
    console.error('Exception in markProjectModuleIncomplete:', error);
  }
}

/**
 * Get all project module progress for a user
 */
export async function getAllProjectProgress(userId: string): Promise<Record<string, ProjectProgress>> {
  try {
    const { data, error } = await supabase
      .from('project_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching all project progress:', error);
      return {};
    }

    const progressMap: Record<string, ProjectProgress> = {};
    data?.forEach(progress => {
      progressMap[progress.project_module_id] = progress;
    });

    return progressMap;
  } catch (error) {
    console.error('Exception in getAllProjectProgress:', error);
    return {};
  }
}












