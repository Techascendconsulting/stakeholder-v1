/**
 * Assignment Submission and AI Review Utility
 * 
 * Handles assignment submissions and AI-powered feedback using OpenAI
 */

import { supabase } from '../lib/supabase';
import OpenAI from 'openai';
import { getNextModuleId } from '../views/LearningFlow/learningData';

// SECURITY: Client-side OpenAI usage for assignment review
// TODO (Production): Move AI grading to Supabase Edge Function
// TODO: Create /supabase/functions/grade-assignment/index.ts
// Current approach acceptable for MVP but exposes API key in browser

// Only create OpenAI client if API key is available
const createOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ VITE_OPENAI_API_KEY not set - assignment AI features will be disabled');
    return null;
  }
  try {
    return new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // ⚠️ SECURITY: Move to Edge Function for production
      baseURL: 'http://localhost:3001/api/openai-proxy'
    });
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI client for assignments:', error);
    return null;
  }
};

const openai = createOpenAIClient();

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

    // Call OpenAI for feedback
    if (!openai) {
      return {
        summary: 'AI grading unavailable',
        feedback: 'OpenAI API key is not configured. Please configure VITE_OPENAI_API_KEY to enable AI-powered assignment grading.',
        score: null,
        status: 'submitted'
      };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are Verity, an AI mentor for Business Analyst learners. You review assignment submissions and provide constructive feedback.

Your task:
1. Read the learner's submission carefully
2. Evaluate based on: clarity, understanding of concepts, practical application, completeness
3. Provide specific, actionable feedback
4. Assign a score (0-100)

Scoring guide:
- 90-100: Exceptional understanding, excellent detail, ready for next module
- 70-89: Good understanding, minor improvements possible, ready to proceed
- 50-69: Partial understanding, needs revision before proceeding
- 0-49: Significant gaps, must revise

Respond ONLY in valid JSON format:
{
  "summary": "Brief 1-2 sentence summary of what they did well",
  "feedback": "2-3 sentences of constructive feedback and suggestions",
  "score": 85,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"]
}`
        },
        {
          role: 'user',
          content: `Module: ${moduleTitle}

Assignment Prompt: ${assignmentDescription}

Learner's Submission:
${submissionText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    console.log('📝 AI Response:', responseText);

    // Parse AI response
    const parsed: AIFeedbackResult = JSON.parse(responseText);

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

















