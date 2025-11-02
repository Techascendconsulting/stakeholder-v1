import { supabase } from '../lib/supabase';

export interface BacklogStory {
  id: string;
  ticketNumber: string;
  projectId: string;
  projectName: string;
  type: 'Story';
  title: string; // Maps from database 'summary' column
  description: string;
  acceptanceCriteria?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Draft' | 'Ready for Refinement' | 'Refined' | 'In Sprint' | 'To Do' | 'In Progress' | 'In Test' | 'Done';
  storyPoints?: number;
  epic?: string;
  epicColor?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  moscow: 'Must' | 'Should' | 'Could' | 'Won\'t';
}

export interface BacklogEpic {
  id: string;
  title: string;
  description: string;
  color: string;
  projectId: string;
}

/**
 * Fetch stories from database and map to backlog format
 */
export async function fetchBacklogStories(projectId?: string | null): Promise<BacklogStory[]> {
  try {
    let query = supabase
      .from('stories')
      .select(`
        id,
        summary,
        description,
        moscow,
        created_at,
        updated_at,
        created_by,
        epic_id,
        epics!inner(
          id,
          title,
          description,
          project_id
        )
      `)
      .eq('archived', false);  // Only show non-archived stories

    // Filter by project if provided, otherwise get training stories
    if (projectId) {
      query = query.eq('project_id', projectId);
    } else {
      query = query.is('project_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching backlog stories:', error);
      return [];
    }

    if (!data) return [];

    // Map database stories to backlog format
    return data.map((story, index) => ({
      id: story.id,
      ticketNumber: `STORY-${String(index + 1).padStart(3, '0')}`, // Generate ticket number
      projectId: story.epics.project_id || '',
      projectName: story.epics.project_id ? 'Current Project' : 'Training',
      type: 'Story' as const,
      title: story.summary, // Map summary to title
      description: story.description,
      acceptanceCriteria: '', // Will be populated separately
      priority: mapMoscowToPriority(story.moscow),
      status: 'Draft' as const, // Default status
      storyPoints: undefined,
      epic: story.epics.title,
      epicColor: '#8B5CF6', // Default purple color
      createdAt: story.created_at,
      updatedAt: story.updated_at || story.created_at,
      userId: story.created_by || '',
      moscow: story.moscow
    }));

  } catch (error) {
    console.error('Error in fetchBacklogStories:', error);
    return [];
  }
}

/**
 * Fetch epics from database for backlog
 */
export async function fetchBacklogEpics(projectId?: string | null): Promise<BacklogEpic[]> {
  try {
    let query = supabase
      .from('epics')
      .select('id, title, description, project_id')
      .eq('archived', false);  // Only show non-archived epics

    if (projectId) {
      query = query.eq('project_id', projectId);
    } else {
      query = query.is('project_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching backlog epics:', error);
      return [];
    }

    if (!data) return [];

    return data.map(epic => ({
      id: epic.id,
      title: epic.title,
      description: epic.description,
      color: '#8B5CF6', // Default purple color
      projectId: epic.project_id || ''
    }));

  } catch (error) {
    console.error('Error in fetchBacklogEpics:', error);
    return [];
  }
}

/**
 * Map MoSCoW priority to backlog priority
 */
function mapMoscowToPriority(moscow: string): 'Low' | 'Medium' | 'High' {
  switch (moscow) {
    case 'Must':
      return 'High';
    case 'Should':
      return 'Medium';
    case 'Could':
    case 'Won\'t':
    default:
      return 'Low';
  }
}

/**
 * Save a story from User Story Engine to database
 */
export async function saveStoryToBacklog({
  summary,
  description,
  moscow,
  epicId,
  projectId,
  createdBy
}: {
  summary: string;
  description: string;
  moscow: 'Must' | 'Should' | 'Could' | 'Won\'t';
  epicId?: string;
  projectId?: string;
  createdBy: string;
}): Promise<{ success: boolean; storyId?: string; error?: string }> {
  try {
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert([{
        summary,
        description,
        moscow,
        epic_id: epicId || null,
        project_id: projectId || null,
        created_by: createdBy
      }])
      .select()
      .single();

    if (storyError) {
      console.error('Error saving story to backlog:', storyError);
      return { success: false, error: storyError.message };
    }

    return { success: true, storyId: story.id };

  } catch (error) {
    console.error('Error in saveStoryToBacklog:', error);
    return { success: false, error: 'Failed to save story' };
  }
}
