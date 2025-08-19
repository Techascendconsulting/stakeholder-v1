export type MeetingStage = 
  | 'problem_exploration'  // Understanding current pain points
  | 'as_is'               // Mapping current process
  | 'to_be'              // Discussing improvements
  | 'wrap_up';           // Confirming understanding

export interface StageContext {
  currentStage: MeetingStage;
  stageObjective: string;
  forbiddenTopics: string[];
  redirectMessage: string;
}

export const STAGE_CONFIGS: Record<MeetingStage, StageContext> = {
  problem_exploration: {
    currentStage: 'problem_exploration',
    stageObjective: 'Understand current challenges and pain points in the process',
    forbiddenTopics: [
      'solutions',
      'future state',
      'improvements',
      'technical details',
      'implementation'
    ],
    redirectMessage: "Let's focus on understanding what's challenging in the current process before we discuss solutions."
  },
  as_is: {
    currentStage: 'as_is',
    stageObjective: 'Map out exactly how the current process works',
    forbiddenTopics: [
      'improvements',
      'solutions',
      'future state',
      'should be',
      'could be'
    ],
    redirectMessage: "I can explain how we do things today. We'll get to improvements in the next stage."
  },
  to_be: {
    currentStage: 'to_be',
    stageObjective: 'Discuss desired improvements and changes to the process',
    forbiddenTopics: [
      'technical implementation',
      'development timeline',
      'budget',
      'resource allocation'
    ],
    redirectMessage: "Let's focus on what improvements would help you most. We can discuss implementation details later."
  },
  wrap_up: {
    currentStage: 'wrap_up',
    stageObjective: 'Confirm understanding and next steps',
    forbiddenTopics: [
      'new requirements',
      'new problems',
      'technical details'
    ],
    redirectMessage: "Let's make sure I've captured everything correctly before we wrap up."
  }
};
