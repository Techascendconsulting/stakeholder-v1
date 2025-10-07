/**
 * Assignment Submission and AI Review Utility
 * 
 * Handles assignment submissions and AI-powered feedback using OpenAI
 */

import { supabase } from '../lib/supabase';
import OpenAI from 'openai';
import { getNextModuleId } from '../views/LearningFlow/learningData';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

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

    // Auto-unlock next module if score >= 70%
    if (parsed.score >= 70) {
      console.log(`✅ Score ${parsed.score} >= 70, marking module complete`);
      
      // Mark current module as completed
      await supabase
        .from('learning_progress')
        .update({
          status: 'completed',
          assignment_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('module_id', moduleId);

      // Unlock next module
      const nextModuleId = getNextModuleId(moduleId);
      if (nextModuleId) {
        await supabase
          .from('learning_progress')
          .update({
            status: 'unlocked',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('module_id', nextModuleId);

        console.log(`✅ Next module ${nextModuleId} unlocked`);
      }
    } else {
      console.log(`⚠️ Score ${parsed.score} < 70, revision needed`);
    }

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

