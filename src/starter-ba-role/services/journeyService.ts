import { Phase, Section, Step, ProgressStatus, FeatureState } from '../types/models';

export class JourneyService {
  /**
   * Get all phases
   */
  static getPhases(state: FeatureState): Phase[] {
    return [...state.phases].sort((a, b) => a.order - b.order);
  }

  /**
   * Get a single phase by slug
   */
  static getPhaseBySlug(state: FeatureState, slug: string): Phase | null {
    return state.phases.find(p => p.slug === slug) || null;
  }

  /**
   * Get all sections for a phase
   */
  static getSectionsForPhase(state: FeatureState, phaseId: string): Section[] {
    return state.sections
      .filter(s => s.phaseId === phaseId)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get all steps for a section
   */
  static getStepsForSection(state: FeatureState, sectionId: string): Step[] {
    return state.steps
      .filter(s => s.sectionId === sectionId)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get the first unlocked step in the entire journey
   */
  static getNextUnlockedStep(state: FeatureState): Step | null {
    // Find first step with 'unlocked' status
    const orderedPhases = this.getPhases(state);
    
    for (const phase of orderedPhases) {
      const sections = this.getSectionsForPhase(state, phase.id);
      for (const section of sections) {
        const steps = this.getStepsForSection(state, section.id);
        for (const step of steps) {
          if (state.progress[step.id] === 'unlocked') {
            return step;
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Get phase progress (completed / total steps)
   */
  static getPhaseProgress(state: FeatureState, phaseId: string): { completed: number; total: number; percentage: number } {
    const sections = this.getSectionsForPhase(state, phaseId);
    let completed = 0;
    let total = 0;

    for (const section of sections) {
      const steps = this.getStepsForSection(state, section.id);
      total += steps.length;
      completed += steps.filter(s => state.progress[s.id] === 'completed').length;
    }

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  /**
   * Get phase status: locked, unlocked, completed, or current
   */
  static getPhaseStatus(state: FeatureState, phaseId: string): 'locked' | 'unlocked' | 'completed' | 'current' {
    const sections = this.getSectionsForPhase(state, phaseId);
    if (sections.length === 0) return 'locked';

    let hasUnlocked = false;
    let hasCompleted = false;
    let allCompleted = true;

    for (const section of sections) {
      const steps = this.getStepsForSection(state, section.id);
      for (const step of steps) {
        const status = state.progress[step.id];
        if (status === 'unlocked') hasUnlocked = true;
        if (status === 'completed') hasCompleted = true;
        if (status !== 'completed') allCompleted = false;
      }
    }

    if (allCompleted && sections.length > 0) return 'completed';
    if (hasUnlocked) return 'current';
    if (hasCompleted) return 'unlocked';
    
    // Check if at least one step is unlocked
    for (const section of sections) {
      const steps = this.getStepsForSection(state, section.id);
      if (steps.some(s => state.progress[s.id] !== 'locked')) {
        return 'unlocked';
      }
    }
    
    return 'locked';
  }

  /**
   * Find the next step in a section after the given order
   */
  static findNextStepInSection(state: FeatureState, sectionId: string, currentOrder: number): Step | null {
    const steps = this.getStepsForSection(state, sectionId);
    return steps.find(s => s.order === currentOrder + 1) || null;
  }

  /**
   * Find the next section in a phase after the given order
   */
  static findNextSectionInPhase(state: FeatureState, phaseId: string, currentOrder: number): Section | null {
    const sections = this.getSectionsForPhase(state, phaseId);
    return sections.find(s => s.order === currentOrder + 1) || null;
  }

  /**
   * Find the next phase after the given order
   */
  static findNextPhase(state: FeatureState, currentOrder: number): Phase | null {
    const phases = this.getPhases(state);
    return phases.find(p => p.order === currentOrder + 1) || null;
  }

  /**
   * Get section that contains a specific step
   */
  static getSectionForStep(state: FeatureState, stepId: string): Section | null {
    const step = state.steps.find(s => s.id === stepId);
    if (!step) return null;
    return state.sections.find(s => s.id === step.sectionId) || null;
  }

  /**
   * Get phase that contains a specific step
   */
  static getPhaseForStep(state: FeatureState, stepId: string): Phase | null {
    const section = this.getSectionForStep(state, stepId);
    if (!section) return null;
    return state.phases.find(p => p.id === section.phaseId) || null;
  }

  /**
   * Check if there's a previous step available
   */
  static hasPreviousStep(state: FeatureState, currentStepId: string): boolean {
    const currentStep = state.steps.find(s => s.id === currentStepId);
    if (!currentStep) return false;

    const section = this.getSectionForStep(state, currentStepId);
    if (!section) return false;

    const steps = this.getStepsForSection(state, section.id);
    const currentIndex = steps.findIndex(s => s.id === currentStepId);
    
    return currentIndex > 0;
  }

  /**
   * Get the previous step
   */
  static getPreviousStep(state: FeatureState, currentStepId: string): Step | null {
    const currentStep = state.steps.find(s => s.id === currentStepId);
    if (!currentStep) return null;

    const section = this.getSectionForStep(state, currentStepId);
    if (!section) return null;

    const steps = this.getStepsForSection(state, section.id);
    const currentIndex = steps.findIndex(s => s.id === currentStepId);
    
    if (currentIndex > 0) {
      return steps[currentIndex - 1];
    }
    
    return null;
  }

  /**
   * Get the next step (regardless of lock status)
   */
  static getNextStep(state: FeatureState, currentStepId: string): Step | null {
    const currentStep = state.steps.find(s => s.id === currentStepId);
    if (!currentStep) return null;

    return this.findNextStepInSection(state, currentStep.sectionId, currentStep.order);
  }

  /**
   * Get all steps in a phase
   */
  static getAllStepsInPhase(state: FeatureState, phaseId: string): Step[] {
    const sections = this.getSectionsForPhase(state, phaseId);
    const allSteps: Step[] = [];
    
    for (const section of sections) {
      const steps = this.getStepsForSection(state, section.id);
      allSteps.push(...steps);
    }
    
    return allSteps;
  }
}

