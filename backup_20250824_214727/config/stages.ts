import { MeetingStage } from '../components/StageIndicator';

export interface StageConfig {
  objective: string;
  forbiddenTopics: string[];
  redirectMessage: string;
}

export const MEETING_STAGES: Record<MeetingStage, StageConfig> = {
  kickoff: {
    objective: 'Understand the project goals, team structure, and success criteria.',
    forbiddenTopics: ['problem exploration', 'as-is process', 'to-be process', 'solutions', 'pain points', 'requirements'],
    redirectMessage: 'Let\'s focus on understanding the project scope and goals for now.'
  },
  problem_exploration: {
    objective: 'Identify current challenges, pain points, and areas for improvement.',
    forbiddenTopics: ['as-is process', 'to-be process', 'solutions', 'future state', 'requirements', 'metrics', 'timelines'],
    redirectMessage: 'Let\'s focus on understanding the current challenges before discussing solutions.'
  },
  as_is: {
    objective: 'Map out the current process step by step.',
    forbiddenTopics: ['problem exploration', 'to-be process', 'solutions', 'future state', 'requirements', 'metrics', 'timelines'],
    redirectMessage: 'Let\'s stick to describing how the process works today, step by step.'
  },
  to_be: {
    objective: 'Discuss desired improvements and how the future process should work.',
    forbiddenTopics: ['problem exploration', 'as-is process', 'current state', 'metrics', 'timelines'],
    redirectMessage: 'Let\'s focus on how we want things to work in the future.'
  },
  wrap_up: {
    objective: 'Confirm understanding and next steps.',
    forbiddenTopics: ['problem exploration', 'as-is process', 'to-be process', 'new problems', 'new solutions', 'detailed process steps'],
    redirectMessage: 'Let\'s wrap up by confirming what we\'ve discussed and next steps.'
  }
};
