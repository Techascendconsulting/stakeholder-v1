import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { AppView } from '../types';

// Map view names to their actual page titles (from h1 elements)
const viewTitleMap: Record<string, string> = {
  'project-initiation': '🚀 Project Initiation',
  'requirements-engineering': 'Requirements Engineering',
  'stakeholder-mapping': 'Stakeholder Mapping',
  'voice-meeting-v2': 'Voice Meeting',
  'meeting-mode-selection': 'Choose Your Meeting Mode',
  'projects': 'Choose Your Business Challenge',
  'project-brief': 'Project Brief', // Dynamic: shows selectedProject.name
  'stage-selection': 'Select Meeting Stage',
  'agile-scrum': 'Agile Hub',
  'scrum-practice': 'Scrum Practice',
  'career-journey': 'Project Lifecycle',
  'learning-flow': 'Learning Journey',
  'practice-flow': 'Practice Journey',
  'project-flow': 'Project Journey',
  'project-journey': 'Project Journey',
  'dashboard': 'Dashboard',
  'welcome': 'Welcome',
  'login': 'Login',
  'signup': 'Sign Up',
  'stakeholders': 'Stakeholder Selection',
  'training-practice': 'Meeting Preparation',
  'solution-options': 'Solution Options',
  'mvp-hub': 'Minimum Viable Product (MVP)',
  'notes': 'Meeting Notes & Analysis',
  'meeting-history': 'Meeting History',
  'interview-notes': 'Interview Notes',
  'individual-agent-meeting': 'Individual Agent Meeting',
  'custom-stakeholders': 'AI-Generated Stakeholders',
  'community-lounge': 'BA Community',
  'ba-academy': 'BA Academy',
  'analysis': 'Requirements Analysis',
  'deliverables': 'Deliverables Workspace',
  'profile': 'Profile Settings',
  'assessments': 'Assessments',
  'faq': 'How Can We Help You?',
  'contact-us': 'Get In Touch',
  'support-centre': 'How Can We Help You?',
  'admin-contact-submissions': 'Contact Submissions',
  'diagram-creation': 'Diagram Creation',
  'custom-project': 'Create Custom Project',
  'ba-reference-library': 'BA Reference Library',
  'training-hub': 'Training Hub',
  'training-assess': 'Training Assessment',
  'training-feedback': 'Training Feedback',
  'training-dashboard': 'Training Dashboard',
  'training-deliverables': 'Training Deliverables',
  'project-deliverables': 'Project Deliverables',
  'my-resources': 'My Resources',
  'progress-tracking': 'Progress Tracking',
  'project-workspace': 'Project Workspace',
  'portfolio': 'Portfolio',
  'create-project': 'Create Project',
  'ba-fundamentals': 'BA Fundamentals',
  'process-mapper': 'Process Mapper',
  'process-mapper-editor': 'Process Mapper Editor',
  'advanced-topics': 'Advanced Topics',
  'project-setup': 'Project Setup',
  'meeting': 'Meeting',
  'voice-only-meeting': 'Voice Only Meeting',
  'voice-meeting-simple': 'Voice Meeting Simple',
  'meeting-summary': 'Meeting Summary',
  'meeting-details': 'Meeting Details',
  'raw-transcript': 'Raw Transcript',
  'elevenlabs-meeting': 'ElevenLabs Meeting',
  'enhanced-training-flow': 'Enhanced Training Flow',
  'practice-hub-cards': 'Practice Hub Cards',
  'agile-practice': 'Agile Practice',
  'user-story-checker': 'User Story Checker',
  'admin': 'Admin Dashboard',
  'admin-panel': 'Admin Panel',
  'my-mentorship': 'My Mentorship',
  'book-session': 'Book Session',
  'mentor-feedback': 'Mentor Feedback',
  'career-coaching': 'Career Coaching',
  'my-progress-mentor': 'My Progress with Mentor',
  'support': 'Support Centre'
};

// Map Scrum Practice sub-pages to their titles
const scrumPracticeSubPages: Record<string, string> = {
  'backlog-refinement': 'Backlog Refinement',
  'sprint-planning': 'Sprint Planning',
  'daily-scrum': 'Daily Scrum',
  'sprint-review': 'Sprint Review',
  'sprint-retrospective': 'Sprint Retrospective'
};

