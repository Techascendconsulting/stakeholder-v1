import { supabase } from '../lib/supabase';

// Helper function to auto-summarize story titles
export function autoSummarise(text: string): string {
  return text.length > 50 ? text.slice(0, 47) + "..." : text;
}

// Save user story to database
export async function saveUserStory({
  epicId,
  projectId,
  storyText,
  moscowValue,
  acList,
  createdBy
}: {
  epicId?: string;
  projectId?: string | null;
  storyText: string;
  moscowValue: 'Must' | 'Should' | 'Could' | 'Won\'t';
  acList: string[];
  createdBy: string;
}): Promise<{ storyId: string; success: boolean; error?: string }> {
  try {
    // Insert the story
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .insert([{
        epic_id: epicId || null,
        project_id: projectId || null,
        summary: autoSummarise(storyText),
        description: storyText,
        moscow: moscowValue,
        created_by: createdBy
      }])
      .select()
      .single();

    if (storyError) {
      console.error('Error saving story:', storyError);
      return { storyId: '', success: false, error: storyError.message };
    }

    // Insert acceptance criteria if provided
    if (acList.length > 0) {
      const acInserts = acList.map(description => ({ 
        story_id: story.id, 
        description: description.trim() 
      }));
      
      const { error: acError } = await supabase
        .from("acceptance_criteria")
        .insert(acInserts);

      if (acError) {
        console.error('Error saving acceptance criteria:', acError);
        // Don't fail the whole operation if AC fails
      }
    }

    return { storyId: story.id, success: true };
  } catch (error) {
    console.error('Error in saveUserStory:', error);
    return { 
      storyId: '', 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Get stories for a project (for backlog view)
export async function getStoriesForProject(projectId?: string | null): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("stories")
      .select(`
        id,
        title,
        description,
        moscow,
        created_at,
        epic_id,
        epics (
          id,
          title
        ),
        acceptance_criteria (
          id,
          text
        )
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Error fetching stories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getStoriesForProject:', error);
    return [];
  }
}

// Get all stories for MVP Builder (training mode)
export async function getAllStoriesForMvpBuilder(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("stories")
      .select(`
        id,
        title,
        description,
        moscow,
        created_at,
        epic_id,
        project_id,
        epics (
          id,
          title,
          description
        ),
        acceptance_criteria (
          id,
          text
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Error fetching all stories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllStoriesForMvpBuilder:', error);
    return [];
  }
}

// Create a new epic
export async function createEpic({
  projectId,
  title,
  description,
  createdBy
}: {
  projectId?: string | null;
  title: string;
  description?: string;
  createdBy: string;
}): Promise<{ epicId: string; success: boolean; error?: string }> {
  try {
    const { data: epic, error } = await supabase
      .from("epics")
      .insert([{
        project_id: projectId || null,
        title,
        description,
        created_by: createdBy
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating epic:', error);
      return { epicId: '', success: false, error: error.message };
    }

    return { epicId: epic.id, success: true };
  } catch (error) {
    console.error('Error in createEpic:', error);
    return { 
      epicId: '', 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
