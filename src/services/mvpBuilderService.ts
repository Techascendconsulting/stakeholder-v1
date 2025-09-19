import { supabase } from '../lib/supabase';

// Types
export interface Epic {
  id: string;
  title: string;
  project_id: string;
  archived: boolean;
  stories?: Story[];
}

export interface Story {
  id: string;
  summary: string;
  description: string;
  moscow?: string;
  epic_id?: string;
  project_id?: string;
  created_at?: string;
  archived?: boolean;
  acceptance_criteria?: AcceptanceCriteria[];
}

export interface AcceptanceCriteria {
  id: string;
  description: string; // real column in DB
  created_at?: string;
  project_id?: string;
  archived?: boolean;
}

export interface MvpFlow {
  id: string;
  epic_id: string;
  story_ids: string[];
  flow_order: number[];
  validated: boolean;
  created_at: string;
}

// Test MVP Builder connection
export async function testMvpBuilderConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    console.log('🔍 Testing MVP Builder connection...');
    
    // Test basic Supabase connection
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      return { success: false, message: 'Authentication failed', details: authError };
    }
    
    // Test if epics table exists
    const { data, error } = await supabase
      .from('epics')
      .select('id')
      .limit(1);
    
    console.log('🔍 Test query data:', data);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return { 
          success: false, 
          message: 'MVP Builder tables not found. Please run the migration.', 
          details: error 
        };
      }
      return { success: false, message: 'Database error', details: error };
    }
    
    return { 
      success: true, 
      message: 'MVP Builder connection successful',
      details: { user: authData.user?.id, epicsTable: 'exists' }
    };
  } catch (error) {
    return { success: false, message: 'Connection test failed', details: error };
  }
}

// Fetch epics by project (or all epics for training mode)
export async function fetchEpics(projectId?: string): Promise<Epic[]> {
  try {
    // Force fallback to training project if projectId is null or "proj-1"
    const activeProjectId =
      !projectId || projectId === "proj-1"
        ? "00000000-0000-0000-0000-000000000001"
        : projectId;
    console.log('🔄 Fetching epics for project:', activeProjectId);

    const query = supabase
      .from('epics')
      .select(`
        id,
        title,
        project_id,
        archived,
        stories:stories!stories_epic_id_fkey (
          id,
          summary,
          description,
          moscow,
          epic_id,
          project_id,
          archived,
          created_at,
          acceptance_criteria:acceptance_criteria!acceptance_criteria_story_id_fkey (
            id,
            description,
            created_at,
            project_id,
            archived
          )
        )
      `)
      .eq('project_id', activeProjectId)
      .eq('archived', false)
      .order('id', { ascending: true });

    const { data, error } = await query;

    // 🔍 Dump full nested JSON response for inspection
    console.log(
      '🔍 Raw Supabase response (epics + stories + acceptance_criteria):',
      JSON.stringify(data, null, 2)
    );

    if (error) {
      console.error('❌ Error fetching epics:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error in fetchEpics:', error);
    return [];
  }
}

// Fetch stories by epic
export async function fetchStories(epicId: string): Promise<Story[]> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('id, summary, description, moscow, created_at')
      .eq('epic_id', epicId)
      .eq('archived', false)  // Only show non-archived stories
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching stories:', error);
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.warn('Stories table does not exist yet. Please run the MVP Builder migration.');
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error in fetchStories:', error);
    return [];
  }
}

