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
    id: 'stage-3-stakeholder-initiation',
    title: 'Initiation & Stakeholders',
    description: 'Learn about the project, identify key stakeholders, and prepare for stakeholder meetings.',
    icon: '👥',
    estimatedTime: '20-30 min',
    difficulty: 'Intermediate',
    order: 3,
    viewId: 'project-initiation'
  },
  {
    id: 'stage-4-stakeholder-conversations',
    title: 'Stakeholder Conversations',
    description: 'Complete the full meeting workflow: Select stakeholders → Choose meeting type → Conduct AI-powered interviews to gather requirements and understand pain points.',
    icon: '💬',
    estimatedTime: '40-60 min',
    difficulty: 'Intermediate',
    order: 4,
    viewId: 'stakeholders'
  },
  {
    id: 'stage-5-process-mapping',
    title: 'Process Mapping',
    description: 'Map out the current (As-Is) business process and design the improved (To-Be) process flow.',
    icon: '🔄',
    estimatedTime: '30-40 min',
    difficulty: 'Intermediate',
    order: 5,
    viewId: 'process-mapper'
  },
  {
    id: 'stage-6-solution-options',
    title: 'Solution Options',
    description: 'Analyze different solution approaches, evaluate trade-offs, and recommend the best path forward.',
    icon: '💡',
    estimatedTime: '25-35 min',
    difficulty: 'Advanced',
    order: 6,
    viewId: 'solution-options'
  },
  {
    id: 'stage-7-requirements-doc',
    title: 'Requirements Documentation',
    description: 'Create user stories, acceptance criteria, and professional BA documentation for your solution.',
    icon: '📝',
    estimatedTime: '45-60 min',
    difficulty: 'Advanced',
    order: 7,
    viewId: 'documentation-practice'
  },
  {
    id: 'stage-8-agile-delivery',
    title: 'Agile Delivery Practice',
    description: 'Practice Scrum ceremonies, manage backlogs, plan sprints, and experience Agile delivery firsthand.',
    icon: '⚡',
    estimatedTime: '40-50 min',
    difficulty: 'Advanced',
    order: 8,
    viewId: 'scrum-practice'
  }
];

