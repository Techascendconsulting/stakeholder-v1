import { supabase } from '../lib/supabase';

export type UserPhase = 'learning' | 'practice' | 'hands-on';

/**
 * Determine what phase the user is in based on their progress
 * 
 * Phase 1 (learning): Learning Journey - only Dashboard, Learning Journey, My Resources
 * Phase 2 (practice): After completing 3 learning modules - unlocks Practice
 * Phase 3 (hands-on): After completing all 10 modules - unlocks Projects, Mentor, etc.
 */
export async function getUserPhase(userId: string): Promise<UserPhase> {
  try {
    // Check OLD system (learning_progress table)
    const { data: oldProgress } = await supabase
      .from('learning_progress')
      .select('status')
      .eq('user_id', userId);

    const oldCompletedCount = oldProgress?.filter(p => p.status === 'completed').length || 0;

    // Check NEW system (user_progress table with unit_type='module')
    const { data: newProgress } = await supabase
      .from('user_progress')
      .select('status, unit_type')
      .eq('user_id', userId)
      .eq('unit_type', 'module');

    const newCompletedCount = newProgress?.filter(p => p.status === 'completed').length || 0;

    // Use whichever system has more completed modules
    const completedModules = Math.max(oldCompletedCount, newCompletedCount);
    const practiceUnlockThreshold = 3;  // Practice unlocks after 3 modules
    const handsOnUnlockThreshold = 10;  // Hands-on unlocks after all 10 modules

    console.log('📊 User progress phase check:', { 
      oldSystemCompleted: oldCompletedCount,
      newSystemCompleted: newCompletedCount,
      completedModules, 
      practiceUnlockThreshold,
      handsOnUnlockThreshold,
      phase: completedModules >= handsOnUnlockThreshold ? 'hands-on' : completedModules >= practiceUnlockThreshold ? 'practice' : 'learning'
    });

    // If all 10 modules completed, move to hands-on phase
    if (completedModules >= handsOnUnlockThreshold) {
      return 'hands-on';
    }

    // If 3+ modules completed, move to practice phase
    if (completedModules >= practiceUnlockThreshold) {
      return 'practice';
    }

    // Still in learning phase
    return 'learning';
    
  } catch (error) {
    console.error('Error getting user phase:', error);
    return 'learning'; // Default to most restrictive
  }
}

/**
 * Check if a specific page/section is accessible based on user type and phase
 * 
 * IMPORTANT: Existing users bypass ALL restrictions
 */
export function isPageAccessible(page: string, phase: UserPhase, userType: 'new' | 'existing' = 'new'): boolean {
  // EXISTING USERS: Full access to everything, no restrictions
  if (userType === 'existing') {
    return true;
  }

  // NEW USERS: Progressive unlock based on phase
  
  // Always accessible pages for new users
  const alwaysAccessible = [
    'dashboard', 
    'learning-flow', 
    'career-journey',    // BA Project Journey - always accessible to see their progress
    'my-resources', 
    'handbook', 
    'ba-reference',  // Resources section
    'support',       // Support is always open to all users
    'profile', 
    'welcome', 
    'motivation'
  ];
  
  if (alwaysAccessible.includes(page)) return true;

  // Learning pages accessible in all phases
  const learningPages = [
    'core-learning', 'project-initiation', 'elicitation', 'process-mapper',
    'requirements-engineering', 'solution-options', 'documentation',
    'design-hub', 'mvp-hub', 'scrum-essentials'
  ];
  
  if (learningPages.includes(page)) return true;

  // Practice pages - accessible after 3 modules (practice phase)
  const practicePages = [
    'practice-flow',          // Practice Journey hub page
    'practice', 'practice-2', 'my-practice', 'elicitation-hub', 
    'documentation-practice', 'scrum-practice', 'mvp-practice', 'agile-practice',
    'training-hub-stage-selection', 'training-hub-project-selection'  // Training hub pages
  ];
  
  if (practicePages.includes(page) && (phase === 'practice' || phase === 'hands-on')) {
    return true;
  }

  // Hands-on pages - accessible after 10 modules (hands-on phase)
  const handsOnPages = [
    'project-flow',           // Project Journey hub page
    'projects', 'project', 'project-brief', 'project-setup', 'create-project',
    'custom-project', 'custom-stakeholders', 'project-landing',
    'my-mentor', 'my-mentorship', 'mentor-feedback', 'book-session',
    'stakeholders', 'meeting-mode-selection', 'meeting', 'voice-only-meeting',
    'meeting-summary', 'meeting-details', 'raw-transcript', 'notes',
    'deliverables', 'analysis', 'training-practice', 'training-hub',
    'process-mapper-editor', 'agile-scrum'  // Project tools
  ];
  
  if (handsOnPages.includes(page) && phase === 'hands-on') {
    return true;
  }

  return false; // Default to locked for new users
}

