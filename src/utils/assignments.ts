/**
 * Assignment Submission and AI Review Utility
 * 
 * SECURITY: Uses secure backend API - NO OpenAI API key in frontend
 */

import { supabase } from '../lib/supabase';
import { reviewAssignment as apiReviewAssignment } from '../lib/apiClient';
import { getNextModuleId } from '../views/LearningFlow/learningData';

export interface AssignmentSubmission {
  id: string;
  user_id: string;
  module_id: string;
  submission: string;
  feedback: string | null;
  score: number | null;
  status: 'submitted' | 'reviewed' | 'needs_revision';
  created_at: string;
  updated_at: string;
}

export interface AIFeedbackResult {
  summary: string;
  feedback: string;
  score: number;
  strengths: string[];
  improvements: string[];
}

/**
 * Submit an assignment
 */
export async function submitAssignment(
  userId: string,
  moduleId: string,
  submissionText: string
): Promise<AssignmentSubmission> {
  try {
    const { data, error } = await supabase
      .from('learning_assignments')
      .insert([{
        user_id: userId,
        module_id: moduleId,
        submission: submissionText,
        status: 'submitted'
      }])
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Assignment submitted');
    return data;
  } catch (error) {
    console.error('❌ Failed to submit assignment:', error);
    throw error;
  }
}

/**
 * Review assignment with AI and update progress if score >= 70%
 */
export async function reviewAssignmentWithAI(
  userId: string,
  moduleId: string,
  moduleTitle: string,
  assignmentDescription: string,
  submissionText: string
): Promise<AIFeedbackResult> {
  try {
    console.log('🤖 Requesting AI review for', moduleId);

    // Call secure backend API for feedback
    const result = await apiReviewAssignment({
      moduleTitle,
      assignmentDescription,
      submission: submissionText,
    });

    if (!result.success) {
      return {
        summary: 'AI grading unavailable',
        feedback: result.error || 'Failed to get AI feedback',
        score: 0,
        strengths: [],
        improvements: [],
      };
    }

    console.log('📝 AI Response received with score:', result.score);

    // Format the response
    const parsed: AIFeedbackResult = {
      summary: result.feedback.split('\n\n')[0] || result.feedback,
      feedback: result.feedback,
      score: result.score,
      strengths: result.strengths ? result.strengths.split(',').map((s: string) => s.trim()) : [],
      improvements: result.improvements ? result.improvements.split(',').map((i: string) => i.trim()) : [],
    };

    // Store feedback in database
    const { error: updateError } = await supabase
      .from('learning_assignments')
      .update({
        feedback: `${parsed.summary}\n\n${parsed.feedback}`,
        score: parsed.score,
        status: 'reviewed',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (updateError) {
      console.error('Failed to store feedback:', updateError);
    }

    // Don't auto-unlock yet - wait for 24-hour delay
    // Just store the score and feedback
    console.log(`📝 Score ${parsed.score} recorded. ${parsed.score >= 70 ? 'Will unlock after 24 hours' : 'Needs revision'}`);
    
    // Update assignment status based on score
    const newStatus = parsed.score >= 70 ? 'reviewed' : 'needs_revision';
    await supabase
      .from('learning_assignments')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .order('created_at', { ascending: false })
      .limit(1);

    return parsed;
  } catch (error) {
    console.error('❌ AI review failed:', error);
    throw error;
  }
}

/**
 * Get latest assignment submission for a module
 */
export async function getLatestAssignment(
  userId: string,
  moduleId: string
): Promise<AssignmentSubmission | null> {
  try {
    const { data, error } = await supabase
      .from('learning_assignments')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - not an error
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to get latest assignment:', error);
    return null;
  }
}

/**
 * Check if 24 hours have passed since submission, review with AI, and unlock if passed
 * Call this on page load or periodically
 */
export async function processDelayedReviewsAndUnlocks(userId: string): Promise<void> {
  try {
    // TESTING MODE: Instant review for everyone (no 24-hour delay)
    const DELAY_TIME = 0; // Set to 0 for instant review during testing

    // Get all submitted assignments that haven't been reviewed yet
    const { data: assignments, error } = await supabase
      .from('learning_assignments')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'submitted');

    if (error) throw error;
    if (!assignments || assignments.length === 0) return;

    const now = new Date().getTime();

    for (const assignment of assignments) {
      const submittedAt = new Date(assignment.created_at).getTime();
      const timePassed = now - submittedAt;

      // TESTING: Instant review (always passes)
      if (timePassed >= DELAY_TIME) {
        console.log(`⚡ TESTING MODE: Instant review for ${assignment.module_id}`);

        // NOW call AI to review (after 24 hours)
        const moduleTitle = assignment.module_id; // Would need to get from learningData
        const feedback = await reviewAssignmentWithAI(
          userId,
          assignment.module_id,
          moduleTitle,
          'Assignment', // Would need actual description
          assignment.submission
        );

        // If score >= 70%, unlock next module
        if (feedback.score >= 70) {
          // Mark module as completed
          await supabase
            .from('learning_progress')
            .update({
              status: 'completed',
              assignment_completed: true,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('module_id', assignment.module_id);

          // Unlock next module
          const nextModuleId = getNextModuleId(assignment.module_id);
          if (nextModuleId) {
            await supabase
              .from('learning_progress')
              .update({
                status: 'unlocked',
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId)
              .eq('module_id', nextModuleId);

            console.log(`✅ Module ${assignment.module_id} reviewed and unlocked ${nextModuleId}`);
          }
        } else {
          console.log(`⚠️ Score ${feedback.score} < 70, needs revision`);
        }
      }
    }
  } catch (error) {
    console.error('❌ processDelayedReviewsAndUnlocks error:', error);
  }
}

/**
 * Get time remaining until unlock (in milliseconds)
 * Returns 0 if already unlockable
 */
export function getTimeUntilUnlock(submittedAt: string): number {
  // TESTING MODE: Instant review for everyone
  return 0;
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return 'Ready to unlock';
  
  const hours = Math.floor(milliseconds / (60 * 60 * 1000));
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}





















