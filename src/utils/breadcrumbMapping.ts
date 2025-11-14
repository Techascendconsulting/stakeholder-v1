import { AppView } from '../types';

export interface BreadcrumbItem {
  label: string;
  view: AppView;
}

/**
 * Defines the breadcrumb path for each view in the app
 * Format: [parent view, current view]
 */
export const breadcrumbMapping: Record<string, BreadcrumbItem[]> = {
  // Dashboard (root)
  'dashboard': [
    { label: 'Dashboard', view: 'dashboard' }
  ],

  // Learning Journey paths
  'learning-intro': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Learning Journey', view: 'learning-intro' }
  ],
  'learning-flow': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Learning Journey', view: 'learning-flow' }
  ],
  'core-learning': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Learning Journey', view: 'learning-flow' },
    { label: 'Core Learning', view: 'core-learning' }
  ],
  'project-initiation': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Learning Journey', view: 'learning-flow' },
    { label: 'Project Initiation', view: 'project-initiation' }
  ],
  'stakeholder-mapping': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Learning Journey', view: 'learning-flow' },
    { label: 'Stakeholder Mapping', view: 'stakeholder-mapping' }
  ],
  'elicitation': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Learning Journey', view: 'learning-flow' },
    { label: 'Requirements Elicitation', view: 'elicitation' }
  ],
  'process-mapper': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Learning Journey', view: 'learning-flow' },
    { label: 'Process Mapping', view: 'process-mapper' }
  ],
  'requirements-engineering': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Learning Journey', view: 'learning-flow' },
    { label: 'Requirements Engineering', view: 'requirements-engineering' }
  ],
  'solution-options': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Learning Journey', view: 'learning-flow' },
    { label: 'Solution Options', view: 'solution-options' }
  ],
  'documentation': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Learning Journey', view: 'learning-flow' },
    { label: 'Documentation', view: 'documentation' }
  ],
  'design-hub': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Learning Journey', view: 'learning-flow' },
    { label: 'Design', view: 'design-hub' }
  ],
  'mvp-hub': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Learning Journey', view: 'learning-flow' },
    { label: 'MVP', view: 'mvp-hub' }
  ],
  'scrum-essentials': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Learning Journey', view: 'learning-flow' },
    { label: 'Agile & Scrum', view: 'scrum-essentials' }
  ],
  'scrum-learning': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Learning Journey', view: 'learning-flow' },
    { label: 'Agile & Scrum', view: 'scrum-learning' }
  ],

  // Practice Journey paths
  'practice-intro': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Practice Journey', view: 'practice-intro' }
  ],
  'practice-flow': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Practice Journey', view: 'practice-flow' }
  ],
  'practice': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Practice Journey', view: 'practice-flow' },
    { label: 'Practice Session', view: 'practice' }
  ],
  'training-practice': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Practice Journey', view: 'practice-flow' },
    { label: 'Training Practice', view: 'training-practice' }
  ],

  // Project Journey paths
  'project-flow': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Project Journey', view: 'project-flow' }
  ],
  'projects': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'My Projects', view: 'projects' }
  ],
  'project-setup': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'My Projects', view: 'projects' },
    { label: 'Project Setup', view: 'project-setup' }
  ],
  'meeting': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'My Projects', view: 'projects' },
    { label: 'Meeting', view: 'meeting' }
  ],
  'voice-only-meeting': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'My Projects', view: 'projects' },
    { label: 'Voice Meeting', view: 'voice-only-meeting' }
  ],
  'meeting-summary': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'My Projects', view: 'projects' },
    { label: 'Meeting Summary', view: 'meeting-summary' }
  ],
  'meeting-details': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'My Meetings', view: 'my-meetings' },
    { label: 'Meeting Details', view: 'meeting-details' }
  ],

  // BA in Action paths
  'ba-in-action-intro': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'BA in Action', view: 'ba-in-action-intro' }
  ],
  'ba-in-action-index': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'BA in Action', view: 'ba-in-action-index' }
  ],

  // Project Journey
  'career-journey': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Project Journey', view: 'career-journey' }
  ],
  'project-flow': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Project Journey', view: 'project-flow' }
  ],

  // Agile Hub paths
  'agile-hub': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Agile Hub', view: 'agile-hub' }
  ],
  'scrum-practice': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Agile Hub', view: 'agile-hub' },
    { label: 'Scrum Practice', view: 'scrum-practice' }
  ],

  // Meetings
  'my-meetings': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'My Meetings', view: 'my-meetings' }
  ],

  // Resources & Support
  'my-resources': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'My Resources', view: 'my-resources' }
  ],
  'support': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Support', view: 'support' }
  ],
  'contact-us': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Contact Us', view: 'contact-us' }
  ],
  'faq': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Support', view: 'support' },
    { label: 'FAQ', view: 'faq' }
  ],

  // Profile
  'profile': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'My Profile', view: 'profile' }
  ],

  // Cohort
  'my-cohort': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'My Cohort', view: 'my-cohort' }
  ],

  // Admin paths
  'admin': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Admin Dashboard', view: 'admin' }
  ],
  'admin-panel': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Admin Panel', view: 'admin-panel' }
  ],
  'admin-cohorts': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Cohort Manager', view: 'admin-cohorts' }
  ],
  'admin-contact-submissions': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Admin Panel', view: 'admin-panel' },
    { label: 'Contact Submissions', view: 'admin-contact-submissions' }
  ],

  // Community (if re-enabled)
  'community-hub': [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Community Hub', view: 'community-hub' }
  ]
};

/**
 * Get breadcrumb path for a view, with optional context awareness
 * If previousView is provided, it will insert it into the path
 */
export const getBreadcrumbs = (
  currentView: string, 
  previousView?: string
): BreadcrumbItem[] => {
  const baseBreadcrumbs = breadcrumbMapping[currentView] || [
    { label: 'Dashboard', view: 'dashboard' as AppView },
    { label: currentView, view: currentView as AppView }
  ];

  // If coming from career-journey, insert it before learning-flow
  if (previousView === 'career-journey' && baseBreadcrumbs.some(b => b.view === 'learning-flow')) {
    const newBreadcrumbs = [...baseBreadcrumbs];
    const learningIndex = newBreadcrumbs.findIndex(b => b.view === 'learning-flow');
    if (learningIndex > 0) {
      newBreadcrumbs.splice(learningIndex, 0, { 
        label: 'Project Journey', 
        view: 'career-journey' as AppView 
      });
    }
    return newBreadcrumbs;
  }

  return baseBreadcrumbs;
};

/**
 * Get the parent view (one level up) for a given view
 */
export const getParentView = (currentView: string): AppView | null => {
  const breadcrumbs = breadcrumbMapping[currentView];
  if (!breadcrumbs || breadcrumbs.length < 2) return null;
  return breadcrumbs[breadcrumbs.length - 2].view;
};

