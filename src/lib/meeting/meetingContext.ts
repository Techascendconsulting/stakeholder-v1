/**
 * Meeting Context Engine
 * Tracks conversation state, stage progress, and context memory
 */

export type MeetingStage = 'kickoff' | 'problem_exploration' | 'as_is' | 'to_be' | 'wrap_up';

export interface PainPoint {
  area: string;
  impact: string;
  emotion: string;
  layer: number; // 1-5
}

export interface StageProgress {
  problem_exploration?: {
    pain_points_found: number;
    target: number;
    percent_complete: number;
  };
  as_is?: {
    process_steps_mapped: number;
    target: number;
    percent_complete: number;
  };
  to_be?: {
    improvements_discussed: number;
    target: number;
    percent_complete: number;
  };
}

export interface MeetingContext {
  topics_covered: string[];
  pain_points_identified: PainPoint[];
  information_layers_unlocked: number; // 1-5
  stage_progress: StageProgress;
  current_stage: MeetingStage;
  should_transition: boolean;
  next_milestone: string;
}

export class MeetingContextEngine {
  private context: MeetingContext;

  constructor(initialStage: MeetingStage = 'kickoff') {
    this.context = {
      topics_covered: [],
      pain_points_identified: [],
      information_layers_unlocked: 1,
      stage_progress: {},
      current_stage: initialStage,
      should_transition: false,
      next_milestone: this.getInitialMilestone(initialStage)
    };
  }

  private getInitialMilestone(stage: MeetingStage): string {
    const milestones = {
      kickoff: 'Establish rapport and understand project scope',
      problem_exploration: 'Identify 2-3 specific pain points with examples',
      as_is: 'Map end-to-end process with systems and handoffs',
      to_be: 'Explore desired improvements and priorities',
      wrap_up: 'Confirm understanding and establish next steps'
    };
    return milestones[stage];
  }

  /**
   * Update context from conversation analysis
   */
  updateContext(updates: Partial<MeetingContext>): void {
    this.context = {
      ...this.context,
      ...updates
    };

    // Check if stage should transition
    this.checkStageCompletion();
  }

  /**
   * Add a topic to covered topics
   */
  addTopic(topic: string): void {
    if (!this.context.topics_covered.includes(topic)) {
      this.context.topics_covered.push(topic);
    }
  }

  /**
   * Add a pain point
   */
  addPainPoint(painPoint: PainPoint): void {
    // Check if similar pain point already exists
    const exists = this.context.pain_points_identified.some(
      pp => pp.area.toLowerCase() === painPoint.area.toLowerCase()
    );
    
    if (!exists) {
      this.context.pain_points_identified.push(painPoint);
      // Update information layer if this is deeper
      if (painPoint.layer > this.context.information_layers_unlocked) {
        this.context.information_layers_unlocked = painPoint.layer;
      }
    }
  }

  /**
   * Check if current stage is complete
   */
  private checkStageCompletion(): void {
    const stage = this.context.current_stage;
    const progress = this.context.stage_progress[stage];

    if (!progress) return;

    let shouldTransition = false;

    switch (stage) {
      case 'problem_exploration':
        shouldTransition = progress.pain_points_found >= progress.target;
        break;
      case 'as_is':
        shouldTransition = progress.process_steps_mapped >= progress.target;
        break;
      case 'to_be':
        shouldTransition = progress.improvements_discussed >= progress.target;
        break;
      default:
        shouldTransition = false;
    }

    this.context.should_transition = shouldTransition;

    if (shouldTransition) {
      this.context.next_milestone = this.getNextStageMilestone(stage);
    }
  }

  private getNextStageMilestone(currentStage: MeetingStage): string {
    const stageOrder: MeetingStage[] = ['kickoff', 'problem_exploration', 'as_is', 'to_be', 'wrap_up'];
    const currentIndex = stageOrder.indexOf(currentStage);
    
    if (currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      return this.getInitialMilestone(nextStage);
    }
    
    return 'Meeting complete - ready to wrap up';
  }

  /**
   * Transition to next stage
   */
  transitionToNextStage(): MeetingStage | null {
    const stageOrder: MeetingStage[] = ['kickoff', 'problem_exploration', 'as_is', 'to_be', 'wrap_up'];
    const currentIndex = stageOrder.indexOf(this.context.current_stage);
    
    if (currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      this.context.current_stage = nextStage;
      this.context.should_transition = false;
      this.context.next_milestone = this.getInitialMilestone(nextStage);
      return nextStage;
    }
    
    return null;
  }

  /**
   * Get current context
   */
  getContext(): MeetingContext {
    return { ...this.context };
  }

  /**
   * Get stage progress percentage
   */
  getStageProgress(): number {
    const stage = this.context.current_stage;
    const progress = this.context.stage_progress[stage];
    
    if (!progress) return 0;
    
    if ('percent_complete' in progress) {
      return progress.percent_complete;
    }
    
    return 0;
  }

  /**
   * Reset context for new meeting
   */
  reset(newStage: MeetingStage = 'kickoff'): void {
    this.context = {
      topics_covered: [],
      pain_points_identified: [],
      information_layers_unlocked: 1,
      stage_progress: {},
      current_stage: newStage,
      should_transition: false,
      next_milestone: this.getInitialMilestone(newStage)
    };
  }
}