// Format view name for display using actual page titles
function formatViewName(view: string): string {
  return viewTitleMap[view] || view
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

const GlobalBreadcrumbs: React.FC = () => {
  const { currentView, setCurrentView } = useApp();
  
  console.log('🍞 BREADCRUMBS DEBUG: currentView =', currentView);
  
  // Hide breadcrumbs on pages that have their own internal breadcrumb systems
  const viewsWithOwnBreadcrumbs = ['voice-meeting-v2', 'documentation', 'documentation-practice'];
  if (viewsWithOwnBreadcrumbs.includes(currentView)) {
    console.log('🍞 BREADCRUMBS DEBUG: Hiding global breadcrumbs for', currentView);
    return null;
  }
  
  console.log('🍞 BREADCRUMBS DEBUG: Showing global breadcrumbs for', currentView);
  
  const [breadcrumbs, setBreadcrumbs] = useState<AppView[]>([]);
  const [scrumSubPage, setScrumSubPage] = useState<string | null>(null);

  // Check for Scrum Practice sub-page in sessionStorage
  useEffect(() => {
    const scrumSubPage = sessionStorage.getItem('scrum-practice-sub-page');
    if (scrumSubPage) {
      setScrumSubPage(scrumSubPage);
    } else {
      setScrumSubPage(null);
    }
  }, [currentView]);

  // ✅ On view change, update trail & persist
  useEffect(() => {
    if (!currentView) return;

    setBreadcrumbs((prev) => {
      const last = prev[prev.length - 1];
      
      // Prevent duplicates when same view is visited consecutively
      if (last === currentView) return prev;
      
      // Define root views that should reset the breadcrumb trail
      const rootViews: AppView[] = ['learning-flow', 'practice-flow', 'project-flow', 'career-journey'];
      
      // If navigating to a root view, start fresh trail
      if (rootViews.includes(currentView)) {
        return [currentView];
      }
      
      // Check if user is going back to a previous view in the trail
      const existingIndex = prev.indexOf(currentView);
      if (existingIndex !== -1) {
        // User clicked a breadcrumb to go back - trim trail to that point
        return prev.slice(0, existingIndex + 1);
      }
      
      // Add new view to trail
      return [...prev, currentView];
    });
  }, [currentView]);

  // ✅ Persist to sessionStorage for refresh
  useEffect(() => {
    if (breadcrumbs.length > 0) {
      sessionStorage.setItem('breadcrumbTrail', JSON.stringify(breadcrumbs));
    }
  }, [breadcrumbs]);

  // ✅ Restore on page reload
  useEffect(() => {
    const saved = sessionStorage.getItem('breadcrumbTrail');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBreadcrumbs(parsed);
        }
      } catch (e) {
        console.error('Failed to restore breadcrumb trail:', e);
      }
    }
  }, []);

  // Create enhanced breadcrumbs that include Scrum Practice sub-pages
  const enhancedBreadcrumbs = React.useMemo(() => {
    if (currentView === 'scrum-practice' && scrumSubPage) {
      // Add the sub-page to the breadcrumbs
      return [...breadcrumbs, scrumSubPage as any];
    }
    return breadcrumbs;
  }, [breadcrumbs, currentView, scrumSubPage]);

  const handleClick = (index: number) => {
    const target = breadcrumbs[index];
    if (target) {
      setCurrentView(target);
      // Trim the trail to this point
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
  };

  // Don't show breadcrumbs on certain pages
  const hiddenViews: AppView[] = ['login', 'signup', 'welcome'];
  if (hiddenViews.includes(currentView)) {
    return null;
  }
  
  // Don't show if no breadcrumbs yet
  if (breadcrumbs.length === 0) {
    return null;
  }

  // Collapse breadcrumbs if more than 4 levels
  const shouldCollapse = enhancedBreadcrumbs.length > 4;
  const displayedBreadcrumbs = shouldCollapse
    ? [enhancedBreadcrumbs[0], '...', ...enhancedBreadcrumbs.slice(-2)]
    : enhancedBreadcrumbs;

  return (
    <nav
      className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 transition-all"
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {displayedBreadcrumbs.map((view, index) => {
          const isEllipsis = view === '...';
          const isLast = index === displayedBreadcrumbs.length - 1;
          const actualIndex = shouldCollapse && index > 1 
            ? enhancedBreadcrumbs.length - (displayedBreadcrumbs.length - index)
            : index;

          // Handle Scrum Practice sub-page titles
          const displayTitle = scrumPracticeSubPages[view as string] || formatViewName(view as string);

          return (
            <li key={isEllipsis ? 'ellipsis' : index} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
              )}
              {isEllipsis ? (
                <span className="text-gray-400 dark:text-gray-600 cursor-default">...</span>
              ) : (
                <button
                  onClick={() => !isLast && handleClick(actualIndex)}
                  disabled={isLast}
                  className={`capitalize transition-colors ${
                    isLast
                      ? 'text-gray-900 dark:text-white font-semibold cursor-default'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {displayTitle}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default GlobalBreadcrumbs;

