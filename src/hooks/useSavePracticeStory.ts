import { supabase } from '../lib/supabase'

export interface PracticeStoryData {
  userId?: string
  scenarioId: string
  userStory: string
  acceptanceCriteria: string[]
  feedbackResult: any
  currentStep: number
  status?: 'in_progress' | 'completed' | 'abandoned'
}

export interface SaveResult {
  success: boolean
  data?: any
  error?: string
}

export async function savePracticeStory(data: PracticeStoryData): Promise<SaveResult> {
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
      user_story: data.userStory,
      acceptance_criteria: data.acceptanceCriteria,
      feedback_result: data.feedbackResult,
      current_step: data.currentStep,
      status: data.status || 'in_progress'
    }

    const { data: result, error } = await supabase
      .from('practice_user_stories')
      .insert([insertData])
      .select()

    if (error) {
      console.error('Error saving practice story:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Unexpected error saving practice story:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updatePracticeStory(id: string, data: Partial<PracticeStoryData>): Promise<SaveResult> {
  try {
    const updateData: any = {}
    
    if (data.userStory !== undefined) updateData.user_story = data.userStory
    if (data.acceptanceCriteria !== undefined) updateData.acceptance_criteria = data.acceptanceCriteria
    if (data.feedbackResult !== undefined) updateData.feedback_result = data.feedbackResult
    if (data.currentStep !== undefined) updateData.current_step = data.currentStep
    if (data.status !== undefined) updateData.status = data.status

    const { data: result, error } = await supabase
      .from('practice_user_stories')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating practice story:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Unexpected error updating practice story:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}





