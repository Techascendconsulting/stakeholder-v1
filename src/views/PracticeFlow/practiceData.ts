export interface PracticeModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  viewId: string; // The actual view to navigate to
  order: number;
}

export const practiceModules: PracticeModule[] = [
  {
    id: 'practice-1-elicitation',
    title: 'Elicitation Practice',
    description: 'Practice stakeholder interviews and requirements gathering with AI stakeholders. Master the art of asking the right questions.',
    icon: '🎯',
    estimatedTime: '30-45 min',
    difficulty: 'Beginner',
    viewId: 'practice-2',
    order: 1
  },
  {
    id: 'practice-2-documentation',
    title: 'Documentation Practice',
    description: 'Create professional BA documents including BRDs, user stories, and acceptance criteria. Build your documentation portfolio.',
    icon: '📝',
    estimatedTime: '45-60 min',
    difficulty: 'Intermediate',
    viewId: 'documentation-practice',
    order: 2
  },
  {
    id: 'practice-3-mvp',
    title: 'MVP Practice',
    description: 'Design and scope Minimum Viable Products. Learn to prioritize features and create value-driven product roadmaps.',
    icon: '🚀',
    estimatedTime: '60-90 min',
    difficulty: 'Advanced',
    viewId: 'mvp-practice',
    order: 3
  },
  {
    id: 'practice-4-scrum',
    title: 'Scrum Practice',
    description: 'Experience Agile ceremonies and Scrum practices. Participate in sprints, backlog refinement, and retrospectives.',
    icon: '⚡',
    estimatedTime: '45-60 min',
    difficulty: 'Intermediate',
    viewId: 'scrum-practice',
    order: 4
  }
];

