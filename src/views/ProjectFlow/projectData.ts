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
    id: 'project-1-create',
    title: 'Create Your Project',
    description: 'Define your business problem, set objectives, and create your project workspace. Start your BA journey with a real project.',
    icon: '🚀',
    estimatedTime: '30-45 min',
    difficulty: 'Beginner',
    viewId: 'create-project',
    order: 1
  },
  {
    id: 'project-2-stakeholders',
    title: 'Identify Stakeholders',
    description: 'Map out key stakeholders, understand their roles, and plan your engagement strategy for requirements gathering.',
    icon: '👥',
    estimatedTime: '45-60 min',
    difficulty: 'Beginner',
    viewId: 'stakeholders',
    order: 2
  },
  {
    id: 'project-3-meetings',
    title: 'Conduct Meetings',
    description: 'Hold stakeholder interviews, gather requirements, and document insights from real conversations.',
    icon: '💬',
    estimatedTime: '60-90 min',
    difficulty: 'Intermediate',
    viewId: 'meeting',
    order: 3
  },
  {
    id: 'project-4-deliverables',
    title: 'Create Deliverables',
    description: 'Document your findings with professional BA deliverables: requirements docs, process maps, user stories.',
    icon: '📄',
    estimatedTime: '90-120 min',
    difficulty: 'Intermediate',
    viewId: 'project-deliverables',
    order: 4
  },
  {
    id: 'project-5-portfolio',
    title: 'Build Your Portfolio',
    description: 'Showcase your completed work, generate case studies, and prepare your professional BA portfolio.',
    icon: '🎯',
    estimatedTime: '45-60 min',
    difficulty: 'Advanced',
    viewId: 'portfolio',
    order: 5
  }
];

