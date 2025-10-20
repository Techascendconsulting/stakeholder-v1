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
    id: 'stage-4-select-stakeholders',
    title: 'Select Stakeholders',
    description: 'Choose which stakeholders to interview based on their roles and relevance to the project.',
    icon: '👥',
    estimatedTime: '5-10 min',
    difficulty: 'Intermediate',
    order: 4,
    viewId: 'stakeholders'
  },
  {
    id: 'stage-5-meeting-setup',
    title: 'Meeting Setup',
    description: 'Choose your meeting type (voice or transcript) and prepare for stakeholder conversations.',
    icon: '⚙️',
    estimatedTime: '5 min',
    difficulty: 'Intermediate',
    order: 5,
    viewId: 'meeting-mode-selection'
  },
  {
    id: 'stage-6-conduct-meeting',
    title: 'Conduct Meeting',
    description: 'Have AI-powered conversations with stakeholders to gather requirements, understand pain points, and validate assumptions.',
    icon: '💬',
    estimatedTime: '30-45 min',
    difficulty: 'Intermediate',
    order: 6,
    viewId: 'voice-meeting-v2'
  },
  {
    id: 'stage-7-process-mapping',
    title: 'Process Mapping',
    description: 'Map out the current (As-Is) business process and design the improved (To-Be) process flow.',
    icon: '🔄',
    estimatedTime: '30-40 min',
    difficulty: 'Intermediate',
    order: 7,
    viewId: 'process-mapper'
  },
  {
    id: 'stage-8-solution-options',
    title: 'Solution Options',
    description: 'Analyze different solution approaches, evaluate trade-offs, and recommend the best path forward.',
    icon: '💡',
    estimatedTime: '25-35 min',
    difficulty: 'Advanced',
    order: 8,
    viewId: 'solution-options'
  },
  {
    id: 'stage-9-requirements-doc',
    title: 'Requirements Documentation',
    description: 'Create user stories, acceptance criteria, and professional BA documentation for your solution.',
    icon: '📝',
    estimatedTime: '45-60 min',
    difficulty: 'Advanced',
    order: 9,
    viewId: 'documentation-practice'
  },
  {
    id: 'stage-10-agile-delivery',
    title: 'Agile Delivery Practice',
    description: 'Practice Scrum ceremonies, manage backlogs, plan sprints, and experience Agile delivery firsthand.',
    icon: '⚡',
    estimatedTime: '40-50 min',
    difficulty: 'Advanced',
    order: 10,
    viewId: 'scrum-practice'
  }
];

