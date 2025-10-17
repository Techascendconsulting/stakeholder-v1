import { supabase } from '../lib/supabase';

/**
 * Mapping between learning modules and career journey phases
 * When a user completes certain modules, their corresponding phase progress updates
 */
/**
 * IMPORTANT: These phase IDs must exactly match the phase IDs in careerJourneyData.ts!
 * Any mismatch will cause progress tracking to fail silently.
 */
export const MODULE_TO_PHASE_MAPPING: Record<string, string> = {
  // Phase 1: Welcome & Onboarding
  'module-1-core-learning': 'phase-1-onboarding',
  
  // Phase 2: Project Context & Discovery
  'module-2-project-initiation': 'phase-2-context',
  
  // Phase 3: Stakeholder Engagement (FIXED: was phase-3-stakeholder-engagement)
  'module-3-stakeholder-mapping': 'phase-3-stakeholders',
  
  // Phase 4: As-Is Process Analysis (FIXED: was phase-4-requirements-elicitation)
  'module-4-elicitation': 'phase-4-as-is',
  
  // Phase 5: To-Be Process Design (FIXED: was phase-5-process-analysis)
  'module-5-process-mapper': 'phase-5-to-be',
  
  // Phase 6: Requirements Documentation (FIXED: was phase-6-requirements-specification)
  'module-6-requirements-engineering': 'phase-6-requirements',
  
  // Phase 7: Documentation & Handoff (FIXED: was phase-7-solution-design)
  'module-7-solution-options': 'phase-7-documentation',
  
  // Phase 8: Design Collaboration (FIXED: was phase-8-documentation)
  'module-8-documentation': 'phase-8-design-collaboration',
  
  // Phase 9: Agile Ceremonies (FIXED: was phase-9-design-collaboration)
  'module-9-design': 'phase-9-agile',
  
  // Phase 10: Delivery & Handoff (FIXED: was phase-10-mvp-support)
  'module-10-mvp': 'phase-10-delivery',
  
  // Phase 11: Agile & Continuous Delivery (maps to phase 10)
  'module-11-agile-scrum': 'phase-10-delivery'
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
 * Initialize all career journey phases for a user if they don't exist
 * Creates 'not_started' records for all 10 phases
 */
export async function initializeCareerJourneyPhases(userId: string): Promise<void> {
  try {
    console.log('🔄 Initializing career journey phases for user:', userId);
    
    // Check if any phases exist for this user
    const { data: existingPhases } = await supabase
      .from('career_journey_progress')
      .select('phase_id')
      .eq('user_id', userId);
    
    if (existingPhases && existingPhases.length > 0) {
      console.log(`✅ User already has ${existingPhases.length} phase records - skipping initialization`);
      return;
    }
    
    // Get all unique phase IDs from the mapping
    const allPhaseIds = Array.from(new Set(Object.values(MODULE_TO_PHASE_MAPPING)));
    console.log(`📝 Creating ${allPhaseIds.length} phase records:`, allPhaseIds);
    
    // Create 'not_started' records for all phases
    const phaseRecords = allPhaseIds.map(phaseId => ({
      user_id: userId,
      phase_id: phaseId,
      status: 'not_started',
      completed_topics: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { error } = await supabase
      .from('career_journey_progress')
      .insert(phaseRecords);
    
    if (error) {
      console.error('❌ Error initializing phases:', error);
    } else {
      console.log(`✅ Successfully initialized ${allPhaseIds.length} career journey phases`);
    }
  } catch (error) {
    console.error('❌ Error in initializeCareerJourneyPhases:', error);
  }
}

/**
 * Check all completed modules and sync phase progress
 * Call this on dashboard load to ensure consistency
 */
export async function syncModuleProgressToPhases(userId: string): Promise<void> {
  try {
    // STEP 1: Initialize phases if this is first time
    await initializeCareerJourneyPhases(userId);
    
    // STEP 2: Get completed modules from localStorage
    const completedModulesStr = localStorage.getItem('completedModules');
    if (!completedModulesStr) {
      console.log('📚 No completed modules found in localStorage');
      return;
    }

    const completedModules: string[] = JSON.parse(completedModulesStr);
    console.log(`🔄 Syncing ${completedModules.length} completed modules to career journey phases`);

    // STEP 3: Update phase progress for each completed module
    for (const moduleId of completedModules) {
      await updatePhaseProgressOnModuleCompletion(userId, moduleId);
    }

    console.log('✅ Module-to-phase sync complete');
  } catch (error) {
    console.error('❌ Error syncing module progress to phases:', error);
  }
}

