import React, { useEffect, useState } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { AppView } from '../types';

// Map view names to their display titles
const viewTitleMap: Record<string, string> = {
  'dashboard': 'Dashboard',
  'learning-intro': 'Get Started',
  'learning-flow': 'Learning Journey',
  'practice-intro': 'Get Started',
  'practice-flow': 'Practice Journey',
  'ba-in-action-intro': 'Get Started',
  'ba-in-action-index': 'BA in Action',
  'project-flow': 'Project Journey',
  'career-journey': 'Project Journey',
  'core-learning': 'Core Learning',
  'project-initiation': 'Project Initiation',
  'stakeholder-mapping': 'Stakeholder Mapping',
  'elicitation': 'Requirements Elicitation',
  'process-mapper': 'Process Mapping',
  'requirements-engineering': 'Requirements Engineering',
  'solution-options': 'Solution Options',
  'documentation': 'Documentation',
  'design-hub': 'Design',
  'mvp-hub': 'MVP',
  'scrum-essentials': 'Agile & Scrum',
  'scrum-learning': 'Agile & Scrum',
  'scrum-practice': 'Scrum Practice',
  'agile-hub': 'Agile Hub',
  'projects': 'My Projects',
  'project-setup': 'Project Setup',
  'meeting': 'Meeting',
  'voice-only-meeting': 'Voice Meeting',
  'meeting-summary': 'Meeting Summary',
  'meeting-details': 'Meeting Details',
  'my-meetings': 'My Meetings',
  'my-resources': 'My Resources',
  'support': 'Support',
  'contact-us': 'Contact Us',
  'faq': 'FAQ',
  'profile': 'My Profile',
  'admin': 'Admin Dashboard',
  'admin-panel': 'Admin Panel',
  'admin-contact-submissions': 'Contact Submissions',
  'community-hub': 'Community Hub'
};

// Map Scrum Practice sub-pages
const scrumPracticeSubPages: Record<string, string> = {
  'backlog-refinement': 'Backlog Refinement',
  'sprint-planning': 'Sprint Planning',
  'daily-scrum': 'Daily Scrum',
  'sprint-review': 'Sprint Review',
  'sprint-retrospective': 'Sprint Retrospective'
};

