import { supabase } from '../lib/supabase';

/**
 * Mapping between learning modules and career journey phases
 * When a user completes certain modules, their corresponding phase progress updates
 */
export const MODULE_TO_PHASE_MAPPING: Record<string, string> = {
  // Phase 1: Welcome & Onboarding
  'module-1-core-learning': 'phase-1-onboarding',
  
  // Phase 2: Project Context & Discovery
  'module-2-project-initiation': 'phase-2-context',
  
  // Phase 3: Stakeholder Engagement
  'module-3-stakeholder-mapping': 'phase-3-stakeholder-engagement',
  
  // Phase 4: Requirements Elicitation
  'module-4-elicitation': 'phase-4-requirements-elicitation',
  
  // Phase 5: Process Analysis & Documentation
  'module-5-process-mapping': 'phase-5-process-analysis',
  
  // Phase 6: Requirements Specification
  'module-6-requirements-engineering': 'phase-6-requirements-specification',
  
  // Phase 7: Solution Design
  'module-7-solution-options': 'phase-7-solution-design',
  
  // Phase 8: Documentation & Handoff
  'module-8-documentation': 'phase-8-documentation',
  
  // Phase 9: Design Collaboration
  'module-9-design': 'phase-9-design-collaboration',
  
  // Phase 10: MVP Development Support
  'module-10-mvp': 'phase-10-mvp-support',
  
  // Phase 11: Agile & Continuous Delivery (no direct phase mapping yet, but could map to a future phase)
  'module-11-agile-scrum': 'phase-10-mvp-support' // Maps to phase 10 for now
};

/**
 * Get the phase ID for a given module ID
 */
export function getPhaseForModule(moduleId: string): string | null {
  return MODULE_TO_PHASE_MAPPING[moduleId] || null;
}

/**
 * Update career journey phase progress when a module is completed
 */
export async function updatePhaseProgressOnModuleCompletion(
  userId: string, 
  moduleId: string
): Promise<void> {
  const phaseId = getPhaseForModule(moduleId);
  
  if (!phaseId) {
    console.log(`📚 Module ${moduleId} has no mapped phase - skipping phase update`);
    return;
  }

  try {
    console.log(`🎯 Updating phase progress: ${moduleId} → ${phaseId}`);

    // Check if phase progress entry exists
    const { data: existingProgress } = await supabase
      .from('career_journey_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('phase_id', phaseId)
      .maybeSingle();

    if (existingProgress) {
      // Update existing progress to in_progress or completed
      const { error } = await supabase
        .from('career_journey_progress')
        .update({
          status: 'in_progress',
          started_at: existingProgress.started_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('phase_id', phaseId);

      if (error) {
        console.error('❌ Error updating phase progress:', error);
      } else {
        console.log(`✅ Phase ${phaseId} marked as in_progress`);
      }
    } else {
      // Create new progress entry
      const { error } = await supabase
        .from('career_journey_progress')
        .insert({
          user_id: userId,
          phase_id: phaseId,
          status: 'in_progress',
          completed_topics: [],
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error creating phase progress:', error);
      } else {
        console.log(`✅ Phase ${phaseId} progress created and marked as in_progress`);
      }
    }
  } catch (error) {
    console.error('❌ Error in updatePhaseProgressOnModuleCompletion:', error);
  }
}

/**
 * Mark a phase as completed when user completes the corresponding module
 */
export async function markPhaseCompleted(
  userId: string,
  phaseId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('career_journey_progress')
      .upsert({
        user_id: userId,
        phase_id: phaseId,
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,phase_id'
      });

    if (error) {
      console.error('❌ Error marking phase completed:', error);
    } else {
      console.log(`✅ Phase ${phaseId} marked as completed`);
    }
  } catch (error) {
    console.error('❌ Error in markPhaseCompleted:', error);
  }
}

/**
 * Check all completed modules and sync phase progress
 * Call this on dashboard load to ensure consistency
 */
export async function syncModuleProgressToPhases(userId: string): Promise<void> {
  try {
    // Get completed modules from localStorage
    const completedModulesStr = localStorage.getItem('completedModules');
    if (!completedModulesStr) return;

    const completedModules: string[] = JSON.parse(completedModulesStr);
    console.log(`🔄 Syncing ${completedModules.length} completed modules to career journey phases`);

    // Update phase progress for each completed module
    for (const moduleId of completedModules) {
      await updatePhaseProgressOnModuleCompletion(userId, moduleId);
    }

    console.log('✅ Module-to-phase sync complete');
  } catch (error) {
    console.error('❌ Error syncing module progress to phases:', error);
  }
}

