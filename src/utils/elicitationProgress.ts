/**
 * ELICITATION PRACTICE PROGRESS TRACKING
 * 
 * Manages the progressive unlock system for elicitation practice:
 * 1. Chat practice: Unlocks after completing ANY 3 learning modules
 * 2. Voice practice: Unlocks after 3 qualifying chat sessions (70%+ score) on 3 different days
 * 3. Daily limits: 20 interactions/day for chat-only users
 */

import { supabase } from '../lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface PracticeSession {
  id: string;
  user_id: string;
  session_date: string;
  meeting_stage: string;
  meeting_type: 'chat' | 'voice';
  ai_coach_score: number | null;
  interaction_count: number;
  created_at: string;
  updated_at: string;
}

export interface VoiceUnlockStatus {
  isUnlocked: boolean;
  qualifyingSessions: number;
  uniqueDays: number;
  sessionsNeeded: number;
  daysNeeded: number;
}

export interface ElicitationAccess {
  chatUnlocked: boolean;
  voiceUnlocked: boolean;
  dailyInteractionCount: number;
  dailyLimit: number | null; // null = unlimited
  voiceUnlockStatus: VoiceUnlockStatus;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DAILY_INTERACTION_LIMIT = 20;
const VOICE_UNLOCK_SESSIONS_REQUIRED = 3;
const VOICE_UNLOCK_DAYS_REQUIRED = 3;
const VOICE_UNLOCK_MIN_SCORE = 70;

// ============================================================================
// SESSION TRACKING
// ============================================================================

/**
 * Record a new practice session
 */
export async function recordPracticeSession(
  userId: string,
  meetingStage: string,
  meetingType: 'chat' | 'voice',
  interactionCount: number,
  aiCoachScore?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('elicitation_practice_sessions')
      .insert({
        user_id: userId,
        meeting_stage: meetingStage,
        meeting_type: meetingType,
        interaction_count: interactionCount,
        ai_coach_score: aiCoachScore || null,
      });

    if (error) {
      console.error('❌ Failed to record practice session:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Practice session recorded:', { meetingStage, meetingType, interactionCount, aiCoachScore });
    return { success: true };
  } catch (error) {
    console.error('❌ Error recording practice session:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get all practice sessions for a user
 */
export async function getUserPracticeSessions(userId: string): Promise<PracticeSession[]> {
  try {
    const { data, error } = await supabase
      .from('elicitation_practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch practice sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching practice sessions:', error);
    return [];
  }
}

/**
 * Get qualifying sessions (70%+ score) for voice unlock
 */
export async function getQualifyingSessions(userId: string): Promise<PracticeSession[]> {
  try {
    const { data, error } = await supabase
      .from('elicitation_practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('ai_coach_score', VOICE_UNLOCK_MIN_SCORE)
      .order('session_date', { ascending: true });

    if (error) {
      console.error('❌ Failed to fetch qualifying sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching qualifying sessions:', error);
    return [];
  }
}

// ============================================================================
// UNLOCK STATUS CHECKS
// ============================================================================

/**
 * Check if user has unlocked chat practice
 * (Requires completion of ANY 3 modules)
 */
export async function checkChatUnlock(userId: string): Promise<boolean> {
  try {
    // Check OLD system (learning_progress)
    const { data: oldData } = await supabase
      .from('learning_progress')
      .select('status, module_id')
      .eq('user_id', userId)
      .eq('status', 'completed');

    const oldCompletedCount = oldData?.length || 0;

    // Check NEW system (user_progress with unit_type='module')
    const { data: newData } = await supabase
      .from('user_progress')
      .select('status, stable_key, unit_type')
      .eq('user_id', userId)
      .eq('unit_type', 'module')
      .eq('status', 'completed');

    const newCompletedCount = newData?.length || 0;

    // Use whichever system has more completed modules
    const completedModules = Math.max(oldCompletedCount, newCompletedCount);
    const isUnlocked = completedModules >= 3;
    
    console.log('🔍 Chat unlock check:', { 
      oldSystemCompleted: oldCompletedCount,
      newSystemCompleted: newCompletedCount,
      completedModules,
      isUnlocked 
    });
    
    return isUnlocked;
  } catch (error) {
    console.error('❌ Error checking chat unlock:', error);
    return false; // Fail closed for new feature
  }
}

/**
 * Check voice unlock eligibility using Supabase function
 */
export async function checkVoiceUnlock(userId: string): Promise<VoiceUnlockStatus> {
  try {
    const { data, error } = await supabase.rpc('check_voice_unlock_eligibility', {
      p_user_id: userId,
    });

    if (error) {
      console.error('❌ Failed to check voice unlock:', error);
      // Return default locked state
      return {
        isUnlocked: false,
        qualifyingSessions: 0,
        uniqueDays: 0,
        sessionsNeeded: VOICE_UNLOCK_SESSIONS_REQUIRED,
        daysNeeded: VOICE_UNLOCK_DAYS_REQUIRED,
      };
    }

    console.log('🔍 Voice unlock status:', data);
    return data as VoiceUnlockStatus;
  } catch (error) {
    console.error('❌ Error checking voice unlock:', error);
    return {
      isUnlocked: false,
      qualifyingSessions: 0,
      uniqueDays: 0,
      sessionsNeeded: VOICE_UNLOCK_SESSIONS_REQUIRED,
      daysNeeded: VOICE_UNLOCK_DAYS_REQUIRED,
    };
  }
}

/**
 * Get today's interaction count using Supabase function
 */
export async function getDailyInteractionCount(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_daily_interaction_count', {
      p_user_id: userId,
    });

    if (error) {
      console.error('❌ Failed to get daily interaction count:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('❌ Error getting daily interaction count:', error);
    return 0;
  }
}

// ============================================================================
// COMPREHENSIVE ACCESS CHECK
// ============================================================================

/**
 * Get complete elicitation access status for a user
 * 
 * IMPORTANT: Existing users bypass all restrictions
 */
export async function getElicitationAccess(
  userId: string,
  userType: 'new' | 'existing'
): Promise<ElicitationAccess> {
  // EXISTING USERS: Full access, no restrictions
  if (userType === 'existing') {
    console.log('✅ Existing user - full elicitation access granted');
    return {
      chatUnlocked: true,
      voiceUnlocked: true,
      dailyInteractionCount: 0,
      dailyLimit: null, // Unlimited
      voiceUnlockStatus: {
        isUnlocked: true,
        qualifyingSessions: 0,
        uniqueDays: 0,
        sessionsNeeded: 0,
        daysNeeded: 0,
      },
    };
  }

  // NEW USERS: Progressive unlock system
  try {
    const [chatUnlocked, voiceUnlockStatus, dailyInteractionCount] = await Promise.all([
      checkChatUnlock(userId),
      checkVoiceUnlock(userId),
      getDailyInteractionCount(userId),
    ]);

    const access: ElicitationAccess = {
      chatUnlocked,
      voiceUnlocked: voiceUnlockStatus.isUnlocked,
      dailyInteractionCount,
      dailyLimit: voiceUnlockStatus.isUnlocked ? null : DAILY_INTERACTION_LIMIT,
      voiceUnlockStatus,
    };

    console.log('🔍 Elicitation access for new user:', access);
    return access;
  } catch (error) {
    console.error('❌ Error getting elicitation access:', error);
    // Fail closed: Lock everything for new users if check fails
    return {
      chatUnlocked: false,
      voiceUnlocked: false,
      dailyInteractionCount: 0,
      dailyLimit: DAILY_INTERACTION_LIMIT,
      voiceUnlockStatus: {
        isUnlocked: false,
        qualifyingSessions: 0,
        uniqueDays: 0,
        sessionsNeeded: VOICE_UNLOCK_SESSIONS_REQUIRED,
        daysNeeded: VOICE_UNLOCK_DAYS_REQUIRED,
      },
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user can start a new interaction today
 */
export function canStartInteraction(access: ElicitationAccess): boolean {
  // Unlimited access (existing users or voice unlocked)
  if (access.dailyLimit === null) {
    return true;
  }

  // Check against daily limit
  return access.dailyInteractionCount < access.dailyLimit;
}

/**
 * Get remaining interactions for today
 */
export function getRemainingInteractions(access: ElicitationAccess): number | null {
  if (access.dailyLimit === null) {
    return null; // Unlimited
  }

  return Math.max(0, access.dailyLimit - access.dailyInteractionCount);
}

/**
 * Format voice unlock progress message
 */
export function getVoiceUnlockProgressMessage(status: VoiceUnlockStatus): string {
  if (status.isUnlocked) {
    return '🎤 Voice practice unlocked!';
  }

  const parts: string[] = [];
  
  if (status.sessionsNeeded > 0) {
    parts.push(`${status.sessionsNeeded} more qualifying session${status.sessionsNeeded > 1 ? 's' : ''}`);
  }
  
  if (status.daysNeeded > 0) {
    parts.push(`${status.daysNeeded} more day${status.daysNeeded > 1 ? 's' : ''}`);
  }

  return parts.length > 0 
    ? `Need: ${parts.join(' and ')} (70%+ score)`
    : '🎉 Complete one more session to unlock voice!';
}
