const GlobalBreadcrumbs: React.FC = () => {
  const { currentView, setCurrentView } = useApp();
  const [breadcrumbTrail, setBreadcrumbTrail] = useState<AppView[]>([]);
  const [scrumSubPage, setScrumSubPage] = useState<string | null>(null);

  // Check for Scrum Practice sub-page
  useEffect(() => {
    const subPage = sessionStorage.getItem('scrum-practice-sub-page');
    setScrumSubPage(subPage);
  }, [currentView]);

  // Track navigation trail - build breadcrumbs based on actual navigation path
  useEffect(() => {
    if (!currentView) return;

    setBreadcrumbTrail((prev) => {
      const last = prev[prev.length - 1];
      
      // Prevent duplicates when same view is visited consecutively
      if (last === currentView) return prev;
      
      // Define root views that should reset the breadcrumb trail
      const rootViews: AppView[] = ['dashboard', 'learning-intro', 'practice-intro', 'ba-in-action-intro'];
      
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

  // Persist to sessionStorage for refresh
  useEffect(() => {
    if (breadcrumbTrail.length > 0) {
      sessionStorage.setItem('breadcrumbTrail', JSON.stringify(breadcrumbTrail));
    }
  }, [breadcrumbTrail]);

  // Restore on page reload
  useEffect(() => {
    const saved = sessionStorage.getItem('breadcrumbTrail');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBreadcrumbTrail(parsed);
        }
      } catch (e) {
        console.error('Failed to restore breadcrumb trail:', e);
      }
    }
  }, []);

  // Create enhanced breadcrumbs that include Scrum Practice sub-pages
  const enhancedBreadcrumbs = React.useMemo(() => {
    if (currentView === 'scrum-practice' && scrumSubPage) {
      return [...breadcrumbTrail, scrumSubPage as any];
    }
    return breadcrumbTrail;
  }, [breadcrumbTrail, currentView, scrumSubPage]);

  // Collapse breadcrumbs if more than 4 levels (2025 best practice: max 4 visible items)
  const shouldCollapse = enhancedBreadcrumbs.length > 4;
  const displayedBreadcrumbs = React.useMemo(() => {
    if (shouldCollapse) {
      return [
        enhancedBreadcrumbs[0],
        '...' as any,
        ...enhancedBreadcrumbs.slice(-2)
      ];
    }
    return enhancedBreadcrumbs;
  }, [enhancedBreadcrumbs, shouldCollapse]);

  const handleClick = (index: number) => {
    const target = breadcrumbTrail[index];
    if (target) {
      setCurrentView(target);
      // Trim the trail to this point
      setBreadcrumbTrail(breadcrumbTrail.slice(0, index + 1));
    }
  };

  // Hide breadcrumbs on pages that have their own internal breadcrumb systems
  const viewsWithOwnBreadcrumbs = ['voice-meeting-v2', 'documentation', 'documentation-practice'];
  if (viewsWithOwnBreadcrumbs.includes(currentView)) {
    return null;
  }

  // Don't show breadcrumbs on certain pages
  const hiddenViews: AppView[] = ['login', 'signup', 'welcome'];
  if (hiddenViews.includes(currentView)) {
    return null;
  }

  // Don't show if no breadcrumbs yet
  if (breadcrumbTrail.length === 0) {
    return null;
  }

  return (
    <nav
      className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm"
      aria-label="Breadcrumb navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol 
          className="flex items-center gap-1.5 py-3 text-sm overflow-x-auto scrollbar-hide"
          itemScope 
          itemType="https://schema.org/BreadcrumbList"
        >
          {displayedBreadcrumbs.map((view, index) => {
            const isEllipsis = view === '...';
            const isLast = index === displayedBreadcrumbs.length - 1;
            
            // For collapsed view, calculate actual index
            const actualIndex = shouldCollapse && index > 1 
              ? enhancedBreadcrumbs.length - (displayedBreadcrumbs.length - index)
              : index;
            
            // Handle Scrum Practice sub-page titles
            const displayLabel = isEllipsis 
              ? '...'
              : scrumPracticeSubPages[view as string] || viewTitleMap[view as string] || view
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase())
                .trim();

            return (
              <li
                key={index}
                className="flex items-center gap-1.5 shrink-0"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {index > 0 && (
                  <ChevronRight 
                    className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" 
                    aria-hidden="true"
                  />
                )}
                {isEllipsis ? (
                  <span 
                    className="text-gray-400 dark:text-gray-500 px-1"
                    aria-label="More items"
                  >
                    ...
                  </span>
                ) : (
                  <>
                    {index === 0 && view === 'dashboard' ? (
                      <button
                        onClick={() => !isLast && handleClick(actualIndex)}
                        disabled={isLast}
                        className={`flex items-center gap-1.5 transition-colors ${
                          isLast
                            ? 'text-gray-900 dark:text-white font-medium cursor-default'
                            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer'
                        }`}
                        aria-current={isLast ? 'page' : undefined}
                        aria-label={isLast ? 'Current page: Dashboard' : 'Navigate to Dashboard'}
                      >
                        <Home className="w-4 h-4" aria-hidden="true" />
                        <span itemProp="name">{displayLabel}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => !isLast && handleClick(actualIndex)}
                        disabled={isLast}
                        className={`transition-colors whitespace-nowrap max-w-[200px] truncate ${
                          isLast
                            ? 'text-gray-900 dark:text-white font-medium cursor-default'
                            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer'
                        }`}
                        aria-current={isLast ? 'page' : undefined}
                        aria-label={isLast ? `Current page: ${displayLabel}` : `Navigate to ${displayLabel}`}
                        title={displayLabel}
                      >
                        <span itemProp="name">{displayLabel}</span>
                      </button>
                    )}
                    <meta itemProp="position" content={String(index + 1)} />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default GlobalBreadcrumbs;
