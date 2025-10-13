import { supabase } from '../lib/supabase';

export type UserPhase = 'learning' | 'practice' | 'hands-on';

/**
 * Determine what phase the user is in based on their progress
 * 
 * Phase 1 (learning): Learning Journey - only Dashboard, Learning Journey, My Resources
 * Phase 2 (practice): After completing all 10 learning modules - unlocks My Practice
 * Phase 3 (hands-on): After completing all practice - unlocks Projects, Mentor, etc.
 */
export async function getUserPhase(userId: string): Promise<UserPhase> {
  try {
    // Check Learning Journey completion (all 10 modules)
    const { data: learningProgress, error } = await supabase
      .from('learning_progress')
      .select('status')
      .eq('user_id', userId);

    if (error) throw error;

    const totalModules = 10;
    const completedModules = learningProgress?.filter(p => p.status === 'completed').length || 0;

    console.log('📊 User progress phase check:', { 
      completedModules, 
      totalModules,
      percentage: (completedModules / totalModules * 100).toFixed(0) + '%'
    });

    // If all learning modules completed, move to practice phase
    if (completedModules >= totalModules) {
      // TODO: Check practice completion for hands-on phase
      // For now, practice completion unlocks everything
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
 * Check if a specific page/section is accessible based on user phase
 */
export function isPageAccessible(page: string, phase: UserPhase): boolean {
  // Always accessible pages
  const alwaysAccessible = [
    'dashboard', 
    'learning-flow', 
    'my-resources', 
    'handbook', 
    'ba-reference',  // Resources section
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

  // Practice pages - accessible after learning phase
  const practicePages = [
    'practice', 'practice-2', 'my-practice', 'elicitation-hub', 
    'documentation-practice', 'scrum-practice', 'mvp-practice', 'agile-practice'
  ];
  
  if (practicePages.includes(page) && (phase === 'practice' || phase === 'hands-on')) {
    return true;
  }

  // Hands-on pages - accessible only in hands-on phase
  const handsOnPages = [
    'projects', 'project', 'project-brief', 'project-setup', 'create-project',
    'custom-project', 'custom-stakeholders', 'project-landing',
    'my-mentor', 'my-mentorship', 'mentor-feedback', 'book-session',
    'stakeholders', 'meeting-mode-selection', 'meeting', 'voice-only-meeting',
    'meeting-summary', 'meeting-details', 'raw-transcript', 'notes',
    'deliverables', 'analysis', 'training-practice', 'training-hub'
  ];
  
  if (handsOnPages.includes(page) && phase === 'hands-on') {
    return true;
  }

  return false; // Default to locked
}

