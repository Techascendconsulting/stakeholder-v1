import { supabase } from '../lib/supabase'

export interface AdvancedAttempt {
  id: string
  user_id: string | null
  scenario_id: string
  step: number
  user_story: string
  acceptance_criteria: string[]
  feedback_history: Record<string, any>
  advanced_metadata: {
    form_fields?: Array<{
      label: string
      type: string
      required: boolean
    }>
    validation_rules?: string[]
    integrations?: Array<{
      target: string
      type: string
      description: string
    }>
  }
  completed: boolean
  created_at: string
  updated_at: string
}

export interface AdvancedAttemptData {
  scenarioId: string
  step: number
  userStory: string
  acceptanceCriteria: string[]
  feedbackHistory: Record<string, any>
  advancedMetadata?: {
    form_fields?: Array<{
      label: string
      type: string
      required: boolean
    }>
    validation_rules?: string[]
    integrations?: Array<{
      target: string
      type: string
      description: string
    }>
  }
  completed?: boolean
}

export interface SaveResult {
  success: boolean
  data?: AdvancedAttempt
  error?: string
}

export async function saveAdvancedAttempt(data: AdvancedAttemptData): Promise<SaveResult> {
  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.warn('Session error:', sessionError)
      // Continue without user_id for anonymous users
    }

    const insertData = {
      user_id: session?.user?.id || null,
      scenario_id: data.scenarioId,
      step: data.step,
      user_story: data.userStory,
      acceptance_criteria: data.acceptanceCriteria,
      feedback_history: data.feedbackHistory,
      advanced_metadata: data.advancedMetadata || {},
      completed: data.completed || false
    }

    const { data: result, error } = await supabase
      .from('advanced_user_story_attempts')
      .insert([insertData])
      .select()

    if (error) {
      console.error('Error saving advanced attempt:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Unexpected error saving advanced attempt:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateAdvancedAttempt(id: string, data: Partial<AdvancedAttemptData>): Promise<SaveResult> {
  try {
    const updateData: any = {}
    
    if (data.step !== undefined) updateData.step = data.step
    if (data.userStory !== undefined) updateData.user_story = data.userStory
    if (data.acceptanceCriteria !== undefined) updateData.acceptance_criteria = data.acceptanceCriteria
    if (data.feedbackHistory !== undefined) updateData.feedback_history = data.feedbackHistory
    if (data.advancedMetadata !== undefined) updateData.advanced_metadata = data.advancedMetadata
    if (data.completed !== undefined) updateData.completed = data.completed

    const { data: result, error } = await supabase
      .from('advanced_user_story_attempts')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating advanced attempt:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Unexpected error updating advanced attempt:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getLastAdvancedAttempt(scenarioId?: string): Promise<{ success: boolean; data?: AdvancedAttempt | null; error?: string }> {
  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.warn('Session error:', sessionError)
      // Continue without user_id for anonymous users
    }

    let query = supabase
      .from('advanced_user_story_attempts')
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
      console.error('Error loading advanced attempt:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data?.[0] || null }
  } catch (error) {
    console.error('Unexpected error loading advanced attempt:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getAllAdvancedAttempts(): Promise<{ success: boolean; data?: AdvancedAttempt[]; error?: string }> {
  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.warn('Session error:', sessionError)
      // Continue without user_id for anonymous users
    }

    let query = supabase
      .from('advanced_user_story_attempts')
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
      console.error('Error loading advanced attempts:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Unexpected error loading advanced attempts:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteAdvancedAttempt(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('advanced_user_story_attempts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting advanced attempt:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting advanced attempt:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}










