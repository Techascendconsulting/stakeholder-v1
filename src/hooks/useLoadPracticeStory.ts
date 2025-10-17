import { supabase } from '../lib/supabase'

export interface PracticeStory {
  id: string
  user_id: string | null
  scenario_id: string
  user_story: string
  acceptance_criteria: string[]
  feedback_result: any
  current_step: number
  status: 'in_progress' | 'completed' | 'abandoned'
  created_at: string
  updated_at: string
}

export interface LoadResult {
  success: boolean
  data?: PracticeStory | null
  error?: string
}

export async function loadLastPracticeStory(scenarioId?: string): Promise<LoadResult> {
  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.warn('Session error:', sessionError)
      // Continue without user_id for anonymous users
    }

    let query = supabase
      .from('practice_user_stories')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)

    // If user is logged in, filter by user_id
    if (session?.user?.id) {
      query = query.eq('user_id', session.user.id)
    } else {
      // For anonymous users, filter by null user_id
      query = query.is('user_id', null)
    }

    // If specific scenario requested, filter by scenario_id
    if (scenarioId) {
      query = query.eq('scenario_id', scenarioId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading practice story:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data?.[0] || null }
  } catch (error) {
    console.error('Unexpected error loading practice story:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function loadAllPracticeStories(): Promise<{ success: boolean; data?: PracticeStory[]; error?: string }> {
  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.warn('Session error:', sessionError)
      // Continue without user_id for anonymous users
    }

    let query = supabase
      .from('practice_user_stories')
      .select('*')
      .order('updated_at', { ascending: false })

    // If user is logged in, filter by user_id
    if (session?.user?.id) {
      query = query.eq('user_id', session.user.id)
    } else {
      // For anonymous users, filter by null user_id
      query = query.is('user_id', null)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading practice stories:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Unexpected error loading practice stories:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deletePracticeStory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('practice_user_stories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting practice story:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting practice story:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}










