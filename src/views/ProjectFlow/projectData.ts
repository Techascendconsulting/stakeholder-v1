export interface ProjectModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  viewId: string; // The actual view to navigate to
  order: number;
}

export const projectModules: ProjectModule[] = [
  {
    id: 'project-1-workspace',
    title: 'Project Workspace',
    description: 'Manage your active projects and collaborate with stakeholders. Access project dashboard, stakeholder management, and requirements tracking.',
    icon: '📁',
    estimatedTime: '30-45 min',
    difficulty: 'Beginner',
    viewId: 'project',
    order: 1
  },
  {
    id: 'project-2-agile-hub',
    title: 'Agile Hub',
    description: 'Conduct Agile ceremonies and manage your Scrum activities. Practice sprint planning, daily standups, retrospectives, and backlog management.',
    icon: '⚡',
    estimatedTime: '60-90 min',
    difficulty: 'Intermediate',
    viewId: 'agile-hub',
    order: 2
  },
  {
    id: 'project-3-meeting-history',
    title: 'Meeting History',
    description: 'Review past meetings and track stakeholder interactions. Access meeting transcripts, action items, stakeholder notes, and follow-up tracking.',
    icon: '📝',
    estimatedTime: '30-45 min',
    difficulty: 'Beginner',
    viewId: 'meeting-history',
    order: 3
  },
  {
    id: 'project-4-deliverables',
    title: 'Project Deliverables',
    description: 'Create and manage your project documentation and artifacts. Generate requirements documents, process maps, user stories, and acceptance criteria.',
    icon: '📄',
    estimatedTime: '90-120 min',
    difficulty: 'Intermediate',
    viewId: 'project-deliverables',
    order: 4
  },
  {
    id: 'project-5-my-deliverables',
    title: 'My Deliverables',
    description: 'Access your personal library of BA artifacts and templates. Manage document library, template gallery, version control, and sharing.',
    icon: '📚',
    estimatedTime: '45-60 min',
    difficulty: 'Intermediate',
    viewId: 'deliverables',
    order: 5
  },
  {
    id: 'project-6-portfolio',
    title: 'Portfolio',
    description: 'Showcase your work and build your professional portfolio. Display project showcase, skill demonstrations, achievement gallery, and professional profile.',
    icon: '🎯',
    estimatedTime: '60-90 min',
    difficulty: 'Advanced',
    viewId: 'portfolio',
    order: 6
  }
];