// Fetch acceptance criteria by story
export async function fetchAcceptanceCriteria(storyId: string): Promise<AcceptanceCriteria[]> {
  const { data, error } = await supabase
    .from('acceptance_criteria')
    .select('id, description, created_at')
    .eq('story_id', storyId)
    .eq('archived', false)  // Only show non-archived acceptance criteria
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Fetch stories with acceptance criteria
export async function fetchStoriesWithAC(epicId: string): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      summary,
      description,
      moscow,
      created_at,
      acceptance_criteria (
        id,
        description,
        created_at
      )
    `)
    .eq('epic_id', epicId)
    .eq('archived', false)  // Only show non-archived stories
    .order('created_at', { ascending: true });

  if (error) throw error;
  
  return (data || []).map((story: any) => ({
    ...story,
    acceptance_criteria: story.acceptance_criteria?.map((ac: any) => ac.description) || []
  }));
}


// Update story MoSCoW priority
export async function updateStoryPriority(storyId: string, moscow: 'Must' | 'Should' | 'Could' | 'Won\'t'): Promise<Story> {
  const { data, error } = await supabase
    .from('stories')
    .update({ moscow })
    .eq('id', storyId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Save MVP flow to database
export async function saveMvpFlow({
  projectId,
  epicId,
  storyId,
  priority,
  inMvp,
  createdBy
}: {
  projectId?: string | null;
  epicId: string;
  storyId: string;
  priority: 'Must' | 'Should' | 'Could' | 'Won\'t';
  inMvp: boolean;
  createdBy: string;
}): Promise<void> {
  const { error } = await supabase
    .from('mvp_flows')
    .upsert({
      project_id: projectId,
      epic_id: epicId,
      story_id: storyId,
      priority,
      in_mvp: inMvp,
      created_by: createdBy
    }, {
      onConflict: 'project_id,epic_id,story_id,created_by'
    });

  if (error) throw error;
}

// Get MVP flows for a user
export async function getMvpFlows(projectId?: string | null, createdBy?: string): Promise<any[]> {
  let query = supabase.from('mvp_flows').select('*');
  
  if (projectId !== undefined) {
    query = query.eq('project_id', projectId);
  }
  
  if (createdBy) {
    query = query.eq('created_by', createdBy);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Create a new epic
export async function createEpic({
  projectId,
  title,
  description,
  createdBy
}: {
  projectId: string;
  title: string;
  description?: string;
  createdBy: string;
}): Promise<Epic> {
  const { data, error } = await supabase
    .from('epics')
    .insert({
      project_id: projectId,
      title,
      description,
      created_by: createdBy
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Create a new story
export async function createStory({
  epicId,
  summary,
  description,
  createdBy
}: {
  epicId: string;
  summary: string;
  description?: string;
  createdBy: string;
}): Promise<Story> {
  const { data, error } = await supabase
    .from('stories')
    .insert({
      epic_id: epicId,
      summary,
      description,
      created_by: createdBy
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Add acceptance criteria to a story
export async function addAcceptanceCriteria({
  storyId,
  description
}: {
  storyId: string;
  description: string;
}): Promise<AcceptanceCriteria> {
  const { data, error } = await supabase
    .from('acceptance_criteria')
    .insert({
      story_id: storyId,
      description
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Remove acceptance criteria
export async function removeAcceptanceCriteria(criteriaId: string): Promise<void> {
  const { error } = await supabase
    .from('acceptance_criteria')
    .delete()
    .eq('id', criteriaId);

  if (error) throw error;
}

// Fetch existing MVP flow for an epic
export async function fetchMvpFlow(epicId: string): Promise<MvpFlow | null> {
  const { data, error } = await supabase
    .from('mvp_flows')
    .select('*')
    .eq('epic_id', epicId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data;
}

// Validate MVP flow
export function validateMvpFlow(stories: Story[], flowOrder: string[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if flow has stories
  if (flowOrder.length === 0) {
    errors.push('MVP flow is empty. Add at least one story to create an MVP.');
    return { isValid: false, errors, warnings };
  }

  // Check if all stories in flow have MoSCoW priorities
  const flowStories = stories.filter(s => flowOrder.includes(s.id));
  const storiesWithoutMoscow = flowStories.filter(s => !s.moscow);
  if (storiesWithoutMoscow.length > 0) {
    errors.push(`${storiesWithoutMoscow.length} story(ies) in the flow don't have MoSCoW priorities assigned.`);
  }

  // Check for too many Must-Have stories (warning)
  const mustHaveStories = flowStories.filter(s => s.moscow === 'Must');
  if (mustHaveStories.length > 3) {
    warnings.push(`You have ${mustHaveStories.length} Must-Have stories. Consider if all are truly essential for the MVP.`);
  }

  // Check for Won't Have stories in flow (warning)
  const wontHaveStories = flowStories.filter(s => s.moscow === 'Won\'t');
  if (wontHaveStories.length > 0) {
    warnings.push(`${wontHaveStories.length} Won't Have story(ies) are in the MVP flow. Consider removing them.`);
  }

  // Check for stories without acceptance criteria (warning)
  const storiesWithoutAC = flowStories.filter(s => !s.acceptance_criteria || s.acceptance_criteria.length === 0);
  if (storiesWithoutAC.length > 0) {
    warnings.push(`${storiesWithoutAC.length} story(ies) in the flow don't have acceptance criteria.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
