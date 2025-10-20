/**
 * Project Journey Data
 * Defines the stages/modules for the hands-on project journey
 */

export interface ProjectJourneyStage {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  order: number;
  viewId: string;
  reminderBefore?: {
    title: string;
    message: string;
    icon: string;
  };
}

export const projectJourneyStages: ProjectJourneyStage[] = [
  {
    id: 'stage-1-choose-project',
    title: 'Choose Your Project',
    description: 'Select a real-world business challenge that interests you. This will be your canvas for practicing BA skills.',
    icon: '🎯',
    estimatedTime: '5-10 min',
    difficulty: 'Beginner',
    order: 1,
    viewId: 'projects'
  },
  {
    id: 'stage-2-project-brief',
    title: 'Review Project Brief',
    description: 'Understand the business context, challenges, and objectives. This is your foundation for all BA work.',
    icon: '📋',
    estimatedTime: '10-15 min',
    difficulty: 'Beginner',
    order: 2,
    viewId: 'project-brief'
  },
  {
    id: 'stage-3-stakeholder-conversations',
    title: 'Stakeholder Conversations',
    description: 'Complete the full meeting workflow: Select project → Review brief → Select stage → Choose stakeholders → Pick meeting type → Conduct AI-powered interviews.',
    icon: '💬',
    estimatedTime: '40-60 min',
    difficulty: 'Intermediate',
    order: 3,
    viewId: 'projects',
    reminderBefore: {
      title: 'Apply Stakeholder Mapping',
      message: 'Use your stakeholder mapping knowledge to identify key stakeholders by their power, interest, and influence on the project.',
      icon: '🗺️'
    }
  },
  {
    id: 'stage-4-process-mapping',
    title: 'Process Mapping',
    description: 'Map out the current (As-Is) business process and design the improved (To-Be) process flow.',
    icon: '🔄',
    estimatedTime: '30-40 min',
    difficulty: 'Intermediate',
    order: 4,
    viewId: 'process-mapper'
  },
  {
    id: 'stage-5-requirements-spec',
    title: 'Requirements Specification',
    description: 'Create user stories, acceptance criteria, and professional BA documentation for your solution.',
    icon: '📝',
    estimatedTime: '45-60 min',
    difficulty: 'Advanced',
    order: 5,
    viewId: 'agile-scrum'
  },
  {
    id: 'stage-6-refinement',
    title: 'Refinement',
    description: 'Conduct backlog refinement sessions to clarify user stories, estimate effort, and prepare for sprint planning.',
    icon: '🔍',
    estimatedTime: '30-40 min',
    difficulty: 'Advanced',
    order: 6,
    viewId: 'agile-scrum'
  },
  {
    id: 'stage-7-sprint-planning',
    title: 'Sprint Planning',
    description: 'Plan your sprint by selecting user stories, defining sprint goals, and committing to deliverables.',
    icon: '📅',
    estimatedTime: '40-50 min',
    difficulty: 'Advanced',
    order: 7,
    viewId: 'agile-scrum'
  },
  {
    id: 'stage-8-sprint-review',
    title: 'Sprint Review',
    description: 'Demonstrate completed work to stakeholders, gather feedback, and update the product backlog.',
    icon: '🎯',
    estimatedTime: '30-40 min',
    difficulty: 'Advanced',
    order: 8,
    viewId: 'agile-scrum'
  },
  {
    id: 'stage-9-sprint-retrospective',
    title: 'Sprint Retrospective',
    description: 'Reflect on the sprint process, identify improvements, and create action items for the next sprint.',
    icon: '🔄',
    estimatedTime: '25-35 min',
    difficulty: 'Advanced',
    order: 9,
    viewId: 'agile-scrum'
  },
  {
    id: 'stage-10-continuous-delivery',
    title: 'Continuous Delivery',
    description: 'Practice continuous delivery workflows, manage releases, and ensure quality throughout the delivery pipeline.',
    icon: '🚀',
    estimatedTime: '35-45 min',
    difficulty: 'Advanced',
    order: 10,
    viewId: 'agile-scrum'
  },
  {
    id: 'stage-11-project-challenges',
    title: 'Project Challenges',
    description: 'Navigate real-world project challenges, handle stakeholder conflicts, and adapt to changing requirements.',
    icon: '💪',
    estimatedTime: '40-50 min',
    difficulty: 'Advanced',
    order: 11,
    viewId: 'agile-scrum'
  }
];

